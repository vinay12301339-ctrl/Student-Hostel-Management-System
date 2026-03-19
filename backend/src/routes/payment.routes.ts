import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  processPayment,
  getPaymentHistory,
  getPaymentById,
} from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.post('/process', processPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentById);

export default router;
