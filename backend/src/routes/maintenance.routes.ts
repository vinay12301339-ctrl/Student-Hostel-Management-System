import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createTicket,
  getMyTickets,
  rateTicket,
  getAllTickets,
  updateTicketStatus,
} from '../controllers/maintenance.controller';

const router = Router();

router.use(authenticate);

router.post('/', createTicket);
router.get('/my', getMyTickets);
router.patch('/:id/rate', rateTicket);
router.get('/', authorize('admin', 'staff'), getAllTickets);
router.patch('/:id/status', authorize('admin', 'staff'), updateTicketStatus);

export default router;
