/* eslint-disable no-console */

import nodemailer from 'nodemailer';
import qrcode from 'qrcode';
import {
  getSignUpConfirmationPlainTextContent,
  getSignUpConfirmationHtmlContent,
  getInvitationPlainTextContent,
  getInvitationHtmlContent,
  getTicketConfirmationPlainTextContent,
  getTicketConfirmationHtmlContent,
  getResetPasswordEmailPlainTextContent,
  getResetPasswordEmailHtmlContent,
} from './emailTemplates.js';

const emailAuth = {
  user: process.env.EMAILUSER,
  pass: process.env.EMAILPASSWORD,
};

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
    html: getSignUpConfirmationHtmlContent(firstName),
  };

  try {
    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error while sending sign up confirmation to ${email}:`, error);
  }
}

export async function sendEventInvitationEmail(inviteeEmail, event, message, inviterFirstName) {
  const emailStructure = {
    from: 'EventPulse Team',
    to: inviteeEmail,
    subject: `${inviterFirstName} invited you to an event!`,
    text: getInvitationPlainTextContent(event, message, inviterFirstName),
    html: getInvitationHtmlContent(event, message, inviterFirstName),
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

    const emailStructure = {
      from: 'EventPulse Team',
      to: ticket.customerEmail,
      subject: `Your Ticket for "${event.title}" is Confirmed!`,
      text: getTicketConfirmationPlainTextContent(event, ticket),
      html: getTicketConfirmationHtmlContent(event, ticket, qrCodeDataURL),
    };

    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error while sending ticket to ${ticket.customerEmail}:`, error);
  }
}

export async function sendForgotPasswordEmail(createdToken) {
  const resetLink = `http://localhost:${process.env.PORT || 5173}/reset-password?token=${createdToken.uuid}`;

  try {
    const emailStructure = {
      from: 'EventPulse Team',
      to: createdToken.email,
      subject: 'Password reset link.',
      text: getResetPasswordEmailPlainTextContent(resetLink),
      html: getResetPasswordEmailHtmlContent(resetLink),
    };

    await transporter.sendMail(emailStructure);
  } catch (error) {
    console.error(`Error while sending ticket to ${createdToken.email}:`, error);
  }
}
