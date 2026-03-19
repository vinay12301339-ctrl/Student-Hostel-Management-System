import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/Notification.model';
import { logger } from '../utils/logger';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const filter: Record<string, unknown> = { userId: req.user?.id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user?.id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    const filter: Record<string, unknown> = { userId: req.user?.id };
    if (ids?.length) filter._id = { $in: ids };

    await Notification.updateMany(filter, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    logger.error('Mark notifications read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};
