import { Router } from 'express';
import db from '../../database/connection.js';
import isAuthenticated from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  try {
    const notifications = await db('notifications')
      .where({ user_id: userId, is_read: false })
      .orderBy('created_at', 'desc');
    res.send({ data: notifications });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching notifications.' });
  }
});

router.put('/:id/mark-read', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;

  const notificationId = Number(req.params.id);
  if (Number.isNaN(notificationId) || notificationId <= 0) {
    return res.status(400).send({ message: 'Invalid notification ID parameter.' });
  }

  try {
    const updatedCount = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ is_read: true });

    if (updatedCount > 0) {
      return res.send({ message: 'Notification marked as read.' });
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
