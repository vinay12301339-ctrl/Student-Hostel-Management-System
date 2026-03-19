import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Room } from '../models/Room.model';
import { logger } from '../utils/logger';

export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      type,
      status,
      block,
      minRent,
      maxRent,
      hasAC,
      hasWifi,
      page = 1,
      limit = 20,
    } = req.query;

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (block) filter.block = block;
    if (minRent || maxRent) {
      filter.monthlyRent = {};
      if (minRent) (filter.monthlyRent as Record<string, number>).$gte = Number(minRent);
      if (maxRent) (filter.monthlyRent as Record<string, number>).$lte = Number(maxRent);
    }
    if (hasAC === 'true') filter['features.hasAC'] = true;
    if (hasWifi === 'true') filter['features.hasWifi'] = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [rooms, total] = await Promise.all([
      Room.find(filter).skip(skip).limit(Number(limit)).lean(),
      Room.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get rooms error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('currentOccupants', 'studentId rollNumber')
      .lean();

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    logger.error('Get room by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch room' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.create(req.body);
    logger.info(`Room created: ${room.roomNumber}`);
    res.status(201).json({ success: true, data: room, message: 'Room created successfully' });
  } catch (error) {
    logger.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Failed to create room' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({ success: true, data: room, message: 'Room updated successfully' });
  } catch (error) {
    logger.error('Update room error:', error);
    res.status(500).json({ success: false, message: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room.occupiedCount > 0) {
      res.status(400).json({ success: false, message: 'Cannot delete occupied room' });
      return;
    }

    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    logger.error('Delete room error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room' });
  }
};

export const getRoomStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalOccupied: { $sum: '$occupiedCount' },
        },
      },
    ]);

    const byType = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRent: { $avg: '$monthlyRent' },
        },
      },
    ]);

    res.status(200).json({ success: true, data: { byStatus: stats, byType } });
  } catch (error) {
    logger.error('Get room stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
