import { Router } from 'express';
import db from '../../database/connection.js';

// import ville skulle bruges i prod/real-world, derfor beholdt
// eslint-disable-next-line no-unused-vars
import { sendEventInvitationEmail } from '../../util/nodeMailer.js';

import getIO from '../../socket.js';
import isAuthenticated from '../../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

router.post('/', isAuthenticated, async (req, res) => {
  const io = getIO();

  const eventId = req.params.id;

  const inviteeEmailInput = req.body?.invitee_email;
  const messageContent = req.body?.message;

  const inviterId = req.session.user.id;
  const inviterFirstName = req.session.user.firstName;

  if (!inviteeEmailInput || typeof inviteeEmailInput !== 'string' || inviteeEmailInput.trim() === '') {
    return res.status(400).send({ message: 'Invitee email is required.' });
  }
  const normalizedInviteeEmail = inviteeEmailInput.trim().toLowerCase();

  if (req.session.user.email && normalizedInviteeEmail === req.session.user.email.toLowerCase()) {
    return res.status(400).send({ message: 'You cannot invite yourself.' });
  }

  try {
    const eventDetails = await db('events')
      .where({ id: eventId })
      .select('id', 'title', 'created_by_id', 'is_private')
      .first();

    if (!eventDetails) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    if (eventDetails.is_private === true) {
      if (eventDetails.created_by_id !== inviterId) {
        return res.status(403).send({ message: 'Forbidden: Only the event creator can send invitations for this private event.' });
      }
    }

    const inviteeUser = await db('users')
      .where(db.raw('lower(email) = ?', [normalizedInviteeEmail]))
      .select('id')
      .first();

    if (!inviteeUser) {
      return res.status(404).send({
        message: `No registered user found with email '${inviteeEmailInput}'. Please ensure they have an account.`,
      });
    }
    const actualInviteeId = inviteeUser.id;

    const existingInvite = await db('event_invitations')
      .where({
        event_id: eventId,
        invitee_id: actualInviteeId,
      })
      .select('id')
      .first();

    if (existingInvite) {
      return res.status(409).send({ message: 'This user has already been invited to this event.' });
    }

    const [newInvitation] = await db('event_invitations')
      .insert({
        event_id: eventId,
        inviter_id: inviterId,
        invitee_id: actualInviteeId,
        message: messageContent,
        status: 'pending',
      })
      .returning(['id', 'event_id', 'inviter_id', 'invitee_id', 'status', 'message', 'created_at']);

    if (newInvitation) {
      const notificationPayload = {
        type: 'event_invitation',
        message: `${inviterFirstName} invited you to the event: "${eventDetails.title}".`,
        eventId: eventDetails.id,
        eventName: eventDetails.title,
        inviterName: inviterFirstName,
        timestamp: new Date().toISOString(),
      };
      io.to(actualInviteeId.toString()).emit('new_notification', notificationPayload);

      // Commented out to lessen spam
      // eslint-disable-next-line max-len
      // sendEventInvitationEmail(normalizedInviteeEmail, eventDetails, messageContent, inviterFirstName);

      return res.status(201).send({
        message: `Invitation sent successfully to ${inviteeEmailInput}.`,
        data: newInvitation,
      });
    }
    return res.status(500).send({ message: 'Failed to create invitation record.' });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to send invitation due to a server error.' });
  }
});

export default router;
