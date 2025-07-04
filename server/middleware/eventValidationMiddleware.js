import db from '../database/connection.js';

export const validateCreateEvent = async (req, res, next) => {
  const {
    title,
    description,
    typeId,
    dateTime,
    isPrivate,
    price,
    acceptsOnlinePayment,
    acceptsVenuePayment,
  } = req.body;

  if (!title || title.trim() === ''
        || !description || description.trim() === '' || !dateTime) {
    return res.status(400).send({ message: 'Title, description, and date/time are required and cannot be empty.' });
  }
  if (typeof isPrivate !== 'boolean') {
    return res.status(400).send({ message: "The 'isPrivate' field must be a boolean." });
  }

  if (!typeId || !Number.isInteger(typeId)) {
    return res.status(400).send({ message: "The 'typeId' field is required and must be an integer." });
  }

  const parsedDateTime = new Date(dateTime);
  if (Number.isNaN(parsedDateTime.getTime())) {
    return res.status(400).send({ message: `Invalid date/time format: "${dateTime}".` });
  }

  if (price === undefined || (typeof price !== 'number')) {
    return res.status(400).send({ message: "The 'price' field is required and must be an integer." });
  }

  if (typeof acceptsOnlinePayment !== 'boolean' || typeof acceptsVenuePayment !== 'boolean') {
    return res.status(400).send({ message: "The 'acceptsOnlinePayment' and 'acceptsVenuePayment' fields must be booleans." });
  }

  if (price > 0 && (!acceptsOnlinePayment && !acceptsVenuePayment)) {
    return res.status(400).send({ message: 'Specify where guests can purchase tickets.' });
  }

  try {
    const typeExists = await db('event_types').where({ id: typeId }).first();

    if (!typeExists) {
      return res.status(400).send({ message: `Invalid event type ID: ${typeId}. This type does not exist.` });
    }

    return next();
  } catch (error) {
    return res.status(500).send({ message: 'An internal error occurred while validating the event type.' });
  }
};

export const validateUpdateEvent = (req, res, next) => {
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

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).send({ message: 'Title, if provided, cannot be empty.' });
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    return res.status(400).send({ message: 'Description, if provided, cannot be empty or just whitespace.' });
  }

  if (price !== undefined && (typeof price !== 'number')) {
    return res.status(400).send({ message: "The 'price' field is required and must be an integer." });
  }

  if (!(acceptsOnlinePayment === undefined && acceptsVenuePayment === undefined) && (typeof acceptsOnlinePayment !== 'boolean' || typeof acceptsVenuePayment !== 'boolean')) {
    return res.status(400).send({ message: "The 'acceptsOnlinePayment' and 'acceptsVenuePayment' fields must be booleans." });
  }

  if (price !== undefined && (price > 0 && (!acceptsOnlinePayment && !acceptsVenuePayment))) {
    return res.status(400).send({ message: 'Specify where guests can purchase tickets.' });
  }

  if (dateTime !== undefined) {
    const parsedDateTime = new Date(dateTime);
    if (Number.isNaN(parsedDateTime.getTime())) {
      return res.status(400).send({ message: `Invalid date/time format: "${dateTime}".` });
    }
  }
  if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
    return res.status(400).send({ message: 'isPrivate field must be a boolean.' });
  }

  if (typeId !== undefined && (!typeId || !Number.isInteger(typeId))) {
    return res.status(400).send({ message: "The 'typeId' field is required and must be an integer." });
  }

  if (latitude !== undefined || longitude !== undefined) {
    const isClearingLocation = latitude === null && longitude === null;

    const isValidLatitudeValue = (
      latitude !== undefined
      && latitude !== null
      && !Number.isNaN(parseFloat(latitude))
    );
    const isValidLongitudeValue = (
      longitude !== undefined
      && longitude !== null
      && !Number.isNaN(parseFloat(longitude))
    );

    const isProvidingValidCoordinates = isValidLatitudeValue && isValidLongitudeValue;

    if (!(isClearingLocation || isProvidingValidCoordinates)) {
      return res.status(400).send({
        message: 'To update location, provide valid latitude and longitude, or set both to null to clear.',
      });
    }
  }
  return next();
};

export const validateEventIdParam = (req, res, next) => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId) || eventId <= 0) {
    return res.status(400).send({ message: 'Invalid event ID parameter.' });
  }
  req.params.id = eventId;
  return next();
};
