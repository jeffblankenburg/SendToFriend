#How To Build an SMS Messaging Skill for Alexa

Wouldn't it be great to send a message to a friend or family member when you're thinking of them?  Or maybe you just want to remind them to grab some milk on the way home from the gym?  This new Alexa skill template helps you to build something that does exactly that.

In addition to the tools that we always recommend for Alexa skill development ([AWS Lambda](https://aws.amazon.com/lambda/), [Alexa Skills Kit (ASK)](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit), [DynamoDB](https://aws.amazon.com/dynamodb/), and the [ASK SDK](https://developer.amazon.com/public/community/post/Tx213D2XQIYH864/Announcing-the-Alexa-Skills-Kit-for-Node-js)), we will also be introducing you to another Amazon Web Services technology: [Amazon Simple Notification Service (SNS)](https://aws.amazon.com/sns/).  We provide the business logic, error handling, and help functions for your skill, you just need to provide the data and credentials.

For this example, we will be general messaging skill that sends four kinds of messages to users: Reminders, Miss You, Love You, and Hello.  The user of this skill will be guided through a conversation to help them customize and send messages to their friends like these:

   * “Wanted to send you a reminder about tacos!  From, Alice”
   * “You just popped into my head...thought I'd reach out to say hello!  From, Steve”
   * “I was just thinking about you, and wanted you to know I love you!  Love, Jeff”

You will be able to customize all of the messages that this skill can produce, so you can create your own themed messaging skill around your favorite TV shows, movies, or anything else that would make an interesting experience!

After completing this tutorial, you'll know how to do the following:
   * __Create a messaging skill__ - This tutorial will walk Alexa skills developers through all the required steps involved in creating a skill that sends SMS messages.
   * __Understand the basics of VUI design__ - Creating this skill will help you understand the basics of creating a working Voice User Interface (VUI) while using a cut/paste approach to development. You will learn by doing, and end up with a published Alexa skill. This tutorial includes instructions on how to customize the skill and submit for certification. For guidance on designing a voice experience with Alexa you can also [watch this video](https://goto.webcasts.com/starthere.jsp?ei=1087592).
   * __Use JavaScript/Node.js and the Alexa Skills Kit to create a skill__ - You will use the template as a guide but the customization is up to you. For more background information on using the Alexa Skills Kit please [watch this video](https://goto.webcasts.com/starthere.jsp?ei=1087595).
   * __Manage state in an Alexa skill__ - As the user moves through our skill, we modify their state to track their progress, and manage which intents should be executed based on that state.  [Read more about state management here](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs#making-skill-state-management-simpler).
   * __DynamoDB integration__ - Because this skill behaves like a conversation, we also need to persist the user's data as we move through it.  DynamoDB provides an excellent (and easy) way to do this.
   * __Intent handoffs__ - Sometimes, we want a user to complete a specific intent before they move on to the next one.  This sample skill provides several examples of using the emitWithState() function to move a user from one intent to another.
   * __Response randomization__ - In order to simulate a real conversation, we also randomize all of Alexa's responses so that the skill doesn't appear to follow the same script every time.  The user goes through the same process each time, but what Alexa says varies with each experience.
   * __Card creation__ In addition to sending a recipient an SMS message, we also create a nice visual card for our user as a reminder and confirmation of the message they sent in their Alexa app.
   * __Get your skill published__ - Once you have completed your skill, this tutorial will guide you through testing your skill and sending your skill through the certification process so it can be enabled by any Alexa user.  [You may even be eligible for some Alexa swag!](https://developer.amazon.com/alexa-skills-kit/alexa-developer-skill-promotion)

Get started and build your first - or next - Alexa skill today.

# Let's Get Started

## Step 1. Setting up Your Alexa Skill in the Developer Portal
   
Skills are managed through the Amazon Developer Portal. You’ll link the Lambda function you created above to a skill defined in the Developer Portal.

1.  Navigate to the Amazon Developer Portal. Sign in or create a free account (upper right). You might see a different image if you have registered already or our page may have changed. If you see a similar menu and the ability to create an account or sign in, you are in the right place.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/amazon-developer-portal._TTH_.png)

2.  Once signed in, navigate to Alexa and select **"Getting Started"** under Alexa Skills Kit.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/alexa-skills-kit._TTH_.png)
 
3.  Here is where you will define and manage your skill. Select **"Add a New Skill"**

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/add-a-new-skill.png)
 
4.  There are several choices to make on this next page, so we will cover each one individually.
    1. Choose the language you want to start with.  You can go back and add all of this information for each language later (this template is designed for US English, UK English, and German), but for this tutorial, we are working with "English (U.S.)"
    2. Make sure the radio button for the Custom Interaction Model is selected for “Skill Type”.
    3. Add the name of the skill. Give your skill a name that is simple and memorable, like "Send To Friend." The name will be the one that shows up in the Alexa App (and now at [amazon.com/skills](https://www.amazon.com/skills)) when users are looking for new skills.  (Obviously, don't use "Send To Friend".  Use a name that describes the kinds of messages you plan to use for your skill.)
    4. Add the invocation name. This is what your users will actually say to start using your skill. We recommend using only two or three words, because your users will have to say this every time they want to interact with your skill.
    5. Under "Global Fields," select "no" for Audio Player, as our skill won't be playing any audio.  
    6. Select **Next**.
   
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/create-a-new-alexa-skill._TTH_.png)

5.  Next, we need to define our skill’s interaction model. Let’s begin with the intent schema. In the context of Alexa, an intent represents an action that fulfills a user’s spoken request.
   
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/intent-schema._TTH_.png)
 
6.  Review the Intent Schema below. This is written in JSON and provides the information needed to map the intents we want to handle programmatically.  Copy this from the intent schema in the [GitHub repository here](https://github.com/alexa/skill-sample-nodejs-messaging/blob/master/speechAssets/intents.json).
    
    Below you will see a collection of intents that we expect our users to indicate by voice.  These are all mechanisms for collecting data from our user, but with this skill, there aren't multiple ways to enter this skill.  Each time the user starts the skill, they start at the beginning of the conversation, by saying something like:

    "Alexa, open Send to Friend"
    
    To collect data from our users, we have to use slots.  Slots are predefined data types that we expect the user to provide.  This is not a closed list (like an enum), so you must anticipate that you will receive values that are not in your slot value list.  For example, when the user needs to provide a phone number, we can specify an AMAZON.NUMBER slot, and they can dictate a phone number to Alexa.  This data also becomes training data for Alexa's Natural Language Understanding (NLU) engine.  You will see how this works more clearly when we define our sample utterances below.
   
    For the ReminderMessageIntent, the user will be providing something that they want to remind their contact about, like "Remind Tabitha about video games."  The value "video games" is one we want to capture from our user's statements.  For this, we use a custom slot, and populate it with as many nouns as we can provide.

    ```JSON
    {
        "intents": [
            {"intent": "AddPhoneIntent", "slots":[{"name": "phonenumber", "type": "AMAZON.NUMBER"}]},
            {"intent": "AddNameIntent", "slots":[{"name": "firstname", "type": "AMAZON.US_FIRST_NAME"}]},
            {"intent": "ReminderMessageIntent", "slots":[{"name": "noun", "type": "NOUN"}]},
            {"intent": "HelloMessageIntent"},
            {"intent": "MissYouMessageIntent"},
            {"intent": "LoveYouMessageIntent"},
            {"intent": "AMAZON.StartOverIntent"},
            {"intent": "AMAZON.RepeatIntent"},
            {"intent": "AMAZON.HelpIntent"},
            {"intent": "AMAZON.YesIntent"},
            {"intent": "AMAZON.NoIntent"},
            {"intent": "AMAZON.StopIntent"},
            {"intent": "AMAZON.CancelIntent"}
        ]
    }
    ```
    
    You can see that we have defined seven different built-in intents: Yes, No, Help, Stop, Cancel, Start Over and Repeat.  These are built-in intents that we can use for common commands our users will indicate.  [For more on the use of built-in intents, go here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/implementing-the-built-in-intents).

7.  Next, we need to define our custom slot that we called "noun."  To do this, click the "Add Slot Type" button.
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/add-new-slot._TTH_.png)

8.  For the "Enter Type" box, type the word "noun."  For the "Enter Values" box, [copy the contents of this giant list of nouns](https://github.com/jeffblankenburg/SendToFriend/blob/master/speechAssets/noun_customslot.txt).  You can always add more to this list if there are words you want to support.
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/adding-slot-type._TTH_.png)
    **Make sure to click Save before moving to the next step.**

9.  The next step is to build the utterance list.  This is meant to be a thorough, well-thought-out list of the ways users will try to interact with your skill.  You don't have to get every possible phrase, but it is important to cover a variety of utterances so that the Natural Language Understanding(NLU) engine can best interpret your user's intent.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/sample-utterances._TTH_.png)

10.  Given the flexibility and variation of spoken language in the real world, there will often be many different ways to express the same request. Providing these different phrases in your sample utterances will help improve voice recognition for the abilities you add to Alexa. It is important to include as wide a range of representative samples as you can -– all the phrases that you can think of that are possible in use (though do not include samples that users will never speak). Alexa also attempts to generalize based on the samples you provide to interpret spoken phrases that differ in minor ways from the samples specified.

    Now it is time to add the Utterances. Copy/paste the sample utterances from [GitHub](https://github.com/alexa/skill-sample-nodejs-messaging/blob/master/speechAssets/SampleUtterances.txt). An example of utterances is listed below.

    ```
    AddPhoneIntent {phonenumber}
    AddNameIntent {firstname}

    ReminderMessageIntent reminder
    ReminderMessageIntent remind
    ReminderMessageIntent remind message
    ReminderMessageIntent {noun}

    MissYouMessageIntent miss you
    MissYouMessageIntent i miss you
    MissYouMessageIntent miss you message
    MissYouMessageIntent an i miss you message

    HelloMessageIntent hello
    HelloMessageIntent a hello
    HelloMessageIntent hello message
    HelloMessageIntent a hello message

    LoveYouMessageIntent i love you 
    LoveYouMessageIntent love you
    LoveYouMessageIntent i love you message
    LoveYouMessageIntent love you message
    ```
    
    As you can see in the example above, we are using our custom intents with phrases that our users might use to interact with our skill.  Each example is a different way that a user might ask for that intent.  AddPhoneIntent expects an AMAZON.NUMBER slot, so we have specified this in our utterances with {phonenumber}.  ([More information on slots can be found here.](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#slot-types))

11.  Select **Save**. You should see the interaction model being built (this might take a minute or two). If you select Next, your changes will be saved and you will go directly to the Configuration screen. After selecting Save, it should now look like this:

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/interaction-model._TTH_.png)

Next we will configure the AWS Lambda function that will host the logic for our skill.

## Step 2: Creating Your Skill Logic using AWS Lambda

### Create an AWS Account
 
 ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/create-an-aws-account._TTH_.png)
    
 **Note: If you already have an AWS account, you can skip this section.  Just sign in to your console.**

1.  Open [aws.amazon.com](aws.amazon.com) and then choose **‘Create an AWS Account’**

    1. Follow the online instructions. Do not worry about the IAM role, we will do that later.
    2. You will need a Valid Credit Card to set up your account (note the AWS Free Tier will suffice however. [You can find out more about the free tier here](https://aws.amazon.com/free/?sc_ichannel=ha&amp;sc_ipage=signin&amp;sc_iplace=body_link_text&amp;sc_icampaigntype=free_tier&amp;sc_icampaign=ha_en_free_tier_signin_2014_03).)
    3. Part of the sign-up procedure involves receiving a phone call and entering a PIN using the phone keypad.
    
2.  Sign in to the AWS Console

3.  It can sometimes take a couple minutes for your new AWS account to go live. You will receive an e-mail when your account is active.

### Create an AWS Lambda Function

AWS Lambda lets you run code without provisioning or managing servers. The free tier of AWS Lambda provides you with 1,000,000 invocations of your function for free each month.

**Note: If you are new to Lambda and would like more information, visit the [Lambda Getting Started Guide](http://docs.aws.amazon.com/lambda/latest/dg/getting-started.html).**

1.  **IMPORTANT**: Select **US East (N. Virginia)** region, or the **EU (Ireland)** region (upper right corner).  You should choose the region geographically closest to your audience. These are currently the only regions that currently support Alexa skill development.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/select-aws-region._TTH_.png)

2.  Select **Lambda** from AWS Services (under Compute)

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/lambda._TTH_.png)

3.  Select **“Create a Lambda Function”** to begin the process of defining your Lambda function.
 
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/create-a-lambda-function._TTH_.png)

4.  Select the **alexa-skill-kit-sdk-factskill** option on the Select Blueprint screen.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/select-blueprint._TTH_.png)

5.  Now, you need to configure the event that will trigger your function to be called. As we are building skills with the Alexa Skills Kit, click on the gray dash-lined box and select Alexa Skills Kit from the dropdown menu.  (If you don't see this option, go back to Step #1 and select the appropriate AWS region).  This gives the Alexa service permission to invoke your skill's function.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/configure-triggers._TTH_.png)

6.  Choose **Next** to continue.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/configure-triggers-2._TTH_.png)

7.  You should now be in the **"Configure Function"** section. Enter the Name, Description, and Runtime for your skill as in the example below.  Your runtime should be "Node.js 4.3."

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/configure-function._TTH_.png)

