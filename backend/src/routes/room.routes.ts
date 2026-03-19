import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats,
} from '../controllers/room.controller';

const router = Router();

router.get('/', getAllRooms);
router.get('/stats', authenticate, authorize('admin'), getRoomStats);
router.get('/:id', getRoomById);
router.post('/', authenticate, authorize('admin'), createRoom);
router.put('/:id', authenticate, authorize('admin'), updateRoom);
router.delete('/:id', authenticate, authorize('admin'), deleteRoom);

export default router;
