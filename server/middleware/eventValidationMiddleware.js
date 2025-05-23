export const validateCreateEvent = (req, res, next) => {
  const {
    title, description, dateTime, isPrivate,
  } = req.body;

  if (!title || title.trim() === ''
        || !description || description.trim() === '' || !dateTime) {
    return res.status(400).send({ message: 'Title, description, and date/time are required and cannot be empty.' });
  }
  if (typeof isPrivate !== 'boolean') {
    return res.status(400).send({ message: "The 'isPrivate' field must be a boolean." });
  }
  const parsedDateTime = new Date(dateTime);
  if (Number.isNaN(parsedDateTime.getTime())) {
    return res.status(400).send({ message: `Invalid date/time format: "${dateTime}".` });
  }
  return next();
};

export const validateUpdateEvent = (req, res, next) => {
  const {
    title, description, dateTime, isPrivate, latitude, longitude,
  } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).send({ message: 'Title, if provided, cannot be empty.' });
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    return res.status(400).send({ message: 'Description, if provided, cannot be empty or just whitespace.' });
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
