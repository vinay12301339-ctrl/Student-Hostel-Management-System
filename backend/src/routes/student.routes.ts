import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentDashboard,
  getStudentId,
} from '../controllers/student.controller';

const router = Router();

router.use(authenticate);

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/dashboard', getStudentDashboard);
router.get('/id-card', getStudentId);

export default router;
