'use strict';
var Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const PHONE_NUMBER = '16143275066'; // change it to your phone number

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
        console.log(this);
        console.log("LAUNCH REQUEST RECEIVED. ---------------------------------------------------------------------------------------");
        this.handler.state = states.ADDNAME;
        this.emit(":ask", "Welcome to Send To Friend!  You can send thoughtful messages to your friends with this skill.  Who would you like to send a message to?");
        //TODO: WHAT IF THEY HAD ALREADY STARTED THIS PROCESS?  SHOULD WE RESUME OR START OVER?
        //TODO: WHAT IF THEY HAVE ALREADY SAVED A CONTACT?  WE SHOULD ASK THEM IF THEY WANT TO USE AN EXISTING CONTACT.
    },
    "AddPhoneIntent": function () {
        //THEY ARE TRYING TO ONE-SHOT TO THE PHONE NUMBER.  MOVE THEM THERE.
        console.log("ONE-SHOT FOR PHONE.  MOVING THERE.");
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AddNameIntent": function () {
        //THEY ARE TRYING TO ONE-SHOT TO THE NAME.  MOVE THEM THERE.
        console.log("ONE-SHOT FOR NAME.  MOVING THERE.")
        this.handler.state = states.ADDNAME;
        this.emitWithState('AddNameIntent');
    },
    "AMAZON.HelpIntent": function() {
        console.log("HELP INTENT REQUESTED.");
    },
    "Unhandled": function() {
        console.log("UNHANDLED INTENT DETECTED.");
        this.emit(":tell", "This was unhandled with NO state.");
    }
}

var sessionHandlersForName = Alexa.CreateStateHandler(states.ADDNAME,{
    "AddNameIntent": function() {
        console.log("STATE: ADDNAME - AddNameIntent REQUESTED.");
        if (this.event.request.intent.slots.firstname !== undefined)
        {
            var firstname = this.event.request.intent.slots.firstname.value;
            console.log("RECIEVED THE NAME: " + firstname);
            this.attributes["recipientName"] = firstname;
            console.log("SAVED " + firstname + " TO DYNAMODB");
            this.handler.state = states.ADDPHONE;
            this.emit(":ask", "Perfect.  You want to send a message to " + firstname + ".  What is " + firstname + "'s mobile phone number?");
        }
        else
        {
            this.emit(":ask", "I'm sorry.  What is the name of the person you're trying to send a message to?", "I'm sorry.  What is the name of the person you're trying to send a message to?");
        }
    },
    "AddPhoneIntent": function () {
        //LANDED HERE WITH THE WRONG STATE.  CHANGING STATE, MOVING THEM THERE.
        console.log("ADDPHONEINTENT WITH ADDNAME STATE.  REASSIGNING TO ADDPHONE STATE.");
        this.handler.state = states.ADDPHONE;
        this.emitWithState('AddPhoneIntent');
    },
    "AMAZON.YesIntent": function()
    {

    },
    "AMAZON.NoIntent": function()
    {

    },
    "AMAZON.CancelIntent": function()
    {
        console.log("CANCEL INTENT DETECTED IN ADDNAME STATE.");
        this.emit(":tell", "You said cancel with ADDNAME state. Goodbye!");
    },
    "Unhandled": function() {
        console.log("UNHANDLED INTENT DETECTED IN ADDNAME STATE.");
        this.emit(":tell", "This was unhandled with ADDNAME state.");
    }
});

var sessionHandlersForPhone = Alexa.CreateStateHandler(states.ADDPHONE,{
    "AddPhoneIntent": function() {
        console.log("STATE: ADDPHONE - AddPhoneIntent REQUESTED.");
        var phonenumber = this.event.request.intent.slots.phonenumber.value;
        this.attributes["recipientNumber"] = phonenumber;
        //if (phonenumber.length == 10)
        //{
        //    recipientNumber = phonenumber;
        //}
        this.emit(":ask", "Got it.  I heard <say-as interpret-as='spell-out'>" + phonenumber + "</say-as>.  Is that correct?");
    },
    "AddNameIntent": function () {
        //LANDED HERE WITH THE WRONG STATE.  CHANGING STATE, MOVING THEM THERE.
        console.log("ADDNAMEINTENT WITH ADDPHONE STATE.  REASSIGNING TO ADDNAME STATE.");
        this.handler.state = states.ADDNAME;
        this.emitWithState('AddNameIntent');
    },
    "AMAZON.YesIntent": function()
    {
        console.log("USER CONFIRMED MOBILE NUMBER IS CORRECT.  YESINTENT WITH ADDPHONE STATE.");
        this.handler.state = states.ADDCONTACT;
        this.emitWithState('AddContactIntent');
    },
    "AMAZON.NoIntent": function()
    {

    },
    "AMAZON.CancelIntent": function()
    {
        console.log("CANCEL INTENT DETECTED IN ADDPHONE STATE.");
        this.emit(":tell", "You said cancel with ADDPHONE state. Goodbye!");
    },
    "Unhandled": function() {
        console.log("UNHANDLED INTENT DETECTED IN ADDPHONE STATE.");
        this.emit(":tell", "This was unhandled with ADDPHONE state.");
    }
});

var sessionHandlersForContact = Alexa.CreateStateHandler(states.ADDCONTACT,{
    "AddContactIntent": function () {
        console.log("ASKING THE USER IF THEY WOULD LIKE TO SAVE THIS CONTACT.");
        this.emit(":ask", "Would you like to save " + this.attributes["recipientName"] + " as a favorite contact?");
        //this.handler.state = states.ADDNAME;
        //this.emitWithState('AddNameIntent');
    },
    "AMAZON.YesIntent": function()
    {
        //USER WANTS TO SAVE THIS CONTACT AS A FAVORITE.  DO IT.
        console.log("USER WANTS TO SAVE CONTACT AS FAVORITE.");
        addFavorite(this);
        this.handler.state = states.SENDMESSAGE;
        this.emit(":ask", "Would you like to send a message to " + this.attributes["recipientName"] + "?");
    },
    "AMAZON.NoIntent": function()
    {
        //USER DID NOT WANT TO SAVE CONTACT.  MOVE THEM TO SELECTING A MESSAGE.
    }
});

var sessionHandlersForMessage = Alexa.CreateStateHandler(states.SENDMESSAGE,{
    "SendMessageIntent": function () {
        console.log("STARTING THE SENDMESSAGE CONVERSATION.");
        this.emit(":ask", "What kind of message would you like to send?  Happy, Sad, or Angry?");
        //this.handler.state = states.ADDNAME;
        //this.emitWithState('AddNameIntent');
    },
    "AMAZON.YesIntent": function()
    {

    },
    "AMAZON.NoIntent": function()
    {
        //USER DID NOT WANT TO SAVE CONTACT.  MOVE THEM TO SELECTING A MESSAGE.
    }
});

function addFavorite(nowThis)
{
    console.log("ADDING FAVORITE.");
    var favoriteArray = {firstname: nowThis.attributes["recipientName"], phonenumber: nowThis.attributes["recipientNumber"]};
    nowThis.attributes["favorites"] = favoriteArray;
    console.log("FAVORITE ADDED.");
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
