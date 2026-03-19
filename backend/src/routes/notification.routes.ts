import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMyNotifications,
  markAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/read', markAsRead);

export default router;
