import { Router } from 'express';
import db from '../../database/connection.js';
import isAuthenticated from '../../middleware/authMiddleware.js';
import getIO from '../../socket.js';

const router = Router({ mergeParams: true });

router.post('/', isAuthenticated, async (req, res) => {
  const io = getIO();

  const eventId = req.params.id;
  const status = req.body?.status;

  const userId = req.session.user.id;

  if (!['going', 'maybe', 'not_going'].includes(status)) {
    return res.status(400).send({ message: "Invalid RSVP status. Must be 'going', 'maybe', or 'not_going'." });
  }

  try {
    const event = await db('events')
      .where({ id: eventId })
      .select('id', 'title', 'is_private', 'created_by_id')
      .first();

    if (!event) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    let canRsvp = false;
    if (!event.is_private || event.created_by_id === userId) {
      canRsvp = true;
    } else {
      const invitation = await db('event_invitations')
        .where({
          event_id: eventId,
          invitee_id: userId,
        })
        .select('id')
        .first();

      if (invitation) {
        canRsvp = true;
      }
    }

    if (!canRsvp) {
      return res.status(403).send({ message: 'You do not have permission to RSVP to this event.' });
    }

    const [rsvpRecord] = await db('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        status,
      })
      .onConflict(['event_id', 'user_id'])
      .merge({
        status,
        updated_at: db.fn.now(),
      })
      .returning(['id', 'event_id', 'user_id', 'status', 'created_at', 'updated_at']);

    if (rsvpRecord && event.is_private) {
      const [dbNotification] = await db('notifications').insert({
        user_id: event.created_by_id,
        type: 'invitee_response',
        message: `${req.session.user.firstName} has RSVP'd '${status}' to your event: '${event.title}'`,
        related_event_id: event.id,
      }).returning('*');

      const finalNotificationPayload = {
        id: dbNotification.id,
        type: dbNotification.type,
        message: dbNotification.message,
        isRead: dbNotification.is_read,
        eventId: dbNotification.related_event_id,
        eventName: event.title,
        timestamp: dbNotification.created_at,
      };

      io.to(event.created_by_id.toString()).emit('new_notification', finalNotificationPayload);
    }
    if (rsvpRecord) {
      return res.send({
        message: 'RSVP status updated successfully.',
        data: rsvpRecord,
      });
    }

    return res.status(500).send({ message: 'Failed to update RSVP status or retrieve confirmation.' });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to update RSVP status due to a server error.' });
  }
});

export default router;
