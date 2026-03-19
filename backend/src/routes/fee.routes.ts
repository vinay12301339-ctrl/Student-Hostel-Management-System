import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getMyFees,
  getFeeById,
  generateMonthlyFees,
  updateFeeStatus,
} from '../controllers/fee.controller';

const router = Router();

router.use(authenticate);

router.get('/my', getMyFees);
router.get('/:id', getFeeById);
router.post('/generate', authorize('admin'), generateMonthlyFees);
router.post('/update-overdue', authorize('admin'), updateFeeStatus);

export default router;
