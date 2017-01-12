'use strict';
var Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const PHONE_NUMBER = '16143275066'; // change it to your phone number
const D = "-------------------------------------------------------------------------------------------------------------------";

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
        console.log(D + "LAUNCH REQUEST RECEIVED.");
        this.handler.state = states.ADDNAME;
        this.emitWithState("BeginIntent");
    },
    "AddPhoneIntent": function () {
        //THEY ARE TRYING TO ONE-SHOT TO THE PHONE NUMBER.  MOVE THEM THERE.
        console.log(D + "ONE-SHOT FOR PHONE.  MOVING THERE.");
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AddNameIntent": function () {
        //THEY ARE TRYING TO ONE-SHOT TO THE NAME.  MOVE THEM THERE.
        console.log(D + "ONE-SHOT FOR NAME.  MOVING THERE.")
        this.handler.state = states.ADDNAME;
        this.emitWithState('AddNameIntent');
    },
    "AMAZON.HelpIntent": function() {
        console.log(D + "HELP INTENT REQUESTED.");
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT REQUESTED.");
    },
    "AMAZON.CancelIntent": function() {
        console.log(D + "CANCEL INTENT REQUESTED.");
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT DETECTED.");
        this.emit(":tell", "This was unhandled with NO state.");
    }
}

var sessionHandlersForName = Alexa.CreateStateHandler(states.ADDNAME,{
    "BeginIntent": function() {
        this.emit(":ask", "Welcome to Send To Friend!  You can send SMS messages to your friends with this skill.  Who would you like to send a message to?");
        //TODO: WHAT IF THEY HAD ALREADY STARTED THIS PROCESS?  SHOULD WE RESUME OR START OVER?
        //TODO: WHAT IF THEY HAVE ALREADY SAVED A CONTACT?  WE SHOULD ASK THEM IF THEY WANT TO USE AN EXISTING CONTACT.
    },
    "AddNameIntent": function() {
        console.log(D + "STATE: ADDNAME - AddNameIntent REQUESTED.");
        if (this.event.request.intent.slots.firstname !== undefined)
        {
            var firstname = this.event.request.intent.slots.firstname.value;
            console.log(D + "RECIEVED THE NAME: " + firstname);
            this.attributes["recipientName"] = firstname;
            console.log(D + "SAVED " + firstname + " TO DYNAMODB");
            this.emit(":ask", "Got it.  I heard " + firstname + ".  Is that correct?");
        }
        else
        {
            this.emit(":ask", "I'm sorry.  What is the name of the person you're trying to send a message to?", "I'm sorry.  What is the name of the person you're trying to send a message to?");
        }
    },
    "AddPhoneIntent": function () {
        //LANDED HERE WITH THE WRONG STATE.  CHANGING STATE, MOVING THEM THERE.
        console.log(D + "ADDPHONEINTENT WITH ADDNAME STATE.  REASSIGNING TO ADDPHONE STATE.");
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AMAZON.YesIntent": function()
    {
        console.log("YES INTENT WITH ADDNAME STATE");
        this.handler.state = states.ADDPHONE;
        this.emit(":ask", "Perfect. What is " + this.attributes["recipientName"] + "'s mobile phone number?");
    },
    "AMAZON.NoIntent": function()
    {
        console.log("NO INTENT WITH ADDNAME STATE");
        this.emit(":ask", "Oops.  I'm sorry.  I must have misheard you.  What is the name of the person you'd like to send a message to?", "I didn't catch that.  Who do you want to send a message to?");
    },
    "AMAZON.CancelIntent": function()
    {
        console.log(D + "CANCEL INTENT DETECTED IN ADDNAME STATE.");
        this.emit(":tell", "You said cancel with ADDNAME state. Goodbye!");
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT REQUESTED.");
        this.emit(":tell", "You said STOP with ADDNAME state. Goodbye!");
    },
    "Unhandled": function() {
        console.log(D + "UNHANDLED INTENT DETECTED IN ADDNAME STATE.");
        this.emit(":tell", "This was unhandled with ADD NAME state.");
    },
});

var sessionHandlersForPhone = Alexa.CreateStateHandler(states.ADDPHONE,{
    "AddPhoneIntent": function() {
        console.log(D + "STATE: ADDPHONE - AddPhoneIntent REQUESTED.");
        var phonenumber = this.event.request.intent.slots.phonenumber.value;
        var phonenumberspeech = "<say-as interpret-as='spell-out'>" + phonenumber.substring(0,3) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(3,6) + "</say-as><break strength='strong'></break><say-as interpret-as='spell-out'>" + phonenumber.substring(6,10) + "</say-as>";
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
        this.emit(":tell", "You said cancel with ADDPHONE state. Goodbye!");
    },
    "AMAZON.StopIntent": function() {
        console.log(D + "STOP INTENT REQUESTED.");
        this.emit(":tell", "You said STOP with ADDPHONE state. Goodbye!");
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
exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = undefined;
    alexa.dynamoDBTableName = "SendToFriend";
    alexa.registerHandlers(sessionHandlers, sessionHandlersForName, sessionHandlersForPhone, sessionHandlersForContact, sessionHandlersForMessage);
    alexa.execute();
};
