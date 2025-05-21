import { Router } from 'express';
import db from '../../database/connection.js'

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
    const eventId = Number(req.params.id);
    const status = req.body?.status;

    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).send({ message: "Invalid event ID." });
    }

    if (!req.session.user) {
        return res.status(401).send({ message: "Authentication required to RSVP." });
    }
    const userId = req.session.user.id;

    if (!['going', 'maybe', 'not_going'].includes(status)) {
        return res.status(400).send({ message: "Invalid RSVP status. Must be 'going', 'maybe', or 'not_going'." });
    }

    try {
        const event = await db('events')
            .where({ id: eventId })
            .select('id', 'is_private', 'created_by_id')
            .first();

        if (!event) {
            return res.status(404).send({ message: 'Event not found.' });
        }

        let canRsvp = false;
        if (!event.is_private) {
            canRsvp = true;
        } else {
            if (event.created_by_id === userId) {
                canRsvp = true;
            } else {
                const invitation = await db('event_invitations')
                    .where({
                        event_id: eventId,
                        invitee_id: userId
                    })
                    .select('id')
                    .first();

                if (invitation) {
                    canRsvp = true;
                }
            }
        }

        if (!canRsvp) {
            return res.status(403).send({ message: 'You do not have permission to RSVP to this event.' });
        }

        const [rsvpRecord] = await db('event_rsvps')
            .insert({
                event_id: eventId,
                user_id: userId,
                status: status
            })
            .onConflict(['event_id', 'user_id'])
            .merge({
                status: status,
                updated_at: db.fn.now()
            })
            .returning(['id', 'event_id', 'user_id', 'status', 'created_at', 'updated_at']);

        if (rsvpRecord) {
            res.send({
                message: 'RSVP status updated successfully.',
                data: rsvpRecord
            });
        } else {
            res.status(500).send({ message: 'Failed to update RSVP status or retrieve confirmation.' });
        }

    } catch (error) {
        console.error(`Error setting RSVP for event ${eventId} by user ${userId}:`, error);
        res.status(500).send({ message: 'Failed to update RSVP status due to a server error.' });
    }
});

export default router;