8.  Delete the code in the **Lambda function code** box, and replace it with the code from this tutorial.  [You can get this file on GitHub](https://github.com/jeffblankenburg/SendToFriend/blob/master/src/index.js).
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/paste-code._TTH_.png)

9.  Set your handler and role as follows:

    * Keep Handler as ‘index.handler’
    * Drop down the “Role” menu and select **“Create a custom role”**. (Note: if you have already used Lambda you may already have a ‘lambda_basic_execution’ role created that you can use.) This will launch a new tab in the IAM Management Console.
    
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/create-a-custom-role._TTH_.png)

10. You will be asked to set up an Identity and Access Management or “IAM” role if you have not done so. AWS Identity and Access Management (IAM) enables you to securely control access to AWS services and resources for your users. Using IAM, you can create and manage AWS users and groups, and use permissions to allow and deny their access to AWS resources. The IAM role will give your Lambda function permission to use other AWS Services at runtime, such as Cloudwatch Logs, the AWS logs collection and storage service. In the Role Summary section, select "Create a new IAM Role" from the IAM Role dropdown menu. The Role Name and policy document will automatically populate.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/lambda-settings._TTH_.png)

11. Select **“Allow”** in the lower right corner and you will be returned to your Lambda function.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/lambda-function-handler._TTH_.png)

