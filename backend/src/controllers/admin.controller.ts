import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Student } from '../models/Student.model';
import { Room } from '../models/Room.model';
import { Fee } from '../models/Fee.model';
import { Payment } from '../models/Payment.model';
import { Maintenance } from '../models/Maintenance.model';
import { Booking } from '../models/Booking.model';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      pendingBookings,
      openTickets,
      overdueFeesCount,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'available' }),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'maintenance' }),
      Booking.countDocuments({ status: 'pending' }),
      Maintenance.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Fee.countDocuments({ status: 'overdue' }),
    ]);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const revenueByMonth = await Payment.aggregate([
      {
        $match: { status: 'completed' },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const ticketsByCategory = await Maintenance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
          pendingBookings,
          openTickets,
          overdueFeesCount,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
        },
        charts: {
          revenueByMonth,
          ticketsByCategory,
        },
      },
    });
  } catch (error) {
    logger.error('Get admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, department, page = 1, limit = 20, search } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const skip = (Number(page) - 1) * Number(limit);

    let userFilter: Record<string, unknown> = {};
    if (search) {
      userFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
      const users = await User.find(userFilter).select('_id').lean();
      filter.userId = { $in: users.map(u => u._id) };
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('userId', 'name email phone profileImage')
        .populate('roomId', 'roomNumber block floor')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    logger.error('Get all students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

export const updateStudentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.status(200).json({ success: true, data: student, message: 'Student status updated' });
  } catch (error) {
    logger.error('Update student status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
};

export const getFinancialReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const feeStats = await Fee.aggregate([
      { $match: { year: Number(year) } },
      {
        $group: {
          _id: '$month',
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const paymentMethods = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Number(year), 0, 1), $lt: new Date(Number(year) + 1, 0, 1) },
        },
      },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: { feeStats, paymentMethods },
    });
  } catch (error) {
    logger.error('Get financial report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};
