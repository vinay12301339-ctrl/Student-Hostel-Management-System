import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
} from '../controllers/booking.controller';

const router = Router();

router.use(authenticate);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/approve', authorize('admin'), approveBooking);
router.patch('/:id/reject', authorize('admin'), rejectBooking);

export default router;
