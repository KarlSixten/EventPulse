import { Router } from 'express';
import db from '../../database/connection.js'

const router = Router();

import invitationsRouter from './invitationsRouter.js';

router.use("/api/events/:id/invitations", (req, res, next) => {
    next();
}, invitationsRouter);

import rsvpRouter from './rsvpRouter.js';

router.use("/api/events/:id/rsvps", (req, res, next) => {
    next();
}, rsvpRouter);


router.get("/api/events", async (req, res) => {
    const currentUserId = req.session.user ? req.session.user.id : null;
    const {
        sortBy = 'date',
        sortOrder = 'ASC',
        userLat,
        userLon,
        timeFilter = 'upcoming'
    } = req.query;

    try {
        let query = db('events as e');

        const selectColumns = [
            'e.*',
            db.raw('ST_X(e.location_point::geometry) as longitude'),
            db.raw('ST_Y(e.location_point::geometry) as latitude')
        ];

        const now = db.raw('NOW()');
        if (timeFilter === 'upcoming') {
            query.where('e.date_time', '>=', now);
        } else if (timeFilter === 'past') {
            query.where('e.date_time', '<', now);
        }

        if (currentUserId) {
            query.andWhere(function () {
                this.where('e.is_private', false)
                    .orWhere(function () {
                        this.where('e.is_private', true)
                            .andWhere('e.created_by_id', currentUserId);
                    })
                    .orWhereExists(function () {
                        this.select(1)
                            .from('event_invitations as ei')
                            .whereRaw('ei.event_id = e.id')
                            .andWhere('ei.invitee_id', currentUserId);
                    });
            });
        } else {
            query.andWhere('e.is_private', false);
        }

        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'desc' : 'asc';
        let orderByColumn = 'e.date_time';
        let useOrderByRaw = false;
        let orderByDirection = validSortOrder;

        if (sortBy === 'distance' && userLat != null && userLon != null) {
            const latitude = parseFloat(userLat);
            const longitude = parseFloat(userLon);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                selectColumns.push(
                    db.raw(
                        'ST_Distance(e.location_point, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters',
                        [longitude, latitude]
                    )
                );
                orderByColumn = 'distance_meters';
                useOrderByRaw = true;
                orderByDirection = `${validSortOrder} NULLS LAST`;
            } else {
                console.warn("Distance sort requested without valid userLat/userLon; defaulting to date sort.");
            }
        }

        query.select(selectColumns);

        if (useOrderByRaw) {
            query.orderByRaw(`${orderByColumn} ${orderByDirection}`);
        } else {
            query.orderBy(orderByColumn, orderByDirection);
        }

        const events = await query;

        res.send({ data: events });

    } catch (error) {
        console.error("Error fetching sorted/filtered events with Knex:", error);
        res.status(500).send({ message: "Error fetching events. Check server logs." });
    }
});

router.get("/api/events/:id", async (req, res) => {
    const currentUserId = req.session.user ? req.session.user.id : null;
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
        return res.status(400).send({ message: "Invalid event ID format." });
    }

    try {
        let query = db('events as e')
            .where('e.id', eventId);

        const selectColumns = [
            'e.*',
            db.raw('ST_X(e.location_point::geometry) as longitude'),
            db.raw('ST_Y(e.location_point::geometry) as latitude')
        ];

        if (currentUserId) {
            selectColumns.push('er.status as user_rsvp_status');
            query.leftJoin('event_rsvps as er', function () {
                this.on('er.event_id', '=', 'e.id')
                    .andOn('er.user_id', '=', db.raw('?', [currentUserId]));
            });

            query.andWhere(function () {
                this.where('e.is_private', false)
                    .orWhere(function () {
                        this.where('e.is_private', true)
                            .andWhere('e.created_by_id', currentUserId);
                    })
                    .orWhereExists(function () {
                        this.select(1)
                            .from('event_invitations as ei')
                            .whereRaw('ei.event_id = e.id')
                            .andWhere('ei.invitee_id', currentUserId);
                    });
            });
        } else {
            selectColumns.push(db.raw('NULL as user_rsvp_status'));
            query.andWhere('e.is_private', false);
        }

        query.select(selectColumns);

        const eventRow = await query.first();

        if (!eventRow) {
            return res.status(404).send({ message: `No event found with ID: ${eventId}, or you do not have permission to view it.` });
        }

        const eventData = {
            id: eventRow.id,
            title: eventRow.title,
            description: eventRow.description,
            dateTime: eventRow.date_time,
            isPrivate: eventRow.is_private,
            createdById: eventRow.created_by_id,
            userRsvpStatus: eventRow.user_rsvp_status,
            location: (eventRow.longitude !== null && eventRow.latitude !== null) ? {
                latitude: eventRow.latitude,
                longitude: eventRow.longitude
            } : null
        };

        res.send({ data: eventData });

    } catch (error) {
        console.error(`Error fetching event by ID (${eventId}) with Knex:`, error);
        res.status(500).send({ message: "An error occurred while fetching event details." });
    }
});

