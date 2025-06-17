import { Router } from 'express';
import db from '../../database/connection.js';
import isAuthenticated from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  try {
    const notifications = await db('notifications as n')
      .leftJoin('events as e', 'n.related_event_id', 'e.id')
      .where({ 'n.user_id': userId })
      .select(
        'n.id',
        'n.type',
        'n.message',
        'n.is_read as isRead',
        'n.related_event_id as eventId',
        'e.title as eventName',
        'n.created_at as timestamp',
      )
      .orderBy([
        { column: 'n.is_read', order: 'asc' },
        { column: 'n.created_at', order: 'desc' },
      ]);

    res.send({ data: notifications });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching notifications.' });
  }
});

router.patch('/:id', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const notificationId = Number(req.params.id);
  const { isRead } = req.body;

  if (Number.isNaN(notificationId) || notificationId <= 0) {
    return res.status(400).send({ message: 'Invalid notification ID parameter.' });
  }

  if (typeof isRead !== 'boolean') {
    return res.status(400).send({ message: 'Request body must contain an "isRead" property that is a boolean.' });
  }

  try {
    const updatedCount = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ is_read: isRead });

    if (updatedCount > 0) {
      return res.status(200).send({ message: 'Notification updated successfully.' });
    }
    return res.status(404).send({ message: 'Notification not found or you do not have permission to update it.' });
  } catch (error) {
    return res.status(500).send({ message: 'Error updating notification.' });
  }
});

router.put('/read-all', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  try {
    await db('notifications')
      .where({ user_id: userId })
      .update({ is_read: true });
    res.send({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).send({ message: 'Error updating notifications.' });
  }
});

export default router;
