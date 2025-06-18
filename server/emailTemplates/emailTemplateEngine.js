import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import juice from 'juice';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const APP_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5173';
const css = await readFile(path.join(dirname, 'templates', 'styles.css'), 'utf8');

async function populateTemplate(templateName, data, extension) {
  try {
    const templatePath = path.join(dirname, 'templates', templateName, `${templateName}.${extension}`);

    const initialContent = await readFile(templatePath, 'utf-8');

    const populatedContent = Object.entries(data).reduce(
      (currentContent, [key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g'); // 'g'-flag sørger for at udskifte alle keys, ikke kune første
        return currentContent.replaceAll(placeholder, value || '');
      },
      initialContent,
    );

    return extension === 'html' ? juice(populatedContent, { extraCss: css }) : populatedContent;
  } catch (error) {
    return extension === 'html' ? '<p>Error loading email content.</p>' : 'Error loading email content.';
  }
}

async function getEmailContent(templateName, data) {
  const [html, text] = await Promise.all([
    populateTemplate(templateName, data, 'html'),
    populateTemplate(templateName, data, 'txt'),
  ]);
  return { html, text };
}

export function getSignUpConfirmationContent(firstName) {
  const data = {
    firstName,
    discoverPageUrl: `${APP_URL}/discover`,
    websiteUrl: APP_URL,
    currentYear: new Date().getFullYear(),
  };
  return getEmailContent('sign-up-confirmation', data);
}

export function getInvitationContent(event, message, inviterFirstName) {
  let customMessageHtml = '';
  let customMessageText = '';
  if (message && message.trim() !== '') {
    customMessageHtml = `<div class="message-box"><p>A message from ${inviterFirstName}:<br>${message.replace(/\n/g, '<br>')}</p></div>`;
    customMessageText = `\n${inviterFirstName} added a message for you:\n"${message}"\n`;
  }

  const data = {
    inviterFirstName,
    eventTitle: event.title,
    eventUrl: `${APP_URL}/events/${event.id}`,
    customMessageHtml,
    customMessageText,
    currentYear: new Date().getFullYear(),
    websiteUrl: APP_URL,
  };
  return getEmailContent('invitation', data);
}

export function getTicketConfirmationContent(event, ticket, qrCodeDataUrl) {
  const formattedDate = new Date(event.date_time).toLocaleString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const formattedPrice = new Intl.NumberFormat('da-DK', {
    style: 'currency', currency: 'DKK',
  }).format(ticket.amountPaid / 100);

  const data = {
    customerName: ticket.customerName,
    eventTitle: event.title,
    qrCodeDataUrl,
    formattedDate,
    formattedPrice,
    ticketPublicId: ticket.publicId,
    eventUrl: `${APP_URL}/events/${event.id}`,
    currentYear: new Date().getFullYear(),
    websiteUrl: APP_URL,
  };
  return getEmailContent('ticket-confirmation', data);
}

export function getResetPasswordEmailContent(resetLink) {
  const currentYear = new Date().getFullYear();
  const data = {
    resetLink,
    linkExpirationTime: '60 minutes',
    currentYear,
    websiteUrl: APP_URL,
  };
  return getEmailContent('reset-password', data);
}