12. Keep the Advanced settings as default. Select **‘Next’** and review. You should see something like below. Then select **‘Create Function’**:

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/lambda-review._TTH_.png)

13. Congratulations, you have created your AWS Lambda function. **Copy** the Amazon Resource Name (ARN) for use in the Configuration section of the Amazon Developer Portal.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/lambda-congratulations._TTH_.png)

14. Before we move on, we have one additional step we need to take in this tutorial, because we will be using the [Simple Notification Service (SNS)](http://aws.amazon.com/sns).  We need to modify the IAM role we created earlier so that it has permissions to use the SNS service.  To do this, [go to the IAM section of the AWS console](https://console.aws.amazon.com/iam/home#/roles).  You should see your "lambda_basic_execution" role in a list.  Click it to open that role.
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/iam_role_list._TTH_.png)

15. On the next screen, we need to add a new managed policy to our IAM role.  To do this, click the "Attach Policy" button
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/iam-role-summary._TTH_.png)

16. On the "Attach Policy" screen, you are looking for the "AmazonSNSFullAccess" policy.  (Typing SNS in the filter box makes it easy to find.)  Check the box, and click "Attach Policy" at the bottom of the page.  This will apply the SNS policy to your IAM role, making it possible for your skill to send SMS messages using this service.
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/attach-policy._TTH_.png)

    **You can close this browser tab when you have completed these steps.**
    

