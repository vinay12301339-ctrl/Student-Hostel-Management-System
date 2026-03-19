import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Student } from '../models/Student.model';
import { Fee } from '../models/Fee.model';
import { Maintenance } from '../models/Maintenance.model';
import { Notification } from '../models/Notification.model';
import { logger } from '../utils/logger';

export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id })
      .populate('userId', 'name email phone profileImage')
      .populate('roomId');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    logger.error('Get student profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, year, course, address, emergencyContact, preferences } = req.body;

    const student = await Student.findOneAndUpdate(
      { userId: req.user?.id },
      { department, year, course, address, emergencyContact, preferences },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone profileImage');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.status(200).json({ success: true, data: student, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Update student profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id })
      .populate('roomId')
      .lean();

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [pendingFees, openTickets, unreadNotifications] = await Promise.all([
      Fee.find({
        studentId: student._id,
        status: { $in: ['pending', 'overdue', 'partial'] },
      }).lean(),
      Maintenance.countDocuments({
        studentId: student._id,
        status: { $in: ['open', 'in_progress'] },
      }),
      Notification.countDocuments({
        userId: req.user?.id,
        isRead: false,
      }),
    ]);

    const currentMonthFee = await Fee.findOne({
      studentId: student._id,
      month: currentMonth,
      year: currentYear,
    });

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          pendingFeesCount: pendingFees.length,
          pendingFeesAmount: pendingFees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0),
          openTickets,
          unreadNotifications,
          points: student.points,
          badges: student.badges,
        },
        currentMonthFee,
      },
    });
  } catch (error) {
    logger.error('Get student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

export const getStudentId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id })
      .populate('userId', 'name email phone profileImage')
      .populate('roomId', 'roomNumber block floor')
      .lean();

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        studentId: student.studentId,
        name: (student.userId as unknown as { name: string }).name,
        rollNumber: student.rollNumber,
        department: student.department,
        year: student.year,
        course: student.course,
        room: student.roomId,
        checkInDate: student.checkInDate,
        status: student.status,
      },
    });
  } catch (error) {
    logger.error('Get student ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate ID' });
  }
};
