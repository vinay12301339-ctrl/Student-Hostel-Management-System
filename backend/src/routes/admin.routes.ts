import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getAllStudents,
  updateStudentStatus,
  getFinancialReport,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getAllStudents);
router.patch('/students/:id/status', updateStudentStatus);
router.get('/reports/financial', getFinancialReport);

export default router;
