import { Router } from 'express';
import db from '../../database/connection.js';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const query = db('event_types');

    query.select('id', 'name');

    const eventTypes = await query;

    return res.send({ data: eventTypes });
  } catch (error) {
    return res.status(500).send({ message: 'Error fetching event types. Check server logs.' });
  }
});

export default router;
