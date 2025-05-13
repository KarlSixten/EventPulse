import { Router } from 'express';
import db from '../../database/connection.js'

const router = Router();

import rsvpRouter from './rsvpRouter.js';

router.use("/api/events/:id/rsvps", (req, res, next) => {
    next();
}, rsvpRouter);


router.get("/api/events", async (req, res) => {
    const currentUserId = req.session.user ? req.session.user.id : null;

    const { 
        sortBy,
        sortOrder = 'ASC', // Default
        userLat,
        userLon
    } = req.query;

    const queryParams = [];
    let paramCounter = 1;

    // Base select
    let selectFields = `SELECT id, title, description, location_point, date_time, created_by_id, ST_X(location_point::geometry) AS "latitude",
    ST_Y(location_point::geometry) AS "longitude", is_private`;
    
    // Filter out past events
    let fromAndWhereClause = ` FROM events WHERE date_time >= NOW()`;

    // Filter out events the user does not have access to.
    if (currentUserId) {
        fromAndWhereClause += ` AND (is_private = FALSE OR (is_private = TRUE AND created_by_id = $${paramCounter}))`;
        queryParams.push(currentUserId);
        paramCounter++;
    } else {
        fromAndWhereClause += ` AND is_private = FALSE`;
    }

    
    let orderByClause = ` ORDER BY date_time ASC`;
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortBy === 'date') {
        orderByClause = ` ORDER BY date_time ${validSortOrder}`;
    } else if (sortBy === 'distance') {
        const latitude = parseFloat(userLat);
        const longitude = parseFloat(userLon);

        if (!isNaN(latitude) && !isNaN(longitude)) {
            selectFields += `, ST_Distance(location_point, ST_SetSRID(ST_MakePoint($${paramCounter++}, $${paramCounter++}), 4326)::geography) AS distance_meters`;
            queryParams.push(longitude);
            queryParams.push(latitude);
            orderByClause = ` ORDER BY distance_meters ${validSortOrder} NULLS LAST`;
        } else {
            console.warn("Distance sort requested without valid userLat/userLon; defaulting to date sort.");
        }
    }
    const finalQuery = selectFields + fromAndWhereClause + orderByClause;

    try {
        const result = await db.query(finalQuery, queryParams);
        
        res.send({
            data: result.rows
        });

    } catch (error) {
        console.error("Error fetching sorted/filtered events:", error);
        res.status(500).send({ message: "Error fetching events. Check server logs." });
    }
});

router.get("/api/events/:id", async (req, res) => {
    const currentUserId = req.session.user ? req.session.user.id : null;
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
        return res.status(400).send({ message: "Invalid event ID format." });
    }

    const queryParams = [];
    let queryBase = `
        SELECT
            e.id,
            e.title,
            e.description,
            e.date_time,
            e.location_point,
            ST_X(e.location_point::geometry) AS "longitude",
            ST_Y(e.location_point::geometry) AS "latitude",
            e.is_private,
            e.created_by_id
    `;

    let fromAndJoinClause = ` FROM events e `;
    
    if (currentUserId) {
        queryBase += `, er.status AS user_rsvp_status `;
        queryParams.push(currentUserId); 
        fromAndJoinClause += ` LEFT JOIN event_rsvps er ON er.event_id = e.id AND er.user_id = $${queryParams.length} `;
    } else {
        queryBase += `, NULL AS user_rsvp_status `;
    }

    queryParams.push(eventId);
    let whereClause = ` WHERE e.id = $${queryParams.length} `;

    if (currentUserId) {
        queryParams.push(currentUserId); 
        whereClause += ` AND (e.is_private = FALSE OR (e.is_private = TRUE AND e.created_by_id = $${queryParams.length}))`;
    } else {
        whereClause += ` AND e.is_private = FALSE`;
    }

    const finalQuery = queryBase + fromAndJoinClause + whereClause;

    try {

        const result = await db.query(finalQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: `No event found with ID: ${eventId}, or you do not have access to view it.` });
        }

        const row = result.rows[0];

        const eventData = {
            id: row.id,
            title: row.title,
            description: row.description,
            dateTime: row.date_time,
            isPrivate: row.is_private,
            createdById: row.created_by_id,
            userRsvpStatus: row.user_rsvp_status,
            location: null
        };

        if (row.longitude !== null && row.latitude !== null) {
            eventData.location = {
                latitude: row.latitude,
                longitude: row.longitude
            };
        }

        res.send({ data: eventData });

    } catch (error) {
        console.error(`Error fetching event by ID (${eventId}):`, error);
        res.status(500).send({ message: "An error occurred while fetching event details." });
    }
});


router.post("/api/events", async (req, res) => {
    const title = req.body.title && req.body.title.trim();
    const description = req.body.description && req.body.description.trim();
    const dateTime = req.body.dateTime

    if (!title || !description || !dateTime) {
        return res.status(400).send({ message: "Title, description and date/time cannot be empty." });
    }

    const latitude = req.body?.latitude;
    const longitude = req.body?.longitude;

    const isPrivate = req.body.isPrivate;

    const eventCreatorId = req.session.user?.id;

    if (!eventCreatorId) {
        return res.status(401).send({ message: 'Please log in to create an event.' });
    }

    try {
        const insertQuery = `
            INSERT INTO events (title, description, created_by_id, location_point, date_time, is_private) 
            VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7) 
            RETURNING id, title, description, created_by_id, location_point, date_time, is_private`;

        const result = await db.query(insertQuery, [title, description, eventCreatorId, longitude, latitude, dateTime, isPrivate]);

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