router.post("/api/events", async (req, res) => {
    const title = req.body.title && req.body.title.trim();
    const description = req.body.description && req.body.description.trim();
    const dateTime = req.body.dateTime
    const isPrivate = req.body.isPrivate

    if (!title || !description || !dateTime) {
        return res.status(400).send({ message: "Title, description and date/time cannot be empty." });
    }

    if (typeof req.body.isPrivate !== 'boolean') {
        return res.status(400).send({ message: "The 'isPrivate' field must be a boolean (true or false)." });
    }

    const parsedDateTime = new Date(dateTime);
    if (isNaN(parsedDateTime.getTime())) {
        return res.status(400).send({
            message: `Invalid date/time format provided: "${dateTime}". Please use a valid ISO 8601 format (e.g., YYYY-MM-DDTHH:MM:SSZ).`
        });
    }

    const latitude = req.body?.latitude;
    const longitude = req.body?.longitude;

    const eventCreatorId = req.session.user?.id;

    if (!eventCreatorId) {
        return res.status(401).send({ message: 'Please log in to create an event.' });
    }

    try {

        const eventToInsert = {
            title: title,
            description: description,
            created_by_id: eventCreatorId,
            date_time: dateTime,
            is_private: isPrivate
        }

        if (!isNaN(latitude) && !isNaN(longitude)) {
            eventToInsert.location_point = db.raw(
                'ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography',
                [longitude, latitude]
            );
        } else {
            eventToInsert.location_point = null;
        }

        const [newEvent] = await db('events')
            .insert(eventToInsert)
            .returning('*');

        if (newEvent) {
            res.status(201).send({ message: 'Event created successfully.', event: newEvent });
        } else {
            console.error('Event creation did not return expected data with Knex.');
            res.status(500).send({ message: 'Event created, but could not retrieve confirmation data.' });
        }

    } catch (error) {
        console.error("Database error creating event:", error);
        res.status(500).send({ message: 'Database error while creating event.' });
    }
})

router.put("/api/events/:id", async (req, res) => {
    const eventId = Number(req.params.id);
    const currentUserId = req.session.user ? req.session.user.id : null;

    if (!currentUserId) {
        return res.status(401).send({ message: "Unauthorized. You must be logged in to update an event." });
    }

    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).send({ message: "Invalid event ID." });
    }

    const { title, description, dateTime, isPrivate, latitude, longitude } = req.body;
    const updatePayload = {};

    if (title !== undefined) {
        const trimmedTitle = title.trim();
        if (trimmedTitle === '') {
            return res.status(400).send({ message: "Title, if provided, cannot be empty." });
        }
        updatePayload.title = trimmedTitle;
    }

    if (description !== undefined) {
        const trimmedDescription = description.trim();
        if (trimmedDescription === '') {
            return res.status(400).send({ message: "Description, if provided for update, cannot be empty or just whitespace." });
        }
        updatePayload.description = trimmedDescription;
    }

    if (dateTime !== undefined) {
        const parsedDateTime = new Date(dateTime);
        if (isNaN(parsedDateTime.getTime())) {
            return res.status(400).send({ message: `Invalid date/time format provided: "${dateTime}". Please use a valid ISO 8601 format.` });
        }
        updatePayload.date_time = dateTime;
    }

    if (isPrivate !== undefined) {
        if (typeof isPrivate !== 'boolean') {
            return res.status(400).send({ message: "The 'isPrivate' field must be a boolean (true or false)." });
        }
        updatePayload.is_private = isPrivate;
    }

    if (latitude !== undefined || longitude !== undefined) {
        const lat = (latitude !== undefined && latitude !== null) ? parseFloat(latitude) : null;
        const lon = (longitude !== undefined && longitude !== null) ? parseFloat(longitude) : null;

        if (latitude === null && longitude === null) {
            updatePayload.location_point = null;
        }

        else if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
            updatePayload.location_point = db.raw(
                'ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography',
                [lon, lat]
            );
        }
        else {
            return res.status(400).send({ message: "To update location, please provide valid numeric latitude and longitude, or set both to null to clear the location." });
        }
    }

    if (Object.keys(updatePayload).length === 0) {
        const currentEventData = await db('events as e')
            .where('e.id', eventId)
            .select(
                'e.*',
                db.raw('ST_X(e.location_point::geometry) as longitude'),
                db.raw('ST_Y(e.location_point::geometry) as latitude')
            )
            .first();

        if (!currentEventData) {
            return res.status(404).send({ message: "Event not found (when checking for no update)." });
        }
        return res.status(200).send({ message: "No valid fields provided for update. Current event data returned.", event: currentEventData });
    }

    updatePayload.updated_at = db.fn.now();

    try {
        const eventToUpdate = await db('events')
            .where({ id: eventId })
            .select('id', 'created_by_id')
            .first();

        if (!eventToUpdate) {
            return res.status(404).send({ message: "Event not found." });
        }

        if (eventToUpdate.created_by_id !== currentUserId) {
            return res.status(403).send({ message: "Forbidden. You are not authorized to update this event." });
        }

        const [updatedEventRecord] = await db('events')
            .where({ id: eventId, created_by_id: currentUserId })
            .update(updatePayload)
            .returning('*');

        if (!updatedEventRecord) {
            return res.status(404).send({ message: "Event not found or update failed unexpectedly during final operation."});
        }
        
        const finalEventDetails = await db('events as e')
            .where('e.id', updatedEventRecord.id)
            .select(
                'e.*',
                db.raw('ST_X(e.location_point::geometry) as longitude'),
                db.raw('ST_Y(e.location_point::geometry) as latitude')
            )
            .first();

        res.status(200).send({ message: "Event updated successfully.", event: finalEventDetails });

    } catch (error) {
        console.error(`Error updating event ${eventId}:`, error);
        res.status(500).send({ message: "An error occurred while updating the event." });
    }
});

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
        const event = await db('events')
            .where({ id: eventId })
            .first();

        if (!event) {
            return res.status(404).send({ message: "Event not found." });
        }

        if (requestUserId !== event.created_by_id) {
            return res.status(403).send({ message: "Forbidden. You are not authorized to delete this event." });
        }

        const deleteCount = await db('events')
            .where({
                id: eventId,
                created_by_id: requestUserId
            })
            .del();

        if (deleteCount > 0) {
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