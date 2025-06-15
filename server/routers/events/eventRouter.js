import { Router } from 'express';
import db from '../../database/connection.js';
import rsvpRouter from './rsvpRouter.js';
import invitationsRouter from './invitationsRouter.js';
import typesRouter from './typesRouter.js';
import isAuthenticated from '../../middleware/authMiddleware.js';

import { validateCreateEvent, validateUpdateEvent, validateEventIdParam } from '../../middleware/eventValidationMiddleware.js';

const router = Router();

router.use('/types', typesRouter);

router.all('/:id', validateEventIdParam);
router.all('/:id/{splat}', validateEventIdParam);

router.use('/:id/invitations', invitationsRouter);
router.use('/:id/rsvps', rsvpRouter);

router.get('/', async (req, res) => {
  const currentUserId = req.session.user ? req.session.user.id : null;
  const {
    sortBy = 'date',
    sortOrder = 'ASC',
    typeFilter,
    userLat,
    userLon,
    timeFilter = 'upcoming',
    locationRequired = 'false',
    searchQuery = null,
  } = req.query;

  try {
    const query = db('events as e').leftJoin('event_types as et', 'e.type_id', 'et.id');

    const selectColumns = [
      'e.id',
      'e.title',
      'et.id as typeId',
      'et.name as typeName',
      'e.description',
      'e.date_time as dateTime',
      'e.created_by_id as createdById',
      'e.is_private as isPrivate',
      'e.price',
      'e.accepts_online_payment as acceptsOnlinePayment',
      'e.accepts_venue_payment as acceptsVenuePayment',
      'e.created_at as createdAt',
      'e.updated_at as updatedAt',
      db.raw('ST_X(e.location_point::geometry) as longitude'),
      db.raw('ST_Y(e.location_point::geometry) as latitude'),
    ];

    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.trim();
      query.andWhere(function search() {
        this.where('e.title', 'ilike', `%${searchTerm}%`)
          .orWhere('e.description', 'ilike', `%${searchTerm}%`);
      });
    }

    const now = db.raw('NOW()');
    if (timeFilter === 'upcoming') {
      query.where('e.date_time', '>=', now);
    } else if (timeFilter === 'past') {
      query.where('e.date_time', '<', now);
    }

    if (currentUserId) {
      query.andWhere(function filterByUserVisibility() {
        this.where('e.is_private', false)
          .orWhere(function allowIfPrivateAndOwner() {
            this.where('e.is_private', true)
              .andWhere('e.created_by_id', currentUserId);
          })
          .orWhereExists(function allowIfInvitedToEvent() {
            this.select(1)
              .from('event_invitations as ei')
              .whereRaw('ei.event_id = e.id')
              .andWhere('ei.invitee_id', currentUserId);
          });
      });
    } else {
      query.andWhere('e.is_private', false);
    }

    if (locationRequired === 'true') {
      query.andWhere(function filterByLocationPoint() {
        this.whereNotNull('e.location_point');
      });
    }

    if (typeFilter) {
      const typeIds = typeFilter.split(',').map((id) => parseInt(id, 10));
      if (typeIds.length > 0) {
        query.whereIn('e.type_id', typeIds);
      }
    }

    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'desc' : 'asc';

    if (sortBy === 'distance' && userLat != null && userLon != null) {
      query.andWhere(function filterByLocationPoint() {
        this.whereNotNull('e.location_point');
      });
      const latitude = parseFloat(userLat);
      const longitude = parseFloat(userLon);
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
        selectColumns.push(
          db.raw(
            'ST_Distance(e.location_point, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as "distanceMeters"',
            [longitude, latitude],
          ),
        );
        query.orderByRaw(`"distanceMeters" ${validSortOrder} NULLS LAST`);
      }
    } else if (sortBy === 'price') {
      query.orderByRaw(`e.price::numeric ${validSortOrder}`);
    } else {
      query.orderBy('e.date_time', validSortOrder);
    }

    query.select(selectColumns);

    const flatEvents = await query;

    const nestedEvents = flatEvents.map((eventRow) => ({
      id: eventRow.id,
      title: eventRow.title,
      description: eventRow.description,
      type: {
        id: eventRow.typeId,
        name: eventRow.typeName,
      },
      dateTime: eventRow.dateTime,
      isPrivate: eventRow.isPrivate,
      price: Number(eventRow.price),
      acceptsOnlinePayment: eventRow.acceptsOnlinePayment,
      acceptsVenuePayment: eventRow.acceptsVenuePayment,
      createdById: eventRow.createdById,
      distanceMeters: eventRow.distanceMeters,
      location: (eventRow.longitude !== null && eventRow.latitude !== null) ? {
        latitude: eventRow.latitude,
        longitude: eventRow.longitude,
      } : null,
    }));

    return res.send({ data: nestedEvents });
  } catch (error) {
    return res.status(500).send({ message: 'Error fetching events. Check server logs.' });
  }
});

