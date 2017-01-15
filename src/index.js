'use strict';
var Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const D = "-------------------------------------------------------------------------------------------";

var states = {
    ADDUSER: '_ADDUSER',
    ADDNAME: '_ADDNAME',
    ADDPHONE: '_ADDPHONE',
    ADDCONTACT: '_ADDCONTACT',
    SENDMESSAGE: '_SENDMESSAGE',
};

var sessionHandlers = {
    "LaunchRequest": function() {
        console.log("LAUNCH REQUEST.  STARTING THE SKILL.");
        //USER LAUNCHED THE SKILL.  CHANGE THEIR STATE, AND MOVE THEM TO THE BEGININTENT FUNCTION.
        this.handler.state = states.ADDUSER;
        this.emitWithState("StartsHere");
    },
    "AMAZON.HelpIntent": function() {
        console.log("HELP INTENT WITH NO STATE.");
        this.emit(":ask", getRandomString(this.t("HELP_MESSAGE")), getRandomString(this.t("HELP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log("STOP INTENT WITH NO STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCEL INTENT WITH NO STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StartOverIntent": function() {
        console.log("START OVER INTENT WITH NO STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "Unhandled": function() {
        console.log("UNHANDLED WITH NO STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
}

var sessionHandlersForUser = Alexa.CreateStateHandler(states.ADDUSER,{
    "StartsHere": function() {
        console.log(D + "STARTS HERE INTENT IN ADD USER STATE.");
        //IF WE ALREADY KNOW THE USER'S NAME, SKIP THIS STEP.
        if (this.attributes["recipientName"] !== undefined)
        {
            console.log(D + "WE ALREADY KNOW THE USER'S NAME IN ADD USER STATE.");
            this.handler.state = states.ADDNAME;
            this.emitWithState("BeginIntent");
        }
        else
        {
            //INITIAL MESSAGE FROM THE SKILL, WELCOMING THE USER, AND ASKING WHAT THEIR NAME IS.
            console.log(D + "WE NEED TO COLLECT THE USER'S NAME IN ADD USER STATE.");
            this.emit(":ask", getRandomString(this.t("USER_REQUEST")), getRandomString(this.t("USER_REQUEST")));
        }
    },
    "AddNameIntent": function() {
        console.log(D + "ADD NAME INTENT IN ADD USER STATE.");
        var firstname = this.event.request.intent.slots.firstname.value;
        console.log("RECEIVED SENDER NAME: " + firstname);
        this.attributes["senderName"] = firstname;
        this.emit(":ask", getRandomStringWithReplace(this.t("USER_CONFIRMATION"), this.attributes["senderName"]), getRandomStringWithReplace(this.t("USER_CONFIRMATION"), this.attributes["sender"]));
    },
    "AMAZON.YesIntent": function() {
        console.log("YES INTENT WITH ADD USER STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "AMAZON.NoIntent": function() {
        console.log("NO INTENT WITH ADD USER STATE.");
        //USER INDICATED THAT USER'S NAME WAS INCORRECT.  ASK FOR USER'S NAME AGAIN.
        this.emit(":ask", getRandomString(this.t("USER_MISUNDERSTANDING")), getRandomString(this.t("USER_MISUNDERSTANDING")));
    },
    "AMAZON.HelpIntent": function() {
        console.log("HELP INTENT WITH ADD USER STATE.");
        this.emit(":ask", getRandomString(this.t("HELP_MESSAGE")), getRandomString(this.t("HELP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log("STOP INTENT WITH ADD USER STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCEL INTENT WITH ADD USER STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StartOverIntent": function() {
        console.log("START OVER INTENT WITH ADD USER STATE.");
        this.handler.state = states.ADDUSER;
        this.emitWithState("BeginIntent");
    },
    "Unhandled": function() {
        console.log("UNHANDLED WITH ADD USER STATE.");
        this.handler.state = states.ADDUSER;
        this.emitWithState("BeginIntent");
    }
});

var sessionHandlersForName = Alexa.CreateStateHandler(states.ADDNAME,{
    "BeginIntent": function() {
        console.log("BEGIN INTENT WITH ADD NAME STATE.");
        //INITIAL MESSAGE FROM THE SKILL, WELCOMING THE USER, AND ASKING WHO THEY WANT TO SEND A MESSAGE TO.
        this.emit(":ask", getRandomStringWithReplace(this.t("NAME_REQUEST"), this.attributes["senderName"]), getRandomStringWithReplace(this.t("NAME_REQUEST"), this.attributes["senderName"]));
    },
    "AddNameIntent": function() {
        console.log("ADD NAME INTENT WITH ADD NAME STATE.");
        //WHEN THE USER PROVIDES A NAME, THIS INTENT CATCHES AND SAVES THAT NAME BEFORE PROMPTING FOR A PHONE NUMBER.
        if (this.event.request.intent.slots.firstname !== undefined)
        {
            var firstname = this.event.request.intent.slots.firstname.value;
            console.log("RECEIVED RECIPIENT NAME: " + firstname);
            this.attributes["recipientName"] = firstname;
            //TODO: WHAT IF THEY HAVE ALREADY SAVED A CONTACT?  WE SHOULD ASK THEM IF THEY WANT TO USE AN EXISTING CONTACT.
            this.emit(":ask", getRandomStringWithReplace(this.t("NAME_CONFIRMATION"), this.attributes["recipientName"]), getRandomStringWithReplace(this.t("NAME_CONFIRMATION"), this.attributes["recipientName"]));
        }
        else
        {
            console.log("MISUNDERSTOOD RECIPIENT NAME WITH ADD NAME STATE.");
            //IF WE LANDED HERE WITHOUT A NAME VALUE, APOLOGIZE, AND ASK AGAIN.
            this.emit(":ask", getRandomString(this.t("NAME_MISUNDERSTANDING")), getRandomString(this.t("NAME_MISUNDERSTANDING")));
        }
    },
    "AddPhoneIntent": function () {
        console.log("ADD PHONE INTENT WITH ADD NAME STATE.");
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AMAZON.HelpIntent": function()
    {
        console.log("HELP INTENT WITH ADD NAME STATE.");
        this.emit(":ask", getRandomString(this.t("HELP_MESSAGE")), getRandomString(this.t("HELP_MESSAGE")));
    },
    "AMAZON.YesIntent": function()
    {
        console.log("YES INTENT WITH ADD NAME STATE.");
        //USER CONFIRMED THAT NAME IS CORRECT.  NOW PROMPT FOR PHONE NUMBER.
        this.handler.state = states.ADDPHONE;
        this.emit(":ask", getRandomStringWithReplace(this.t("PHONE_REQUEST"), this.attributes["recipientName"]));
    },
    "AMAZON.NoIntent": function()
    {
        console.log("NO INTENT WITH ADD NAME STATE.");
        //USER INDICATED THAT NAME WAS INCORRECT.  ASK FOR NAME AGAIN.
        this.emit(":ask", getRandomString(this.t("NAME_MISUNDERSTANDING")), getRandomString(this.t("NAME_MISUNDERSTANDING")));
    },
    "AMAZON.CancelIntent": function()
    {
        console.log("CANCEL INTENT WITH ADD NAME STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log("STOP INTENT WITH ADD NAME STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StartOverIntent": function() {
        console.log("START OVER INTENT WITH ADD NAME STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "Unhandled": function() {
        console.log("UNHANDLED WITH ADD NAME STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
});

var sessionHandlersForPhone = Alexa.CreateStateHandler(states.ADDPHONE,{
    "AddPhoneIntent": function() {
        console.log("ADD PHONE INTENT WITH ADD PHONE STATE.");
        var phonenumber = this.event.request.intent.slots.phonenumber.value;
        console.log("RECEIVED RECIPIENT PHONE NUMBER: " + phonenumber);
        var phonenumberspeech = buildPhoneNumberSpeech(phonenumber);
        if (phonenumber.length == 10)
        {
            console.log("PHONE NUMBER WAS 10 DIGITS LONG.  PASSED VERIFICATION.");
            this.attributes["recipientNumber"] = phonenumber;
            this.emit(":ask", getRandomStringWithReplace(this.t("PHONE_CONFIRMATION"), phonenumberspeech), getRandomStringWithReplace(this.t("PHONE_CONFIRMATION"), phonenumberspeech));
        }
        else
        {
            console.log("PHONE NUMBER WAS NOT 10 DIGITS.  FAILED VERIFICATION. ASK FOR IT AGAIN.");
            this.emit(":ask", getRandomStringWithReplaceTwo(this.t("PHONE_MISUNDERSTANDING"), phonenumber, this.attributes["recipientName"]), getRandomStringWithReplaceTwo(this.t("PHONE_MISUNDERSTANDING"), phonenumber, this.attributes["recipientName"]));
        }  
    },
    "AddNameIntent": function () {
        console.log("ADD NAME INTENT WITH ADD PHONE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState('AddNameIntent');
    },
    "AMAZON.YesIntent": function()
    {
        console.log("YES INTENT WITH ADD PHONE STATE.");
        //USER CONFIRMED MOBILE NUMBER IS CORRECT.
        this.handler.state = states.SENDMESSAGE;
        this.emitWithState('SendMessageIntent');
        //this.handler.state = states.ADDCONTACT;
        //this.emitWithState('AddContactIntent');
    },
    "AMAZON.NoIntent": function()
    {
        console.log("NO INTENT WITH ADD PHONE STATE.");
        //USER INDICATED MOBILE NUMBER IS INCORRECT.  REQUEST THE NUMBER AGAIN.
        this.emit(":ask", getRandomStringWithReplace(this.t("PHONE_RETRY"), this.attributes["recipientName"]), getRandomStringWithReplace(this.t("PHONE_RETRY"), this.attributes["recipientName"]));
    },
    "AMAZON.CancelIntent": function()
    {
        console.log("CANCEL INTENT WITH ADD PHONE STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log("STOP INTENT WITH ADD PHONE STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StartOverIntent": function() {
        console.log("START OVER INTENT WITH ADD PHONE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "Unhandled": function() {
        console.log("UNHANDLED INTENT WITH ADD PHONE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
});

/*
var sessionHandlersForContact = Alexa.CreateStateHandler(states.ADDCONTACT,{
    "AddContactIntent": function () {
        console.log(D + "ASKING THE USER IF THEY WOULD LIKE TO SAVE THIS CONTACT.");
        this.emit(":ask", "Would you like to save " + this.attributes["recipientName"] + " as a favorite contact?");
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
*/

var sessionHandlersForMessage = Alexa.CreateStateHandler(states.SENDMESSAGE,{
    "SendMessageIntent": function () {
        console.log("SEND MESSAGE INTENT WITH SEND MESSAGE STATE.");
        //USER WANTS TO SEND A MESSAGE.  FIRST, WE HAVE TO FIGURE OUT WHAT KIND OF MESSAGE THEY WANT TO SEND.
        //this.emit(":ask", "I can send four types of messages to " + this.attributes["recipientName"] + ".  What type of message would you like to send?  a Reminder, a Hello, a Miss You, or a Love You?");
        this.emit(":ask", "I can send four types of messages to " + this.attributes["recipientName"] + ".  Would you like to create one now?");
    },
    "AMAZON.YesIntent": function()
    {
        console.log("YES INTENT WITH SEND MESSAGE STATE.");
        //USER WANTS TO SEND A MESSAGE.  PRESENT THEM WITH THEIR OPTIONS.
        this.emit(":ask", "Awesome!  What kind of message do you want to create?  A Reminder, a Hello, a Miss You, or an I Love You?");
    },
    "AMAZON.NoIntent": function()
    {
        console.log("NO INTENT WITH SEND MESSAGE STATE.");
        //USER DOESN'T WANT TO SEND A MESSAGE AFTER GETTING THIS FAR.  EXIT SKILL.
        this.emit(":tell", "We have gotten this far, and you want to quit?  OK.  Goodbye!");
    },
    "ReminderMessageIntent": function() {
        console.log("REMINDER MESSAGE INTENT WITH SEND MESSAGE STATE.");
        if (this.event.request.intent.slots.noun.value !== undefined)
        {
            var noun = this.event.request.intent.slots.noun.value;
            console.log("SEND REMINDER INTENT: NOUN PROVIDED: " + noun);
            var imageObj = {smallImageUrl: reminderImageUrlSmall, largeImageUrl: reminderImageUrlLarge};
            var messageOutput = getRandomStringWithReplaceTwo(this.t("REMINDER_MESSAGE"), noun, this.attributes["senderName"]);
            var speechPrefix = getRandomStringWithReplace(this.t("MESSAGE_SENT"), this.attributes["recipientName"]);
            var speechOutput = speechPrefix + "<break strength='strong'/>" + messageOutput + "<break strength='x-strong'/>Thanks for using Send To Friend! Goodbye!";
            var textOutput = speechPrefix + " " + messageOutput + " Thanks for using Send To Friend! Goodbye!";
            var params = {PhoneNumber: "1" + this.attributes["recipientNumber"], Message: messageOutput};
            

            SNS.publish(params, function(err,data){});
            this.emit(":tellWithCard", speechOutput, "Message Sent To " + this.attributes["recipientName"] + " (" + this.attributes["recipientNumber"] + ")", textOutput, imageObj);
            /*
            var parentOfThis = this;
            SNS.publish(params, function(err, data)
            {
                if (err) {parentOfThis.emit(":ask", "Something happened while I was sending that text message.  Would you like to try again?");}
                else
                {
                    console.log("SNS DATA: " + data.MessageId);
                    console.log("SENDING TEXT MESSAGE.  speechOutput = " + speechOutput + ", Message Sent To " + parentOfThis.attributes["recipientName"] + " (" + parentOfThis.attributes["recipientNumber"] + "), textOutput = " + textOutput + ", imageObj = " + imageObj);
                    parentOfThis.emit(":tellWithCard", speechOutput, "Message Sent To " + parentOfThis.attributes["recipientName"] + " (" + parentOfThis.attributes["recipientNumber"] + ")", textOutput, imageObj);
                }
            });
            */
        }
        else
        {
            console.log("USER IS ASKED WHAT THEY WANT TO REMIND RECIPIENT ABOUT.")
            //USER WANTS TO REMIND RECIPIENT ABOUT SOMETHING.  FIND OUT WHAT THAT SOMETHING IS.
            this.emit(":ask", "What would you like to remind " + this.attributes["recipientName"] + " about?");
        }
    },
    "HelloMessageIntent": function() {
        this.emit(":tellWithCard", "HI!  THIS WORKED!");
        //"OK.  I just sent " + this.attributes["recipientName"] + " this message<break strength='x-strong'/>" + this.attributes["recipientName"] + ", don't forget about " + this.event.request.intent.slots.noun.value + "!  From, " + this.attributes["senderName"] + "/n/nSent by Alexa and Send To Friend."
    },
    "MissYouMessageIntent": function() {
        
    },
    "LoveYouMessageIntent": function() {
        var imageObj = {smallImageUrl: loveImageUrlSmall, largeImageUrl: loveImageUrlLarge};
        var messageOutput = getRandomString(this.t("LOVE_MESSAGE"));
        var speechOutput = getRandomStringWithReplace(this.t("MESSAGE_SENT"), this.attributes["recipientName"]) + "<break strength='strong'/>" + messageOutput + "<break strength='x-strong'/>Thanks for using Send To Friend! Goodbye!";
        var textOutput = speechOutput.replace("<break strength='strong'/>", " ");
        var params = {PhoneNumber: "1" + this.attributes["recipientNumber"], Message: messageOutput};
        var parentOfThis = this;
        SNS.publish(params, function(err, data)
        {
            if (err) {parentOfThis.emit(":ask", "Something happened while I was sending that text message.  Would you like to try again?");}
            else {parentOfThis.emit(":tellWithCard", speechOutput, "Message Sent To " + parentOfThis.attributes["recipientName"] + " (" + parentOfThis.attributes["recipientNumber"] + ")", textOutput, imageObj);}
        });
    },
    "AMAZON.CancelIntent": function()
    {
        console.log("CANCEL INTENT WITH SEND MESSAGE STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StopIntent": function() {
        console.log("STOP INTENT WITH SEND MESSAGE STATE.");
        this.emit(":tell", getRandomString(this.t("STOP_MESSAGE")));
    },
    "AMAZON.StartOverIntent": function() {
        console.log("START OVER INTENT WITH SEND MESSAGE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "Unhandled": function() {
        console.log("UNHANDLED INTENT WITH SEND MESSAGE STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    }
});

/*
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
    console.log("GETTING RANDOM STRING.");
    var arrayIndex = Math.floor(Math.random() * stringArray.length);
    console.log(stringArray[arrayIndex]);
    return stringArray[arrayIndex];
}

function getRandomStringWithReplace(stringArray, replacement)
{
    console.log("GETTING RANDOM STRING WITH REPLACE.");
    var response = getRandomString(stringArray);
    console.log(response.replace("XXXXXXXXXX", replacement));
    return response.replace("XXXXXXXXXX", replacement);
}

function getRandomStringWithReplaceTwo(stringArray, replacement, replacement2)
{
    console.log("GETTING RANDOM STRING WITH REPLACE TWO.")
    var response = getRandomString(stringArray);
    response = response.replace("XXXXXXXXXX", replacement);
    console.log(response.replace("YYYYYYYYYY", replacement2));
    return response.replace("YYYYYYYYYY", replacement2);
}

function buildPhoneNumberSpeech(phonenumber)
{
    console.log("BUILDING PHONE NUMBER SPEECH.");
    return "<say-as interpret-as='spell-out'>" + phonenumber.substring(0,3) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(3,6) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(6,8) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(8,10) + "</say-as>";
}

function sendTextMessage(phonenumber, messageContent)
{
    console.log("number: " + "1" + phonenumber + " message: " + messageContent);
    var params = {PhoneNumber: "1" + phonenumber, Message: messageContent};
            
    SNS.publish(params, function(err, data)
    {
        if (err)
        {
            console.log(err.stack);
            return false;
        }
        else
        {
            return true;
        }
    });
}

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.c2cc92cd-a488-4ab7-bbdf-00ac219a0e90";
    alexa.dynamoDBTableName = "SendToFriend";
    alexa.resources = languageStrings;
    //alexa.registerHandlers(sessionHandlers, sessionHandlersForName, sessionHandlersForPhone, sessionHandlersForContact, sessionHandlersForMessage);
    alexa.registerHandlers(sessionHandlers, sessionHandlersForUser, sessionHandlersForName, sessionHandlersForPhone, sessionHandlersForMessage);
    alexa.execute();
};

var languageStrings = {
    "en-GB": {
        "translation": {
            "USER_REQUEST" : [          "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  To start, what is your first name?",
                                        "This is Send to Friend!  What is your first name?",
                                        "In order to send your friend a message, can you give me your first name?"],
            "USER_CONFIRMATION" : [     "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  To start, what is your first name?",
                                        "This is Send to Friend!  What is your first name?",
                                        "Is order to send your friend a message, can you give me your first name?"],
            "NAME_REQUEST" : [          "OK, XXXXXXXXXX.  Now what is your friend's name?",
                                        "Got it, XXXXXXXXXX.  Who do you want to send a message to?",
                                        "This is going to be fun, XXXXXXXXXX.  Who do you want me to send a message to?"],
            "NAME_CONFIRMATION" : [     "XXXXXXXXXX<break strength='strong'></break>Is that correct?",
                                        "XXXXXXXXXX<break strength='strong'></break>Got it.  Did I say it right?",
                                        "XXXXXXXXXX<break strength='strong'></break>Is that right?",
                                        "OK.  We're sending a message to XXXXXXXXXX.  Is that correct?"],
            "NAME_MISUNDERSTANDING":[   "I'm sorry.  What is the name of the person you're trying to send a message to?",
                                        "Whoops.  My mistake.  Which name did you want to use?",
                                        "My bad.  Still learning.  Who do you want to send a message to?"],
            "PHONE_REQUEST" : [         "Perfect. What is XXXXXXXXXX's mobile phone number?",
                                        "Which mobile phone number do you want to use for XXXXXXXXXX?",
                                        "What mobile number should I use to send a message to XXXXXXXXXX?"],
            "PHONE_CONFIRMATION": [     "Got it.  I heard XXXXXXXXXX.  Is that correct?",
                                        "XXXXXXXXXX.<break strength='strong'/>Got it.  Did I say that correctly?",
                                        "I heard XXXXXXXXXX.  Is that the correct mobile number?"],
            "PHONE_MISUNDERSTANDING":[  "That didn't seem to be a valid mobile phone number.  I heard XXXXXXXXXX.",
                                        "XXXXXXXXXX doesn't seem to be a valid mobile phone number.",
                                        "I heard XXXXXXXXXX.  I must have missed something, because that's not a valid mobile phone number."],
            "PHONE_RETRY": [            "What is XXXXXXXXXX's mobile phone number?",
                                        "Let's try again. What is the mobile number for XXXXXXXXXX?",
                                        "Oops.  We can do this.  What mobile number should I use for XXXXXXXXXX?"],
            "HELP_MESSAGE" : [          "This skill helps you send messages to your friends and family.  I will first ask you for a name and phone number.  Then I will ask you about the message you want to send.  Would you like to start over, or quit?",
                                        "Would you like to start over, or quit?"],
            "UNHANDLED_MESSAGE" : [     "Hmm.  I seem to have made a mistake, and I need to start over.  Would you like to start over, or quit?",
                                        "I seem to be a little confused, and I need to start over.  Would you like to start over, or stop?",
                                        "I think I broke something.  Would you prefer to start over, or quit?"],
            "STOP_MESSAGE" : [          "Goodbye!", "OK.  We can try again some other time.", "Bye bye!"]
        }
    },
    "en-US": {
        "translation": {
            "USER_REQUEST" : [          "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  To start, what is your first name?",
                                        "This is Send to Friend!  What is your first name?",
                                        "In order to send your friend a message, can you give me your first name?"],
            "USER_CONFIRMATION" : [     "Thanks, XXXXXXXXXX.  Is that correct?",
                                        "OK, XXXXXXXXXX.  Did I get your name right?",
                                        "Perfect.  I heard your name as XXXXXXXXXX.  Is that right?"],
            "NAME_REQUEST" : [          "OK, XXXXXXXXXX.  Now what is your friend's name?",
                                        "Got it, XXXXXXXXXX.  Who do you want to send a message to?",
                                        "This is going to be fun, XXXXXXXXXX.  Who do you want me to send a message to?"],
            "NAME_CONFIRMATION" : [     "XXXXXXXXXX<break strength='strong'></break>Is that correct?",
                                        "XXXXXXXXXX<break strength='strong'></break>Got it.  Did I say it right?",
                                        "XXXXXXXXXX<break strength='strong'></break>Is that right?",
                                        "OK.  We're sending a message to XXXXXXXXXX.  Is that correct?"],
            "NAME_MISUNDERSTANDING":[   "I'm sorry.  What is the name of the person you're trying to send a message to?",
                                        "Whoops.  My mistake.  Which name did you want to use?",
                                        "My bad.  Still learning.  Who do you want to send a message to?"],
            "PHONE_REQUEST" : [         "Perfect. What is XXXXXXXXXX's mobile phone number?",
                                        "Which mobile phone number do you want to use for XXXXXXXXXX?",
                                        "What mobile number should I use to send a message to XXXXXXXXXX?"],
            "PHONE_CONFIRMATION": [     "Got it.  I heard XXXXXXXXXX.  Is that correct?",
                                        "XXXXXXXXXX.<break strength='strong'/>Got it.  Did I say that correctly?",
                                        "I heard XXXXXXXXXX.  Is that the correct mobile number?"],
            "PHONE_MISUNDERSTANDING":[  "That didn't seem to be a valid mobile phone number.  I heard XXXXXXXXXX.  Can you say YYYYYYYYYY's mobile number again?",
                                        "XXXXXXXXXX doesn't seem to be a valid mobile phone number.  What was YYYYYYYYYY's number again?",
                                        "I heard XXXXXXXXXX.  I must have missed something, because that's not a valid mobile phone number.  Can you try again?"],
            "PHONE_RETRY": [            "What is XXXXXXXXXX's mobile phone number?",
                                        "Let's try again. What is the mobile number for XXXXXXXXXX?",
                                        "Oops.  We can do this.  What mobile number should I use for XXXXXXXXXX?"],
            "MESSAGE_SENT": [           "I just sent this message to XXXXXXXXXX: ",
                                        "This message was just sent to XXXXXXXXXX: ",
                                        "XXXXXXXXXX just received this message: "],
            "REMINDER_MESSAGE": [       "Don't forget about XXXXXXXXXX!     From, YYYYYYYYYY",
                                        "Just sending you a reminder about XXXXXXXXXX!     From, YYYYYYYYYY",
                                        "Wanted to remind you about XXXXXXXXXX!     From, YYYYYYYYYY"],
            "LOVE_MESSAGE": [           "I was just thinking about you, and wanted you to know I love you!     Love, XXXXXXXXXX",
                                        "I can't get you out of my head!  I love you so much!     Love, XXXXXXXXXX",
                                        "You are the best thing that ever happened to me.  I'm so glad I met you.  I love you.     Love, XXXXXXXXXX"],
            "HELP_MESSAGE" : [          "This skill helps you send messages to your friends and family.  I will first ask you for a name and phone number.  Then I will ask you about the message you want to send.  Would you like to start over, or quit?",
                                        "Would you like to start over, or quit?"],
            "UNHANDLED_MESSAGE" : [     "Hmm.  I seem to have made a mistake, and I need to start over.  Would you like to start over, or quit?",
                                        "I seem to be a little confused, and I need to start over.  Would you like to start over, or stop?",
                                        "I think I broke something.  Would you prefer to start over, or quit?"],
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
            "PHONE_REQUEST" : [         "Perfect. What is XXXXXXXXXX's mobile phone number?",
                                        "Which mobile phone number do you want to use for XXXXXXXXXX?",
                                        "What mobile number should I use to send a message to XXXXXXXXXX?"],
            "PHONE_CONFIRMATION": [     "Got it.  I heard XXXXXXXXXX.  Is that correct?",
                                        "XXXXXXXXXX.<break strength='strong'/>Got it.  Did I say that correctly?",
                                        "I heard XXXXXXXXXX.  Is that the correct mobile number?"],
            "PHONE_RETRY": [            "What is XXXXXXXXXX's mobile phone number?",
                                        "Let's try again. What is the mobile number for XXXXXXXXXX?",
                                        "Oops.  We can do this.  What mobile number should I use for XXXXXXXXXX?"],
            "HELP_MESSAGE" : [          "This skill helps you send messages to your friends and family.  I will first ask you for a name and phone number.  Then I will ask you about the message you want to send.  Would you like to start over, or quit?",
                                        "Would you like to start over, or quit?"],
            "HELP_REPROMPT" : "Wie kann ich dir helfen?",
            "STOP_MESSAGE" : [          "Goodbye!", "OK.  We can try again some other time.", "Bye bye!"]
        }
    }
};

var reminderImageUrlSmall = "https://raw.githubusercontent.com/jeffblankenburg/SendToFriend/master/images/reminder720x400.png";
var reminderImageUrlLarge = "https://raw.githubusercontent.com/jeffblankenburg/SendToFriend/master/images/reminder1200x800.png";

var loveImageUrlSmall = "https://raw.githubusercontent.com/jeffblankenburg/SendToFriend/master/images/love720x400.png";
var loveImageUrlLarge = "https://raw.githubusercontent.com/jeffblankenburg/SendToFriend/master/images/love1200x800.png";
