import nodemailer from 'nodemailer';
import { emailAuth } from './emailAuth.js';
const APP_URL = process.env.PORT || 'http://localhost:5173';
const DISCOVER_PAGE_URL = `${APP_URL}/discover`;
const WEBSITE_URL = APP_URL;

const currentYear = new Date().getFullYear();

function getSignUpConfirmationHtmlContent(firstName) {
    return `
    <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333333; max-width: 580px; margin: 20px auto; padding: 25px; border: 1px solid #dddddd; border-radius: 6px; background-color: #ffffff;">
         
        <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="font-size: 26px; color: #00adb5; margin: 0; font-weight: 600;">Welcome to EventPulse!</h1>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 15px;">Hi ${firstName},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Thanks for signing up to EventPulse! We're excited to have you join our community for discovering and creating local events.</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">You're all set. You can start exploring events now!</p>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${DISCOVER_PAGE_URL}" target="_blank" style="background-color: #00adb5; color: #ffffff; padding: 11px 22px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-right: 10px; display: inline-block;">Discover Events</a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 10px;">If you have any questions, feel free to reach out.</p>
        
        <p style="font-size: 16px;">Best regards,<br>The EventPulse Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 12px; color: #777777;">
            <p style="margin: 0 0 5px 0;">&copy; ${currentYear} EventPulse</p>
            <p style="margin: 0;"><a href="${WEBSITE_URL}" target="_blank" style="color: #00adb5; text-decoration: none;">EventPulse.com</a></p>
        </div>
    </div>`
}

function getSignUpConfirmationPlainTextContent(firstName) {
    `Hi ${firstName},
    
    Thanks for signing up to EventPulse! We're excited to have you join our community for discovering and creating local events.
    
    You're all set. You can start exploring events now!
    
    Discover Events: ${DISCOVER_PAGE_URL}
    
    If you have any questions, feel free to reach out.
    
    Best regards,
    The EventPulse Team
    
    © ${currentYear} EventPulse
    ${WEBSITE_URL}`
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: emailAuth,
});

export async function sendSignUpConfirmationEmail(firstName, email) {
    const emailStructure = {
        from: 'EventPulse Team',
        to: email,
        subject: 'Welcome to EventPulse! Your Account is Ready.',
        text: getSignUpConfirmationPlainTextContent(firstName),
        html: getSignUpConfirmationHtmlContent(firstName)
    };

    try {
        await transporter.sendMail(emailStructure);
    } catch (error) {
        console.error(`Error while sending sign up confirmation to ${email}:`, error);
    }
}

function getInvitationHtmlContent(event, message, inviterFirstName) {
    const EVENT_URL = `${APP_URL}/events/${event.id}`;

    let customMessageHtml = '';
    if (message && message.trim() !== '') {
        customMessageHtml = `
            <div style="margin-bottom: 20px; padding: 12px; background-color: #f0f9fa; border-left: 4px solid #00adb5;">
                <p style="font-size: 15px; margin:0; font-style: italic;">A message from ${inviterFirstName}:<br>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }

    return `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333333; max-width: 580px; margin: 20px auto; padding: 25px; border: 1px solid #dddddd; border-radius: 6px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="font-size: 26px; color: #00adb5; margin: 0; font-weight: 600;">You're Invited!</h1>
            </div>
            <p style="font-size: 16px; margin-bottom: 15px;">Hi there,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterFirstName}</strong> has invited you to join the event: 
                <strong style="color: #00adb5;">"${event.title}"</strong> on EventPulse!
            </p>
            ${customMessageHtml}
            <p style="font-size: 16px; margin-bottom: 15px;">
                You can view more details about the event here: <a href="${EVENT_URL}" target="_blank" style="color: #00adb5; text-decoration: underline;">View Event Details</a>
            </p>
            <p style="font-size: 16px;">We hope this sounds interesting!</p>
            <p style="font-size: 16px;">Best regards,<br>The EventPulse Team</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 12px; color: #777777;">
                <p style="margin: 0 0 5px 0;">&copy; ${currentYear} EventPulse</p>
                <p style="margin: 0;"><a href="${WEBSITE_URL}" target="_blank" style="color: #00adb5; text-decoration: none;">EventPulse.com</a></p>
            </div>
        </div>`;
}

function getInvitationPlainTextContent(event, message, inviterFirstName) {
    const EVENT_URL = `${APP_URL}/events/${event.id}`;

    let plainTextMessage = `Hi there,\n\n${inviterFirstName} has invited you to the event: "${event.title}" on EventPulse!`;

    if (message && message.trim() !== '') {
        plainTextMessage += `\n\n${inviterFirstName} added a message for you:\n"${message}"\n`;
    }

    plainTextMessage += `\n\nView Event Details: ${EVENT_URL}`;
    plainTextMessage += `\n\nWe hope this sounds interesting!\n\nBest regards,\nThe EventPulse Team`;
    plainTextMessage += `\n\n© ${currentYear} EventPulse\n${WEBSITE_URL}`;

    return plainTextMessage;
}

export async function sendEventInvitationEmail(inviteeEmail, event, message, inviterFirstName) {
    const emailStructure = {
        from: 'EventPulse Team',
        to: inviteeEmail,
        subject: `${inviterFirstName} invited you to an event!`,
        text: getInvitationPlainTextContent(event, message, inviterFirstName),
        html: getInvitationHtmlContent(event, message, inviterFirstName)
    };

    try {
        await transporter.sendMail(emailStructure);
    } catch (error) {
        console.error(`Error while sending sign up confirmation to ${email}:`, error);
    }
}