import { Router } from 'express';
import db from '../../database/connection.js';
import { sendEventInvitationEmail } from '../../util/nodeMailer.js';

const router = Router({ mergeParams: true });


router.post('/', async (req, res) => {
    const eventId = Number(req.params.id);

    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).send({ message: "Invalid event ID." });
    }

    const invitee_email = req.body?.invitee_email;
    const message = req.body?.message;

    if (!req.session.user || !req.session.user.id) {
        return res.status(401).send({ message: "Authentication required to send invitations." });
    }
    const inviterId = Number(req.session.user.id);

    if (!invitee_email || typeof invitee_email !== 'string' || invitee_email.trim() === '') {
        return res.status(400).send({ message: "Invitee email is required." });
    }
    const normalizedInviteeEmail = invitee_email.trim().toLowerCase();

    if (req.session.user.email && normalizedInviteeEmail === req.session.user.email.toLowerCase()) {
        return res.status(400).send({ message: "You cannot invite yourself." });
    }

    try {
        const eventQuery = 'SELECT id, title, created_by_id, is_private FROM events WHERE id = $1';
        const eventResult = await db.query(eventQuery, [eventId]);

        if (eventResult.rows.length === 0) {
            return res.status(404).send({ message: "Event not found." });
        }
        const eventDetails = eventResult.rows[0];

        if (eventDetails.is_private === true) {
            if (eventDetails.created_by_id !== inviterId) {
                return res.status(403).send({ message: "Forbidden: Only the event creator can send invitations for this private event." });
            }
        }

        const inviteeUserResult = await db.query('SELECT id FROM users WHERE lower(email) = $1', [normalizedInviteeEmail]);

        if (inviteeUserResult.rows.length === 0) {
            return res.status(404).send({
                message: `No registered user found with email '${invitee_email}'. Please ensure they have an account.`
            });
        }
        const actualInviteeId = inviteeUserResult.rows[0].id;

        const existingInviteResult = await db.query(
            'SELECT id FROM event_invitations WHERE event_id = $1 AND invitee_id = $2',
            [eventId, actualInviteeId]
        );
        if (existingInviteResult.rows.length > 0) {
            return res.status(409).send({ message: "This user has already been invited to this event." });
        }

        const newInvitationQuery = `
            INSERT INTO event_invitations (event_id, inviter_id, invitee_id, message, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
            RETURNING id, event_id, inviter_id, invitee_id, status, message, created_at;
        `;
        const newInvitationResult = await db.query(newInvitationQuery, [eventId, inviterId, actualInviteeId, message]);

        // Commented out to lessen spam
        // sendEventInvitationEmail(normalizedInviteeEmail, eventDetails, message, req.session.user.firstName)

        res.status(201).send({
            message: `Invitation sent successfully to ${invitee_email}.`,
            data: newInvitationResult.rows[0]
        });

    } catch (error) {
        console.error(`Error sending invitation for event ${eventId}:`, error);
        res.status(500).send({ message: "Failed to send invitation due to a server error." });
    }
});

export default router;