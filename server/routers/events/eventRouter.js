import { Router } from 'express';
import db from '../../database/connection.js';
import rsvpRouter from './rsvpRouter.js';
import invitationsRouter from './invitationsRouter.js';
import isAuthenticated from '../../middleware/authMiddleware.js';

import { validateCreateEvent, validateUpdateEvent, validateEventIdParam } from '../../middleware/eventValidationMiddleware.js';

const router = Router();

router.use('/api/events/:id/invitations', invitationsRouter);

router.use('/api/events/:id/rsvps', rsvpRouter);

router.all('/api/events/:id', validateEventIdParam);
router.all('/api/events/:id/{splat}', validateEventIdParam);

router.get('/api/events', async (req, res) => {
  const currentUserId = req.session.user ? req.session.user.id : null;
  const {
    sortBy = 'date',
    sortOrder = 'ASC',
    userLat,
    userLon,
    timeFilter = 'upcoming',
    locationRequired = 'false',
  } = req.query;

  try {
    const query = db('events as e');

    const selectColumns = [
      'e.*',
      db.raw('ST_X(e.location_point::geometry) as longitude'),
      db.raw('ST_Y(e.location_point::geometry) as latitude'),
    ];

    const now = db.raw('NOW()');
    if (timeFilter === 'upcoming') {
      query.where('e.date_time', '>=', now);
    } else if (timeFilter === 'past') {
      query.where('e.date_time', '<', now);
    }

    if (currentUserId) {
      query.andWhere((builder) => {
        builder.where('e.is_private', false)
          .orWhere((privateBuilder) => {
            privateBuilder.where('e.is_private', true)
              .andWhere('e.created_by_id', currentUserId);
          })
          .orWhereExists((existsBuilder) => {
            existsBuilder.select(1)
              .from('event_invitations as ei')
              .whereRaw('ei.event_id = e.id')
              .andWhere('ei.invitee_id', currentUserId);
          });
      });
    } else {
      query.andWhere('e.is_private', false);
    }

    if (locationRequired === 'true') {
      query.andWhere(function hasLocationPoint() {
        this.whereNotNull('e.location_point');
      });
    }

    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'desc' : 'asc';
    let orderByColumn = 'e.date_time';
    let useOrderByRaw = false;
    let orderByDirection = validSortOrder;

    if (sortBy === 'distance' && userLat != null && userLon != null) {
      const latitude = parseFloat(userLat);
      const longitude = parseFloat(userLon);

      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
        selectColumns.push(
          db.raw(
            'ST_Distance(e.location_point, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters',
            [longitude, latitude],
          ),
        );
        orderByColumn = 'distance_meters';
        useOrderByRaw = true;
        orderByDirection = `${validSortOrder} NULLS LAST`;
      }
    }

    query.select(selectColumns);

    if (useOrderByRaw) {
      query.orderByRaw(`${orderByColumn} ${orderByDirection}`);
    } else {
      query.orderBy(orderByColumn, orderByDirection);
    }

    const events = await query;

    return res.send({ data: events });
  } catch (error) {
    return res.status(500).send({ message: 'Error fetching events. Check server logs.' });
  }
});

