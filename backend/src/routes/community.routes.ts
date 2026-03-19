import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  findRoommateMatches,
  updatePreferences,
} from '../controllers/community.controller';

const router = Router();

router.use(authenticate);

router.get('/roommate-matches', findRoommateMatches);
router.put('/preferences', updatePreferences);

export default router;