router.get('/:id', async (req, res) => {
  const currentUserId = req.session.user ? req.session.user.id : null;
  const eventId = req.params.id;

  try {
    const query = db('events as e').leftJoin('event_types as et', 'e.type_id', 'et.id')
      .where('e.id', eventId);

    const selectColumns = [
      'e.id',
      'e.title',
      'et.id as typeId',
      'et.name as typeName',
      'e.description',
      'e.date_time as dateTime',
      'e.created_by_id as createdById',
      'e.is_private as isPrivate',
      'e.price',
      'e.accepts_online_payment as acceptsOnlinePayment',
      'e.accepts_venue_payment as acceptsVenuePayment',
      'e.created_at as createdAt',
      'e.updated_at as updatedAt',
      db.raw('ST_X(e.location_point::geometry) as longitude'),
      db.raw('ST_Y(e.location_point::geometry) as latitude'),
    ];

    if (currentUserId) {
      selectColumns.push('er.status as user_rsvp_status');
      query.leftJoin('event_rsvps as er', function joinUserRsvpsCallback() {
        this.on('er.event_id', '=', 'e.id')
          .andOn('er.user_id', '=', db.raw('?', [currentUserId]));
      });

      query.andWhere(function eventVisibilityCallback() {
        this.where('e.is_private', false)
          .orWhere(function privateAndOwnerCallback() {
            this.where('e.is_private', true)
              .andWhere('e.created_by_id', currentUserId);
          })
          .orWhereExists(function invitationExistsCallback() {
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
      type: {
        id: eventRow.typeId,
        name: eventRow.typeName,
      },
      dateTime: eventRow.dateTime,
      isPrivate: eventRow.isPrivate,
      price: Number(eventRow.price),
      acceptsOnlinePayment: eventRow.acceptsOnlinePayment,
      acceptsVenuePayment: eventRow.acceptsVenuePayment,
      createdById: eventRow.createdById,
      userRsvpStatus: eventRow.user_rsvp_status,
      location: (eventRow.longitude !== null && eventRow.latitude !== null) ? {
        latitude: eventRow.latitude,
        longitude: eventRow.longitude,
      } : null,
    };

    const rsvpStatusForGoing = 'going';

    if (eventData.isPrivate) {
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

router.post('/', isAuthenticated, validateCreateEvent, async (req, res) => {
  const {
    title,
    description,
    typeId,
    dateTime,
    isPrivate,
    price,
    latitude,
    longitude,
    acceptsOnlinePayment,
    acceptsVenuePayment,
  } = req.body;

  const eventCreatorId = req.session.user.id;

  try {
    const eventToInsert = {
      title,
      description,
      type_id: typeId,
      created_by_id: eventCreatorId,
      date_time: dateTime,
      is_private: isPrivate,
      price,
      accepts_online_payment: acceptsOnlinePayment,
      accepts_venue_payment: acceptsVenuePayment,
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
      return res.status(201).send({
        message: 'Event created successfully.',
        data: {
          event: newEvent,
        },
      });
    }
    return res.status(500).send({ message: 'Event created, but could not retrieve confirmation data.' });
  } catch (error) {
    return res.status(500).send({ message: 'Database error while creating event.' });
  }
});

router.put('/:id', isAuthenticated, validateUpdateEvent, async (req, res) => {
  const eventId = req.params.id;
  const currentUserId = req.session.user.id;

  const {
    title,
    description,
    typeId,
    dateTime,
    isPrivate,
    price,
    acceptsOnlinePayment,
    acceptsVenuePayment,
    latitude,
    longitude,
  } = req.body;
  const updatePayload = {};

  if (title !== undefined) updatePayload.title = title.trim();
  if (description !== undefined) updatePayload.description = description.trim();
  if (typeId !== undefined) updatePayload.type_id = typeId;
  if (dateTime !== undefined) updatePayload.date_time = dateTime;
  if (isPrivate !== undefined) updatePayload.is_private = isPrivate;
  if (price !== undefined) updatePayload.price = price;
  // eslint-disable-next-line max-len
  if (acceptsOnlinePayment !== undefined) updatePayload.accepts_online_payment = acceptsOnlinePayment;
  if (acceptsVenuePayment !== undefined) updatePayload.accepts_venue_payment = acceptsVenuePayment;

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

    return res.status(200).send({
      message: 'Event updated successfully.',
      data: {
        event: finalEventDetails,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: 'An error occurred while updating the event.' });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
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
