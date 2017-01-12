'use strict';
var Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const PHONE_NUMBER = '16143275066'; // change it to your phone number
const D = "-------------------------------------------------------------------------------------------";

var recipientName;
var recipientNumber;

var states = {
    ADDNAME: '_ADDNAME',
    ADDPHONE: '_ADDPHONE',
    ADDCONTACT: '_ADDCONTACT',
    SENDMESSAGE: '_SENDMESSAGE',
};

var sessionHandlers = {
    "LaunchRequest": function() {
        console.log(D + "LAUNCH REQUEST");
        //USER LAUNCHED THE SKILL.  CHANGE THEIR STATE, AND MOVE THEM TO THE BEGININTENT FUNCTION.
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "AddPhoneIntent": function () {
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AddNameIntent": function () {
        this.handler.state = states.ADDNAME;
        this.emitWithState('AddNameIntent');
    },
    "AMAZON.HelpIntent": function() {
        console.log(D + "HELP INTENT WITH NO STATE.");
        this.emit(":ask", getRandomString(this.t("HELP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT WITH NO STATE");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.CancelIntent": function() {
        console.log(D + "CANCEL INTENT WITH NO STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT WITH NO STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
}

var sessionHandlersForName = Alexa.CreateStateHandler(states.ADDNAME,{
    "BeginIntent": function() {
        console.log(D + "BEGIN INTENT WITH ADD NAME STATE.");
        //INITIAL MESSAGE FROM THE SKILL, WELCOMING THE USER, AND ASKING WHO THEY WANT TO SEND A MESSAGE TO.
        this.emit(":ask", getRandomString(this.t("WELCOME_MESSAGE")), getRandomString(this.t("WELCOME_MESSAGE")));
    },
    "AddNameIntent": function() {
        console.log(D + "ADD NAME INTENT WITH ADD NAME STATE.");
        //WHEN THE USER PROVIDES A NAME, THIS INTENT CATCHES AND SAVES THAT NAME BEFORE PROMPTING FOR A PHONE NUMBER.
        if (this.event.request.intent.slots.firstname !== undefined)
        {
            var firstname = this.event.request.intent.slots.firstname.value;
            this.attributes["recipientName"] = firstname;
            console.log(D + "RECEIVED THE RECIPIENT NAME: " + firstname);
            //TODO: WHAT IF THEY HAVE ALREADY SAVED A CONTACT?  WE SHOULD ASK THEM IF THEY WANT TO USE AN EXISTING CONTACT.
            this.emit(":ask", getRandomStringWithReplace(this.t("NAME_CONFIRMATION"), this.attributes["recipientName"]), getRandomStringWithReplace(this.t("NAME_CONFIRMATION"), this.attributes["recipientName"]));
        }
        else
        {
            console.log(D + "DID NOT RECEIVE A NAME VALUE.");
            //IF WE LANDED HERE WITHOUT A NAME VALUE, APOLOGIZE, AND ASK AGAIN.
            this.emit(":ask", getRandomString(this.t("NAME_MISUNDERSTANDING")), getRandomString(this.t("NAME_MISUNDERSTANDING")));
        }
    },
    "AddPhoneIntent": function () {
        console.log(D + "ADD PHONE INTENT WITH ADD NAME STATE.");
        //LANDED HERE WITH THE WRONG STATE.  CHANGING STATE, MOVING THEM THERE.
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AMAZON.HelpIntent": function()
    {
        console.log(D + "HELP INTENT WITH ADD NAME STATE.");
        this.emit(":ask", getRandomString(this.t("HELP_MESSAGE")));
    },
    "AMAZON.YesIntent": function()
    {
        console.log("YES INTENT WITH ADDNAME STATE");
        this.handler.state = states.ADDPHONE;
        this.emit(":ask", getRandomStringWithReplace(this.t("PHONE_REQUEST"), this.attributes["recipientName"]));
    },
    "AMAZON.NoIntent": function()
    {
        console.log("NO INTENT WITH ADDNAME STATE");
        this.emit(":ask", getRandomString(this.t("NAME_MISUNDERSTANDING")));
    },
    "AMAZON.CancelIntent": function()
    {
        console.log(D + "CANCEL INTENT WITH ADD NAME STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT WITH ADD NAME STATE.");
        this.emit(":tell", getRandomString(this.t("HELP_MESSAGE")));
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT WITH ADD NAME STATE.");
        this.emit("AMAZON.HelpIntent");
    },
});

var sessionHandlersForPhone = Alexa.CreateStateHandler(states.ADDPHONE,{
    "AddPhoneIntent": function() {
        console.log(D + "STATE: ADDPHONE - AddPhoneIntent REQUESTED.");
        var phonenumber = this.event.request.intent.slots.phonenumber.value;
        var phonenumberspeech = buildPhoneNumberSpeech(phonenumber);
        //TODO: DETERMINE IF THE PHONE NUMBER IS A VALID LENGTH.
        if (phonenumber.length == 10)
        {
            this.attributes["recipientNumber"] = phonenumber;
            this.emit(":ask", "Got it.  I heard " + phonenumberspeech + ".  Is that correct?");
        }
        else
        {
            this.emit(":ask", "That didn't seem to be a valid mobile phone number.  I heard " + phonenumberspeech + ".  Can you try " + this.attributes["recipientName"] + "'s mobile number again?");
        }
        
    },
    "AddNameIntent": function () {
        //LANDED HERE WITH THE WRONG STATE.  CHANGING STATE, MOVING THEM THERE.
        console.log(D + "ADDNAMEINTENT WITH ADDPHONE STATE.  REASSIGNING TO ADDNAME STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState('AddNameIntent');
    },
    "AMAZON.YesIntent": function()
    {
        console.log(D + "USER CONFIRMED MOBILE NUMBER IS CORRECT.  YESINTENT WITH ADDPHONE STATE.");
        this.handler.state = states.ADDCONTACT;
        this.emitWithState('AddContactIntent');
    },
    "AMAZON.NoIntent": function()
    {
        console.log(D + "NO INTENT DETECTED IN ADD PHONE STATE.");
        this.emit(":ask", "What is " + this.attributes["recipientName"] + "'s mobile phone number?");
    },
    "AMAZON.CancelIntent": function()
    {
        console.log(D + "CANCEL INTENT DETECTED IN ADDPHONE STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT REQUESTED.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT DETECTED IN ADDPHONE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
});

var sessionHandlersForContact = Alexa.CreateStateHandler(states.ADDCONTACT,{
    "AddContactIntent": function () {
        console.log(D + "ASKING THE USER IF THEY WOULD LIKE TO SAVE THIS CONTACT.");
        this.emit(":ask", "Would you like to save " + this.attributes["recipientName"] + " as a favorite contact?");
        //this.handler.state = states.ADDNAME;
        //this.emitWithState('AddNameIntent');
    },
    "AMAZON.YesIntent": function()
    {
        //USER WANTS TO SAVE THIS CONTACT AS A FAVORITE.  DO IT.
        console.log(D + "USER WANTS TO SAVE CONTACT AS FAVORITE.");
        addFavorite(this);
        this.handler.state = states.SENDMESSAGE;
        this.emit(":ask", "OK.  I've saved " + this.attributes["recipientName"] + " to your contacts.  Would you like to send a message to " + this.attributes["recipientName"] + "?");
    },
    "AMAZON.NoIntent": function()
    {
        console.log(D + "USER DOES NOT WANT TO SAVE CONTACT AS FAVORITE.");
        this.handler.state = states.SENDMESSAGE;
        this.emit(":ask", "OK.  I won't save " + this.attributes["recipientName"] + " to your contacts.  Would you still like to send a message to " + this.attributes["recipientName"] + "?");
    },
    "AMAZON.CancelIntent": function()
    {
        console.log(D + "CANCEL INTENT DETECTED IN ADD CONTACT STATE.");
        this.emit(":tell", "You said cancel with ADD CONTACT state. Goodbye!");
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT REQUESTED WITH ADD CONTACT STATE.");
        this.emit(":tell", "You said STOP with ADD CONTACT state. Goodbye!");
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT DETECTED IN ADD CONTACT STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "LaunchRequest": function(){
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
});

var sessionHandlersForMessage = Alexa.CreateStateHandler(states.SENDMESSAGE,{
    "SendMessageIntent": function () {
        console.log(D + "STARTING THE SENDMESSAGE CONVERSATION.");
        this.emit(":ask", "What kind of message would you like to send?  Happy, Sad, or Angry?");
    },
    "AMAZON.YesIntent": function()
    {
        console.log(D + "YES INTENT WITH SEND MESSAGE STATE.");
        this.emit(":tell", "You confirmed that you would like to send a message.  We're still building that part.");
    },
    "AMAZON.NoIntent": function()
    {
        console.log(D + "NO INTENT WITH SEND MESSAGE STATE.")
        this.emit(":tell", "You did not want to send a message.  We're still building this part.")
    },
    "AMAZON.CancelIntent": function()
    {
        console.log(D + "CANCEL INTENT DETECTED IN SEND MESSAGE STATE.");
        this.emit(":tell", "You said cancel with SEND MESSAGE state. Goodbye!");
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT REQUESTED WITH SEND MESSAGE STATE.");
        this.emit(":tell", "You said STOP with SEND MESSAGE state. Goodbye!");
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT DETECTED IN SEND MESSAGE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
});

function addFavorite(nowThis)
{
    console.log(D + "ADDING FAVORITE.");
    if (nowThis.attributes["favorites"] !== undefined)
    {
        var favoriteArray = nowThis.attributes["favorites"];
        console.log(favoriteArray);
        console.log(favoriteArray.length);
        nowThis.emit(":tell", "Your array currently has " + favoriteArray.length + " items.");
    }
    else
    {
        var favoriteArray = {firstname: nowThis.attributes["recipientName"], phonenumber: nowThis.attributes["recipientNumber"]};
        nowThis.attributes["favorites"] = favoriteArray;
    }
    
    console.log(D + "FAVORITE ADDED.");
}

function deleteFavorite()
{

}
/*
    ,
    ,
    "ChooseMessageIntent": function()
    {
        this.emit(":tell", "You are now trying to choose a message.")
    },
    "AMAZON.YesIntent": function()
    {

    },
    "AMAZON.NoIntent": function()
    {

    },
    "SendHateIntent": function() {
        console.log(`Sending SMS to ${PHONE_NUMBER}`);
        //const payload = JSON.stringify(event);

        var firstname = this.event.request.intent.slots.firstname.value;

        const params = {
            PhoneNumber: PHONE_NUMBER,
            Message: `Alexa just wanted to remind you that ` + firstname + " hates you.  Have a nice day!",
        };
        // result will go to function callback
        var parentOfThis = this;
        //this.attributes["hatename"] = firstname;
        SNS.publish(params, function(err, data) {
            if (err) {
                console.log(err.stack);
                return;
        }
        else {console.log("IT WORKED");
            parentOfThis.emit(":tell", "Thanks, " + firstname + "!  Eaton has received your hate. Have a great day!");}
        });
    }
}
*/
function getRandomString(stringArray)
{
    var arrayIndex = Math.floor(Math.random() * stringArray.length);
    return stringArray[arrayIndex];
}

function getRandomStringWithReplace(stringArray, replacement)
{
    var response = getRandomString(stringArray);
    return response.replace("XXXXXXXXXX", replacement);
}

function buildPhoneNumberSpeech(phonenumber)
{
    return "<say-as interpret-as='spell-out'>" + phonenumber.substring(0,3) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(3,6) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(6,8) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(8,10) + "</say-as>";
}

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = undefined;
    alexa.dynamoDBTableName = "SendToFriend";
    alexa.resources = languageStrings;
    alexa.registerHandlers(sessionHandlers, sessionHandlersForName, sessionHandlersForPhone, sessionHandlersForContact, sessionHandlersForMessage);
    alexa.execute();
};

var languageStrings = {
    "en-GB": {
        "translation": {
            "WELCOME_MESSAGE" : [       "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  Who would you like to send a message to?",
                                        "This is Send to Friend!  Who would you like to send an SMS message to?",
                                        "To whom would you like to send a message on this fine day?"],
            "NAME_CONFIRMATION" : [     "XXXXXXXXXX<break strength='strong'></break>Is that correct?",
                                        "XXXXXXXXXX<break strength='strong'></break>Got it.  Did I say it right?",
                                        "XXXXXXXXXX<break strength='strong'></break>Is that right?",
                                        "OK.  We're sending a message to XXXXXXXXXX.  Is that correct?"],
            "NAME_MISUNDERSTANDING":[   "I'm sorry.  What is the name of the person you're trying to send a message to?",
                                        "Whoops.  My mistake.  Which name did you want to use?",
                                        "My bad.  Still learning.  Who do you want to send a message to?"],
            "GET_FACT_MESSAGE" : "Here's your fact: ",
            "HELP_MESSAGE" : "You can say tell me a space fact, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT" : "What can I help you with?",
            "STOP_MESSAGE" : [          "Goodbye!", "OK.  We can try again some other time.", "Bye bye!"]
        }
    },
    "en-US": {
        "translation": {
            "WELCOME_MESSAGE" : [       "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  Who would you like to send a message to?",
                                        "This is Send to Friend!  Who would you like to send an SMS message to?",
                                        "To whom would you like to send a message on this fine day?"],
            "NAME_CONFIRMATION" : [     "XXXXXXXXXX<break strength='strong'/>Is that correct?",
                                        "XXXXXXXXXX<break strength='strong'/>Got it.  Did I say it right?",
                                        "XXXXXXXXXX<break strength='strong'/>Is that right?",
                                        "OK.  We're sending a message to XXXXXXXXXX.  Is that correct?"],
            "NAME_MISUNDERSTANDING":[   "I'm sorry.  What is the name of the person you're trying to send a message to?",
                                        "Whoops.  My mistake.  Which name did you want to use?",
                                        "My bad.  Still learning.  Who do you want to send a message to?"],
            "PHONE_REQUEST" : [         "Perfect. What is XXXXXXXXXX's mobile phone number?",
                                        "Which mobile phone number do you want to use for XXXXXXXXXX?",
                                        "What mobile number should I use to send a message to XXXXXXXXXX?"],
            "HELP_MESSAGE" : "You can say tell me a space fact, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT" : "What can I help you with?",
            "STOP_MESSAGE" : [          "Goodbye!", "OK.  We can try again some other time.", "Bye bye!"]
        }
    },
    "de-DE": {
        "translation": {
            "WELCOME_MESSAGE" : [       "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  Who would you like to send a message to?",
                                        "This is Send to Friend!  Who would you like to send an SMS message to?",
                                        "To whom would you like to send a message on this fine day?"],
            "NAME_CONFIRMATION" : [     "XXXXXXXXXX<break strength='strong'></break>Is that correct?",
                                        "XXXXXXXXXX<break strength='strong'></break>Got it.  Did I say it right?",
                                        "XXXXXXXXXX<break strength='strong'></break>Is that right?"],
            "NAME_MISUNDERSTANDING":[   "I'm sorry.  What is the name of the person you're trying to send a message to?",
                                        "Whoops.  My mistake.  Which name did you want to use?",
                                        "My bad.  Still learning.  Who do you want to send a message to?"],
            "GET_FACT_MESSAGE" : "Hier sind deine Fakten: ",
            "HELP_MESSAGE" : "Du kannst sagen, „Nenne mir einen Fakt über den Weltraum“, oder du kannst „Beenden“ sagen... Wie kann ich dir helfen?",
            "HELP_REPROMPT" : "Wie kann ich dir helfen?",
            "STOP_MESSAGE" : [          "Goodbye!", "OK.  We can try again some other time.", "Bye bye!"]
        }
    }
};
