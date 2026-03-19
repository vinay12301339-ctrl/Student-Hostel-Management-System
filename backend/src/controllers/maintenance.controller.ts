import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Maintenance } from '../models/Maintenance.model';
import { Student } from '../models/Student.model';
import { Notification } from '../models/Notification.model';
import { io } from '../server';
import { logger } from '../utils/logger';

import { v4 as uuidv4 } from 'uuid';

const getSlaDuration = (priority: string): number => {
  const sla: Record<string, number> = {
    emergency: 4,
    high: 24,
    medium: 72,
    low: 168,
  };
  return sla[priority] || 72;
};

const categorizeIssue = (title: string, description: string): { category: string; suggestion: string } => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('leak') || text.includes('pipe') || text.includes('water')) {
    return { category: 'plumbing', suggestion: 'Check for visible leaks and shut off water supply if necessary.' };
  }
  if (text.includes('electric') || text.includes('light') || text.includes('power') || text.includes('switch')) {
    return { category: 'electrical', suggestion: 'Do not touch exposed wires. Turn off the main switch.' };
  }
  if (text.includes('door') || text.includes('window') || text.includes('furniture')) {
    return { category: 'carpentry', suggestion: 'Secure any loose components to prevent injury.' };
  }
  if (text.includes('wifi') || text.includes('internet') || text.includes('network')) {
    return { category: 'internet', suggestion: 'Try restarting your router. Check if others in your block are affected.' };
  }
  if (text.includes('clean') || text.includes('hygiene') || text.includes('garbage')) {
    return { category: 'cleaning', suggestion: 'Keep the area clean until maintenance arrives.' };
  }
  return { category: 'other', suggestion: 'Document the issue with photos for faster resolution.' };
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority = 'medium', attachments = [] } = req.body;

    const student = await Student.findOne({ userId: req.user?.id }).populate('roomId');
    if (!student || !student.roomId) {
      res.status(404).json({ success: false, message: 'Student or room not found' });
      return;
    }

    const { category, suggestion } = categorizeIssue(title, description);
    const ticketNumber = `TKT-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;
    const slaHours = getSlaDuration(priority);
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = await Maintenance.create({
      studentId: student._id,
      roomId: student.roomId,
      ticketNumber,
      category,
      priority,
      title,
      description,
      attachments,
      slaDeadline,
      aiCategory: category,
      aiSuggestion: suggestion,
    });

    const notification = await Notification.create({
      userId: req.user?.id,
      title: 'Maintenance Ticket Created 🔧',
      message: `Ticket #${ticketNumber} has been created. Our team will respond within ${slaHours} hours.`,
      type: 'maintenance',
      link: `/maintenance/${ticket._id}`,
    });

    io.to(`user-${req.user?.id}`).emit('notification', notification);

    logger.info(`Maintenance ticket created: ${ticketNumber}`);
    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Maintenance ticket created successfully',
    });
  } catch (error) {
    logger.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const { status, category, page = 1, limit = 10 } = req.query;
    const filter: Record<string, unknown> = { studentId: student._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('assignedTo', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Maintenance.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    logger.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

export const rateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, feedback } = req.body;
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const ticket = await Maintenance.findOne({
      _id: req.params.id,
      studentId: student._id,
      status: 'resolved',
    });

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found or not resolved' });
      return;
    }

    ticket.studentRating = rating;
    ticket.studentFeedback = feedback;
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    res.status(200).json({ success: true, message: 'Ticket rated successfully' });
  } catch (error) {
    logger.error('Rate ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to rate ticket' });
  }
};

export const getAllTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('studentId', 'studentId rollNumber')
        .populate('roomId', 'roomNumber block floor')
        .populate('assignedTo', 'name email')
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Maintenance.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    logger.error('Get all tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, resolutionNotes, assignedTo } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
      ticket.assignedAt = new Date();
    }
    if (status === 'resolved') ticket.resolvedAt = new Date();

    // Check SLA breach
    if (status !== 'resolved' && new Date() > ticket.slaDeadline) {
      ticket.isSlaBreach = true;
      ticket.escalationLevel += 1;
    }

    await ticket.save();

    res.status(200).json({ success: true, data: ticket, message: 'Ticket updated successfully' });
  } catch (error) {
    logger.error('Update ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
};
