import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Payment } from '../models/Payment.model';
import { Fee } from '../models/Fee.model';
import { Student } from '../models/Student.model';
import { Notification } from '../models/Notification.model';
import { io } from '../server';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feeId, amount, method } = req.body;

    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const fee = await Fee.findOne({ _id: feeId, studentId: student._id });
    if (!fee) {
      res.status(404).json({ success: false, message: 'Fee record not found' });
      return;
    }

    const remainingAmount = fee.totalAmount - fee.paidAmount;
    if (amount > remainingAmount) {
      res.status(400).json({ success: false, message: 'Payment amount exceeds due amount' });
      return;
    }

    const transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

    const payment = await Payment.create({
      studentId: student._id,
      feeId,
      amount,
      method,
      status: 'completed',
      transactionId,
    });

    // Update fee
    fee.paidAmount += amount;
    if (fee.paidAmount >= fee.totalAmount) {
      fee.status = 'paid';
    } else {
      fee.status = 'partial';
    }
    await fee.save();

    // Award points for on-time payment
    const now = new Date();
    if (now <= fee.dueDate) {
      student.points += 50;
      if (!student.badges.includes('fast_payer')) {
        student.badges.push('fast_payer');
      }
      await student.save();
    }

    const notification = await Notification.create({
      userId: req.user?.id,
      title: 'Payment Successful ✅',
      message: `Payment of ₹${amount} received successfully. Transaction ID: ${transactionId}`,
      type: 'fee',
      metadata: { transactionId, amount },
    });

    io.to(`user-${req.user?.id}`).emit('notification', notification);

    logger.info(`Payment processed: ${transactionId}`);

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    logger.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment failed' });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const payments = await Payment.find({ studentId: student._id })
      .populate('feeId', 'month year invoiceNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const payment = await Payment.findOne({
      _id: req.params.id,
      studentId: student._id,
    }).populate('feeId');

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    logger.error('Get payment by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment' });
  }
};
