const { MessageFactory } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { channels } = require('botbuilder-dialogs/lib/choices/channel');
const { UserProfile } = require('../userProfile');
const express = require('express')
const Details = require('../src/models/details')
// const welcome = require('./welcomeBot')
const { fd, db } = require('../src/routers/details')
const app = express()
require('../src/db/mongoose')
app.use(express.json())


const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


// var sector

class UserProfileDialog extends ComponentDialog {
    constructor(userState) {
        super('userProfileDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.experiencePromptValidator));
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(NAME_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.nameStep.bind(this),
            this.emailStep.bind(this),
            this.phoneStep.bind(this),
            this.fieldStep.bind(this),
            this.fieldConfirmStep.bind(this),
            this.experienceStep.bind(this),
            this.company_nameStep.bind(this),
            this.company_nameConfirmStep.bind(this),
            this.positionStep.bind(this),
            this.positionConfirmStep.bind(this),
            this.interviewStep.bind(this),
            this.feedbackStep.bind(this),
            this.feedbackConfirmStep.bind(this),
            this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }


    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
            
        }
    }

    async nameStep(step) {
        await step.context.sendActivity('Welcome to Hiring Bot.');

        //step.values.transport = step.result.value;
        return await step.prompt(NAME_PROMPT, 'What is your name?');
    }

    async emailStep(step) {
        //step.values.transport = step.result.value;
        step.values.name = step.result;
        return await step.prompt(NAME_PROMPT, 'Enter your Email Id?');
    }

    async phoneStep(step) {
        //step.values.transport = step.result.value;
        step.values.email = step.result;
        return await step.prompt(NAME_PROMPT, 'Enter your phone Number?');
    }

    async fieldStep(step) {
        step.values.phone = step.result;
        //step.values.transport = step.result.value;
        return await step.prompt(NAME_PROMPT, 'In which field you are working?');
    }

    async fieldConfirmStep(step) {
        step.values.field = step.result;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(`Thanks your field is  ${ step.result }.`);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, 'do you have any experience?');
    }

    async experienceStep(step) {
        if (step.result) {
            // User said "yes" so we will be prompting for the experience.
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
            const promptOptions = { prompt: 'Please enter your experience', retryPrompt: 'The value entered must be greater than and equal to 0' };

            return await step.prompt(NUMBER_PROMPT, promptOptions);
        } else {
            // User said "no" so we will skip the next step. Give -1 as the experience.
            return await step.next(-1);
        }

    }



    async company_nameStep(step) {
       // step.values.experience = step.result;
       step.values.experience = step.result;

        const msg = step.values.experience === -1 ? 'No experience given.' : `I have your experience as ${ step.values.experience } years.`;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(msg);


       if (step.result) {
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
            
        return await step.prompt(NAME_PROMPT, 'Please enter name of company in which you are employed');
        } else {
           
            return await step.next(-1);
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
     //   return await step.prompt(CONFIRM_PROMPT, { prompt: 'Is this okay?' });
    }

       async company_nameConfirmStep(step) {
        step.values.employed = step.result;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(`Thanks, company in which you are currently working is  ${ step.result }.`);

         return await step.prompt(CONFIRM_PROMPT, { prompt: 'Is this okay?' });

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
       
    }

    async positionStep(step) {
        return await step.prompt(NAME_PROMPT, 'For what position you are looking for?');
    }


    async positionConfirmStep(step) {
        step.values.position = step.result;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(`Thanks your selected position is  ${ step.result }.`);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, 'do you want to schedule interview?');
    }

    async interviewStep(step) {
        // return await step.prompt(NAME_PROMPT, 'Provide date when you are available for interview.');
        if (step.result) {
            // User said "yes" so we will be prompting for the experience.
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.

            return await step.prompt(NAME_PROMPT, 'Provide date when you are available for interview.');
        } else {
            // User said "no" so we will skip the next step. Give -1 as the experience.
            return await step.next(-1);
        }
     
    }

    async feedbackStep(step) {
        step.values.interview = step.result;
        return await step.prompt(NAME_PROMPT, 'Why should we hire you?');
    }
    
    async feedbackConfirmStep(step) {
        step.values.feedback = step.result;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity('Thanks, we will right back to you.');

         return await step.prompt(CONFIRM_PROMPT, { prompt: 'Is this okay?' });

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
       
    }

    async summaryStep(step) {
        if (step.result) {
            // Get the current profile object from user state.
            const userProfile = await this.userProfile.get(step.context, new UserProfile());

          //  userProfile.transport = step.values.transport;
            var name = userProfile.name = step.values.name;
            var email = userProfile.email = step.values.email;
            var phone = userProfile.phone = step.values.phone;
            var field = userProfile.field = step.values.field;
            var experience = userProfile.experience = step.values.experience;
            var employed = userProfile.employed = step.values.employed;
            var position = userProfile.position = step.values.position;
            var interview = userProfile.interview = step.values.interview;
            var feedback = userProfile.feeback = step.values.feedback;

            var detail = fd(name, email, phone, field, experience, employed, position, interview, feedback)
            db(detail)
            
            let msg = `Your name is ${userProfile.name}. `;
            msg += `Email id is ${userProfile.email}. `;
            msg += `Phone no, is ${userProfile.phone}. `;
             msg += `You are working field in ${ userProfile.field }`;
            if (userProfile.experience !== -1) {
                msg += ` and your work experience is ${ userProfile.experience } years`;
            }
            if (userProfile.employed !== -1) {
                msg += ` and currently working in ${ userProfile.employed } .`;
            }
            msg += `You have opted for ${userProfile.position}. `;
            msg += `Date scheduled for interview ${userProfile.interview}. `;
            msg += `Why should we hire you: ${userProfile.feeback}`;
            msg += '.';
            await step.context.sendActivity(msg);

        } else {
            await step.context.sendActivity('Thanks. Your profile will not be kept.');
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is the end.
        return await step.endDialog();
    }

    async experiencePromptValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0 ;
    }

    
}



//module.exports.UserProfileDialog = UserProfileDialog
module.exports = {
    UserProfileDialog,
    app
    
}


