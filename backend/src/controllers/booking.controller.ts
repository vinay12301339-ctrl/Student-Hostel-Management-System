import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Booking } from '../models/Booking.model';
import { Room } from '../models/Room.model';
import { Student } from '../models/Student.model';
import { Notification } from '../models/Notification.model';
import { io } from '../server';
import { logger } from '../utils/logger';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, checkInDate, notes, type = 'new' } = req.body;

    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room.status !== 'available' && type === 'new') {
      res.status(400).json({ success: false, message: 'Room is not available' });
      return;
    }

    if (room.occupiedCount >= room.capacity && type === 'new') {
      res.status(400).json({ success: false, message: 'Room is at full capacity' });
      return;
    }

    const existingBooking = await Booking.findOne({
      studentId: student._id,
      status: 'pending',
    });

    if (existingBooking) {
      res.status(400).json({ success: false, message: 'You already have a pending booking request' });
      return;
    }

    const booking = await Booking.create({
      studentId: student._id,
      roomId,
      type,
      checkInDate: new Date(checkInDate),
      requestedBy: req.user?.id,
      notes,
    });

    // Notify admins
    const notification = await Notification.create({
      userId: req.user?.id,
      title: 'Booking Request Submitted',
      message: `Your booking request for Room ${room.roomNumber} has been submitted and is pending approval.`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    io.to(`user-${req.user?.id}`).emit('notification', notification);

    logger.info(`Booking created: ${booking._id}`);
    res.status(201).json({ success: true, data: booking, message: 'Booking request submitted successfully' });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const bookings = await Booking.find({ studentId: student._id })
      .populate('roomId', 'roomNumber block floor type monthlyRent')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      requestedBy: req.user?.id,
      status: 'pending',
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found or cannot be cancelled' });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

export const approveBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id).populate('studentId').populate('roomId');
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    booking.status = 'approved';
    booking.approvedBy = req.user?.id as unknown as typeof booking.approvedBy;
    booking.approvedAt = new Date();
    await booking.save();

    // Update room and student
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.occupiedCount += 1;
      if (room.occupiedCount >= room.capacity) {
        room.status = 'occupied';
      }
      if (!room.currentOccupants.includes(booking.studentId as unknown as typeof room.currentOccupants[0])) {
        room.currentOccupants.push(booking.studentId as unknown as typeof room.currentOccupants[0]);
      }
      await room.save();
    }

    const student = await Student.findById(booking.studentId);
    if (student) {
      student.roomId = booking.roomId as unknown as typeof student.roomId;
      student.checkInDate = booking.checkInDate;
      student.status = 'active';
      await student.save();
    }

    const notification = await Notification.create({
      userId: (student as { userId: unknown })?.userId,
      title: 'Booking Approved! 🎉',
      message: `Your room booking has been approved. Check-in date: ${booking.checkInDate.toDateString()}`,
      type: 'booking',
    });

    io.to(`user-${(student as { userId: unknown })?.userId}`).emit('notification', notification);

    res.status(200).json({ success: true, message: 'Booking approved successfully' });
  } catch (error) {
    logger.error('Approve booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve booking' });
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rejectionReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason;
    booking.approvedBy = req.user?.id as unknown as typeof booking.approvedBy;
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking rejected' });
  } catch (error) {
    logger.error('Reject booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject booking' });
  }
};
