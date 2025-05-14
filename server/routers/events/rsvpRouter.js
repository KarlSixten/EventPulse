import { Router } from 'express';
import db from '../../database/connection.js'

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
    const eventId = req.params.id;
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
        const eventCheckResult = await db.query('SELECT is_private FROM events WHERE id = $1', [eventId]);
        if (eventCheckResult.rows.length === 0) {
            return res.status(404).send({ message: 'Event not found.' });
        }
        if (eventCheckResult.rows[0].is_private) {
            return res.status(403).send({ message: 'RSVPs are not applicable to private events through this endpoint.' });
        }

        const upsertQuery = `
            INSERT INTO event_rsvps (event_id, user_id, status, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (event_id, user_id) 
            DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
            RETURNING id, event_id, user_id, status, created_at, updated_at;
        `;
        
        const result = await db.query(upsertQuery, [eventId, userId, status]);
        
        res.send({ 
            message: 'RSVP status updated successfully.', 
            data: result.rows[0] 
        });

    } catch (error) {
        console.error(`Error setting RSVP for event ${eventId} by user ${userId}:`, error);
        res.status(500).json({ message: 'Failed to update RSVP status.' });
    }
});

export default router;