router.get('/api/events/:id', async (req, res) => {
  const currentUserId = req.session.user ? req.session.user.id : null;
  const eventId = req.params.id;

  try {
    const query = db('events as e')
      .where('e.id', eventId);

    const selectColumns = [
      'e.*',
      db.raw('ST_X(e.location_point::geometry) as longitude'),
      db.raw('ST_Y(e.location_point::geometry) as latitude'),
    ];

    if (currentUserId) {
      selectColumns.push('er.status as user_rsvp_status');
      query.leftJoin('event_rsvps as er', function joinUserRsvps() {
        this.on('er.event_id', '=', 'e.id')
          .andOn('er.user_id', '=', db.raw('?', [currentUserId]));
      });

      query.andWhere(function filterVisibleEvents() {
        this.where('e.is_private', false)
          .orWhere(function allowPrivateIfOwner() {
            this.where('e.is_private', true)
              .andWhere('e.created_by_id', currentUserId);
          })
          .orWhereExists(function allowIfInvited() {
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
        longitude: eventRow.longitude,
      } : null,
    };

    const rsvpStatusForGoing = 'going';

    if (eventRow.is_private) {
      const attendeesList = await db('event_rsvps as er')
        .join('users as u', 'er.user_id', '=', 'u.id')
        .where('er.event_id', eventId)
        .andWhere('er.status', rsvpStatusForGoing)
        .select(
          'u.id as userId',
          'u.first_name as firstName',
          'u.last_name as lastName',
        );
      eventData.attendees = attendeesList;
      eventData.attendeesCount = attendeesList.length;
    } else {
      const countResult = await db('event_rsvps')
        .where('event_id', eventId)
        .andWhere('status', rsvpStatusForGoing)
        .count('* as goingCount')
        .first();

      eventData.attendeesCount = countResult ? parseInt(countResult.goingCount, 10) : 0;
    }

    return res.send({ data: eventData });
  } catch (error) {
    return res.status(500).send({ message: 'An error occurred while fetching event details.' });
  }
});

router.post('/api/events', isAuthenticated, validateCreateEvent, async (req, res) => {
  const {
    title, description, dateTime, isPrivate, latitude, longitude,
  } = req.body;

  const eventCreatorId = req.session.user.id;

  try {
    const eventToInsert = {
      title,
      description,
      created_by_id: eventCreatorId,
      date_time: dateTime,
      is_private: isPrivate,
    };

    if (
      typeof latitude === 'number' && Number.isFinite(latitude)
      && typeof longitude === 'number' && Number.isFinite(longitude)
    ) {
      eventToInsert.location_point = db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography', [longitude, latitude]);
    } else {
      eventToInsert.location_point = null;
    }

    const [newEvent] = await db('events')
      .insert(eventToInsert)
      .returning('*');

    if (newEvent) {
      return res.status(201).send({ message: 'Event created successfully.', event: newEvent });
    }
    return res.status(500).send({ message: 'Event created, but could not retrieve confirmation data.' });
  } catch (error) {
    return res.status(500).send({ message: 'Database error while creating event.' });
  }
});

router.put('/api/events/:id', isAuthenticated, validateUpdateEvent, async (req, res) => {
  const eventId = req.params.id;
  const currentUserId = req.session.user.id;

  const {
    title, description, dateTime, isPrivate, latitude, longitude,
  } = req.body;
  const updatePayload = {};

  if (title !== undefined) updatePayload.title = title.trim();
  if (description !== undefined) updatePayload.description = description.trim();
  if (dateTime !== undefined) updatePayload.date_time = dateTime;
  if (isPrivate !== undefined) updatePayload.is_private = isPrivate;

  if (latitude !== undefined || longitude !== undefined) {
    if (latitude === null && longitude === null) {
      updatePayload.location_point = null;
    } else {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      updatePayload.location_point = db.raw(
        'ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography',
        [lon, lat],
      );
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    const currentEventData = await db('events as e')
      .where('e.id', eventId)
      .select('e.*', db.raw('ST_X(e.location_point::geometry) as longitude'), db.raw('ST_Y(e.location_point::geometry) as latitude'))
      .first();
    if (!currentEventData) return res.status(404).send({ message: 'Event not found.' });
    return res.status(200).send({ message: 'No valid fields provided for update. Current event data returned.', event: currentEventData });
  }

  updatePayload.updated_at = db.fn.now();

  try {
    const eventToUpdate = await db('events')
      .where({ id: eventId })
      .select('id', 'created_by_id')
      .first();

    if (!eventToUpdate) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    if (eventToUpdate.created_by_id !== currentUserId) {
      return res.status(403).send({ message: 'Forbidden. You are not authorized to update this event.' });
    }

    const [updatedEventRecord] = await db('events')
      .where({ id: eventId, created_by_id: currentUserId })
      .update(updatePayload)
      .returning('*');

    if (!updatedEventRecord) {
      return res.status(404).send({ message: 'Event not found or update failed unexpectedly during final operation.' });
    }

    const finalEventDetails = await db('events as e')
      .where('e.id', updatedEventRecord.id)
      .select('e.*', db.raw('ST_X(e.location_point::geometry) as longitude'), db.raw('ST_Y(e.location_point::geometry) as latitude'))
      .first();

    return res.status(200).send({ message: 'Event updated successfully.', event: finalEventDetails });
  } catch (error) {
    return res.status(500).send({ message: 'An error occurred while updating the event.' });
  }
});

router.delete('/api/events/:id', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const requestUserId = req.session.user.id;

  try {
    const event = await db('events')
      .where({ id: eventId })
      .first();

    if (!event) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    if (requestUserId !== event.created_by_id) {
      return res.status(403).send({ message: 'Forbidden. You are not authorized to delete this event.' });
    }

    const deleteCount = await db('events')
      .where({
        id: eventId,
        created_by_id: requestUserId,
      })
      .del();

    if (deleteCount > 0) {
      return res.status(200).send({ message: 'Event deleted successfully.' });
    }
    return res.status(404).send({ message: 'Event not found or already deleted.' });
  } catch (error) {
    return res.status(500).send({ message: 'Internal server error while trying to delete the event.' });
  }
});

export default router;