## Step 3: Add Your Lambda Function to Your Skill

1.  Navigate back to [developer.amazon.com](http://developer.amazon.com) and select your skill from the list. You can select the skill name or the edit button.
 
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/skill-list._TTH_.png)

2.  Select the Configuration section, and make sure to choose the AWS Lambda ARN region that corresponds to your AWS Lambda function's region.  Add the ARN from the Lambda function you created in the AWS Console earlier. Select the **Lambda ARN (Amazon Resource Name)** radio button. Then, select **“No”** for account linking since we will not be connecting to an external account for this tutorial. Paste the ARN you copied earlier into the Endpoint field. Then select **Next**.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/configuration._TTH_.png)

3.  You will be asked if you want to "Save Global Changes."  This happens because you are changing values that would apply to every version of your skill (in every language.)  You can click "Yes, Apply" to complete this step.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/save-global-changes._TTH_.png)
 
4.  You have now completed the initial development of your skill. Now it is time to test.

## Step 4: Testing Your Skill

1.  In the Test area, we are going to enter a sample utterance in the service simulator section and see how Alexa will respond. In this example, we have called the skill "Send To Friend." This is the "Invocation Name" we set up on the Skill Information line in the “Skill Information” section.

    * In the Service Simulator, type **‘open send to friend’** and click the **“Ask Send to Friend”** button.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/service-simulator._TTH_.png)

