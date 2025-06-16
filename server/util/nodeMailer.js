/* eslint-disable no-console */
import nodemailer from 'nodemailer';
import qrcode from 'qrcode';
import {
  getInvitationContent,
  getResetPasswordEmailContent,
  getSignUpConfirmationContent,
  getTicketConfirmationContent,
} from '../emailTemplates/emailTemplateEngine.js';

const emailAuth = {
  user: process.env.EMAILUSER,
  pass: process.env.EMAILPASSWORD,
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: emailAuth,
});

export async function sendSignUpConfirmationEmail(firstName, email) {
  const { html, text } = await getSignUpConfirmationContent(firstName);

  const emailStructure = {
    from: 'EventPulse Team',
    to: email,
    subject: 'Welcome to EventPulse! Your Account is Ready.',
    text,
    html,
  };

  try {
    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error caught while sending sign up confirmation to ${email}:`, error);
  }
}

export async function sendEventInvitationEmail(inviteeEmail, event, message, inviterFirstName) {
  const { html, text } = await getInvitationContent(event, message, inviterFirstName);

  const emailStructure = {
    from: 'EventPulse Team',
    to: inviteeEmail,
    subject: `${inviterFirstName} invited you to an event!`,
    text,
    html,
  };

  try {
    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error while sending sign up confirmation to ${inviteeEmail}:`, error);
  }
}

export async function sendTicketEmail(ticket, event) {
  try {
    const qrCodeDataURL = await qrcode.toDataURL(ticket.publicId);

    const { html, text } = await getTicketConfirmationContent(event, ticket, qrCodeDataURL);

    const emailStructure = {
      from: 'EventPulse Team',
      to: ticket.customerEmail,
      subject: `Your Ticket for "${event.title}" is Confirmed!`,
      text,
      html,
    };

    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error while sending ticket to ${ticket.customerEmail}:`, error);
  }
}

export async function sendResetPasswordEmail(createdToken) {
  const resetLink = `http://localhost:${process.env.PORT || 5173}/reset-password?token=${createdToken.uuid}`;

  const { html, text } = await getResetPasswordEmailContent(resetLink);

  try {
    const emailStructure = {
      from: 'EventPulse Team',
      to: createdToken.email,
      subject: 'Password reset link.',
      text,
      html,
    };

    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error while sending ticket to ${createdToken.email}:`, error);
  }
}
