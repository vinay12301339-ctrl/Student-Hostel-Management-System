import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getLeaderboard,
  getMyAchievements,
  awardBadge,
} from '../controllers/gamification.controller';

const router = Router();

router.use(authenticate);

router.get('/leaderboard', getLeaderboard);
router.get('/achievements', getMyAchievements);
router.post('/award-badge', authorize('admin'), awardBadge);

export default router;