2.  You should see the formatted JSON request from the Alexa service and the response coming back from your Lambda function. Verify that you get a correct Lambda response.
  
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/service-simulator-json._TTH_.png)
 
3.  (Optional) Testing with your device. This is optional as you can do all the testing in the portal. Assuming your Echo device is on-line (and logged in with the same account as your developer account), you should now see your skill enabled in the Alexa app (under "Your Skills," in the top right corner) and ask Alexa to launch your skill. For more information on testing an Alexa skill and registering an Alexa-enabled device, [check here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/testing-an-alexa-skill).
 
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/alexa-skill-app._TTH_.png)

    Another option for testing your device with your voice is [Echosim.io](http://echosim.io).  This is a virtual Alexa device in your browser, created and hosted by iQuarius Media, that you can speak to and get responses from, just like having a physical device in front of you.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/echosim._TTH_.png)
  
### Skills / Lambda Troubleshooting (getting an invalid response)?
 * Do you have the right ARN copied from your Lambda function into your Developer Portal / skill?
 * Are you calling the right invocation name?
 * Are you saying launch, start or open (followed by your invocation name)?
 * Are you sure you have no other skills in your accounts with the same invocation name?

## Step 5: Make it Yours
 
1.  In the Skill Information section in the Developer Console, edit the Skill Information Tab to reflect your new messaging skill:

    1.  Provide a skill name that represents the new skill you are creating.
    2.  Come up with a cool Invocation Name that users will use to invoke your skill. [Make sure to read the rules for creating invocation names](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/choosing-the-invocation-name-for-an-alexa-skill), as this is a common failure point during certification.
    3.  Create a fun icon. Be sure you have the rights to whatever icons you are uploading – you will need to provide both 108x108px and 512x512px images. Need help finding an image? Try [The Noun Project](http://thenounproject.com) or [Pixabay](https://pixabay.com/) as a possible source for royalty-free images. Use an image editor (such as Paint on Windows or Preview on Mac) to change the size of the image.
   
        Everything else can stay as-is for now in the Developer Portal.

2.  Head back to your Lambda function now.  This is where you can customize the kinds of things that Alexa says and does.  Feel free to peruse the code in the "Code" tab, but the important parts for customization start on line 488. There is where you will find a large collection of language strings broken up into three languages.  They are in order alphabetically, en-GB is for UK English, en-US is for United States English, and de-DE is for German.
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/language-strings._TTH_.png)

3.  You will notice that there are three different strings for each type of response.  This is done so that Alexa can vary her responses to the user.  Each time that Alexa needs to respond to the user, she will select one of the appropriate values at random from the list.  You should definitely expand her response list to make her responses even more conversational.

4.  To clarify each of the response types, here's a quick guide:
    * **USER_REQUEST**: This welcomes the user to the skill, and prompts them for their first name.
    * **USER_CONFIRMATION**: This message repeats the user's name back to them, to make sure that she heard it correctly.
    * **NAME_REQUEST**: This repeats the user's name, and asks for the name of the person they are sending a message to.
    * **NAME_CONFIRMATION**: This repeats the intended recipient's name back to the user, asking for confirmation that Alexa heard it correctly.
    * **NAME_MISUNDERSTANDING**: If Alexa got the name wrong, she apologizes, and then asks for the name again.
    * **PHONE_REQUEST**: This asks the user for the mobile phone number that the message should be sent to.
    * **PHONE_CONFIRMATION**: Alexa repeats the phone number back to the user, and confirms that it is correct.
    * **PHONE_MISUNDERSTANDING**: When a user provides a value that is not 10 digits (the format of a US-based mobile phone number), she repeats the number, and asks the user to say the number again.
    * **PHONE_RETRY**: If the user indicates that the phone number was received incorrectly, Alexa apologizes and asks for it again.
    * **MESSAGE_SENT**: This is confirmation to the user that a message has been sent to their intended user.  This is paired with an option from one of the next four categories that the user selected.
    * **REMINDER_MESSAGE**: These are messages meant to remind the recipient about something that the user indicated.  This uses the data from our custom slot we called "noun" earlier.
    * **LOVE_MESSAGE**: These are messages to communicate that the user was thinking about someone they love.
    * **MISSYOU_MESSAGE**: These are messages to communicated that the user misses the recipient.
    * **HELLO_MESSAGE**: These are messages to send a friendly "Hello" message to their recipient. 
    * **HELP_MESSAGE**: This is message the user will hear when they ask for help.  It tells them what they can do, and prompts them to say "Start Over" or "Quit."
    * **UNHANDLED_MESSAGE**: If the user somehow tries something that isn't handled, this is the message they will receive.  Similar to help, it asks them to "Start Over" or "Quit."
    * **STOP_MESSAGE**: When a user indicates that they want our skill to stop, this should be a very brief message saying goodbye.

5. You will definitely notice that some of the responses have "XXXXXXXXXX" or "YYYYYYYYYY" in them.  We built this as a way to easily collect all of your strings in one place, but also insert some of the data the user provides into those strings.  For example, one of the USER_CONFIRMATION strings is "Perfect.  I heard your name as XXXXXXXXXX.  Is that right?"  The code earlier in our Lambda function will look for a string of 10 Xs and replace them with the name that the user provides to us.  The same goes for phone numbers, recipient names, etc.

6. The final change you need to make relates to the cards that get created when a user sends a message.  Each of these cards has two images associated with it.  You need one image that is 1200x800 pixels, and one that is 720x400 for each message type.  These images also need to be hosted somewhere on the internet where they can be publicly available.  You can change each of these images in the variables immediately below all of the response strings you've been working on.
   ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/images._TTH_.png)

