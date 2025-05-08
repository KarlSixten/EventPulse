import { Router } from "express";
import db from '../database/connection.js'

const router = Router();

router.get("/api/events", async (req, res) => {

    try {
        const result = await db.query('SELECT * FROM events');

        res.send({ data: result.rows });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).send({ message: 'Database error' });
    }
});

router.post("/api/events", async (req, res) => {
    const title = req.body.title && req.body.title.trim();
    const description = req.body.description && req.body.description.trim();

    if (!title || !description) {
        return res.status(400).send({ message: "Title and description cannot be empty." });
    }

    const eventCreatorId = req.session.user?.id;

    if (!eventCreatorId) {
        return res.status(401).send({ message: 'Please log in to create an event.' });
    }

    try {
        const insertQuery = 'INSERT INTO events (title, description, created_by_id) VALUES ($1, $2, $3) RETURNING id, title, description, created_by_id';

        const result = await db.query(insertQuery, [title, description, eventCreatorId]);

        if (result.rows && result.rows.length > 0) {
            const newEvent = result.rows[0];
            res.status(201).send({ message: 'Event created successfully.', event: newEvent });
        } else {
            console.error('Event creation did not return expected data.');
            res.status(500).send({ message: 'Event created, but could not retrieve confirmation data.' });
        }

    } catch (error) {
        console.error("Database error creating event:", error);
        res.status(500).send({ message: 'Database error while creating event.' });
    }
})

// UPDATE EVENT 
// UPDATE EVENT 
// UPDATE EVENT 
// UPDATE EVENT 
// UPDATE EVENT 
// UPDATE EVENT 

router.delete("/api/events/:id", async (req, res) => {
    const eventId = Number(req.params.id);
    const requestUserId = req.session.user?.id;

    if (!requestUserId) {
        return res.status(401).send({ message: "Unauthorized. You must be logged in to delete an event." });
    }

    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).send({ message: "Invalid event ID." });
    }

    try {
        const eventQuery = await db.query('SELECT created_by_id FROM events WHERE id = $1', [eventId]);

        if (eventQuery.rows.length === 0) {
            return res.status(404).send({ message: "Event not found." });
        }

        const eventCreatorId = eventQuery.rows[0].created_by_id;

        if (requestUserId !== eventCreatorId) {
            return res.status(403).send({ message: "Forbidden. You are not authorized to delete this event." });
        }

        const deleteResult = await db.query('DELETE FROM events WHERE id = $1 AND created_by_id = $2', [eventId, requestUserId]);

        if (deleteResult.rowCount > 0) {
            res.status(200).send({ message: "Event deleted successfully." });
        } else {
            res.status(404).send({ message: "Event not found or already deleted." });
        }

    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send({ message: "Internal server error while trying to delete the event." });
    }
});

export default router;