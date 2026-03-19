import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Fee } from '../models/Fee.model';
import { Student } from '../models/Student.model';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const getMyFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const { year, status } = req.query;
    const filter: Record<string, unknown> = { studentId: student._id };
    if (year) filter.year = Number(year);
    if (status) filter.status = status;

    const fees = await Fee.find(filter).sort({ year: -1, month: -1 }).lean();

    const summary = {
      totalDue: fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0),
      totalPaid: fees.reduce((sum, f) => sum + f.paidAmount, 0),
      overdueCount: fees.filter(f => f.status === 'overdue').length,
    };

    res.status(200).json({ success: true, data: { fees, summary } });
  } catch (error) {
    logger.error('Get fees error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fees' });
  }
};

export const getFeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const fee = await Fee.findOne({ _id: req.params.id, studentId: student._id }).lean();
    if (!fee) {
      res.status(404).json({ success: false, message: 'Fee record not found' });
      return;
    }

    res.status(200).json({ success: true, data: fee });
  } catch (error) {
    logger.error('Get fee by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee' });
  }
};

export const generateMonthlyFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, roomRent, messFee = 2500, utilityCharges = 500 } = req.body;

    const activeStudents = await Student.find({ status: 'active', roomId: { $exists: true } });

    const fees = await Promise.all(
      activeStudents.map(async (student) => {
        const invoiceNumber = `INV-${year}-${String(month).padStart(2, '0')}-${uuidv4().split('-')[0].toUpperCase()}`;

        const existing = await Fee.findOne({ studentId: student._id, month, year });
        if (existing) return existing;

        const dueDate = new Date(year, month - 1, 10);
        return Fee.create({
          studentId: student._id,
          month,
          year,
          roomRent: roomRent || 5000,
          messFee,
          utilityCharges,
          extraCharges: 0,
          discount: 0,
          totalAmount: (roomRent || 5000) + messFee + utilityCharges,
          dueDate,
          invoiceNumber,
        });
      })
    );

    res.status(201).json({
      success: true,
      message: `Generated fees for ${fees.length} students`,
      data: { count: fees.length },
    });
  } catch (error) {
    logger.error('Generate fees error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate fees' });
  }
};

export const updateFeeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const updated = await Fee.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${updated.modifiedCount} overdue fees`,
    });
  } catch (error) {
    logger.error('Update fee status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update fee status' });
  }
};