7. Once you have successfully updated all of your strings, scroll back to the top of the page and select “Save”.
 
8. Repeat the tests you performed earlier to ensure your changes are functioning properly. See Step #4 for a review of how to perform functional tests.

## Step 6: Publish Your Skill

Now we need to go back to our Developer Portal to test and edit our skill and we will be ready for certification.

1.  In your skill's Test section, enter your Utterances into the Simulator to make sure everything is working with your new messaging skill.

2.  Optionally, you can test with your Alexa-enabled device to make sure everything is working correctly. You may find a few words that need to be changed for a better user experience.

    Some things to think about:

    * Does every word in Alexa's responses sound correct? 
    * Do you need to change any words to make them sound correct?
  
    Since we get to choose our responses, make sure that Alexa pronouces the words you chose properly. You can use the Voice Simulator in the Test section to simulate Alexa’s responses. In the Voice Simulator, type in each location name that you are using to test how Alexa will say it. Use additional punctuation or possibly SSML if you need to better control how Alexa responds. You can find out more about [SSML here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference).
    
    [Read more about functional testing for Alexa skills.](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-functional-testing)
    
    [Read more about building effective voice user interfaces (VUI).](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-voice-interface-and-user-experience-testing)

3.  Select the Publishing Information area of your skill next:
 
    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/publishing-information._TTH_.png)
 
    * Spend some time coming up with an enticing, succinct description. This is an excellent way to attract new users. These descriptions show up on the list of [skills available](http://alexa.amazon.com/#skills) in the Alexa app, or at [amazon.com/skills](http://amazon.com/skills).
    * In your example phrases, be sure that the examples you use exactly match the utterances that you created in the Interaction Model section.  The first example should be "Alexa, open {your invocation name}" and no utterance. Remember, there are built-in intents such as help and cancel. You can learn more about [built-in intents here](https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/docs/implementing-the-built-in-intents#Available%20Built-in%20Intents). You can also review the list of [supported phrases](https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/docs/supported-phrases-to-begin-a-conversation) to begin a conversation.
    * Be sure you have the rights to whatever icons you are uploading – you will need to provide both 108x108px and 512x512px images. If there is any question, the Amazon certification team will fail your Alexa skill submission.  In the event your skill fails certification, you will receive an email from Amazon's testing team with information about your certification results.
    * IMPORTANT: Add the text “This is based on the Messaging Skill Template” to the Testing Instructions section. This alerts the Certification team of your submission using this standardized template, smoothing the road to a faster certification process.

    ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/publishing-information-2._TTH_.png)
 
    Once you have uploaded your icons, you should see a success message at the bottom of the screen.

4.  Privacy and Compliance.

    1.  On the Privacy and Compliance section, make sure to consider each answer.
        1.  Since our skill does not require purchases or spending of money, choose "No" for the first question.
        2.  We are collecting personal information in this skill when we ask for names and mobile phone numbers.  Answer yes for the second question.
        3.  If your messaging skill is not directed to children under the age of 13 or is not intended to target children under the age of 13, choose ‘No’ for the third question as well.
        4.  Choose to certify that your skill can be imported to and exported from the countries and regions that you operate the skill.
        5.  You must provide a simple privacy policy in order to publish this skill.  You can set up a free [Wordpress](http://wordpress.com) site to host this, a [GitHub](http://github.com) repository, or post a page on a website of your choosing.  [You can see my example here.](https://blankenblog.com/send-to-friend-privacy-policy/)
        6. A Terms of Use is optional, but always recommended as well.

    2.  Select **“Save”**.
 
    3.  Select “Submit for Certification”
            
        ![](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/messaging/certify._TTH_.png)
   
    4.  Finally, confirm your submission. Select “Yes” to submit your skill.
   
Congratulations! You have successfully submitted your skill for publication. You will receive progress e-mails and possibly other suggestions from the Alexa certification team on how you can make your skill even better. You will typically receive news back from the certification team within 4-5 business days. You can update your skills at any time, except while they are being reviewed for certification.

Did you like this tutorial? You can find more on our [Alexa Skills Kit training page](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/content/alexa-skills-developer-training)

## Check out These Other Developer Resources
    
* [Alexa Skills Kit (ASK)](https://developer.amazon.com/ask)
* [Alexa Skill Submission Checklist](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-submission-checklist#submission-checklist)
* [Alexa Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html)
* [Knowledge Base](https://goto.webcasts.com/starthere.jsp?ei=1090197)
* [Intro to Alexa Skills Kit  - On Demand Webinar](https://goto.webcasts.com/starthere.jsp?ei=1090197)
* [Voice Design 101 - On Demand Webinar](https://goto.webcasts.com/starthere.jsp?ei=1087594)
* [Developer Office Hours](https://attendee.gotowebinar.com/rt/8389200425172113931)
 