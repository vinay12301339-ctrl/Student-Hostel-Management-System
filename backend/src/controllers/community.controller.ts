import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Student } from '../models/Student.model';
import { logger } from '../utils/logger';

export const findRoommateMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentStudent = await Student.findOne({ userId: req.user?.id })
      .populate('userId', 'name email profileImage')
      .lean();

    if (!currentStudent) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const { preferences } = currentStudent;

    const matches = await Student.find({
      _id: { $ne: currentStudent._id },
      status: { $in: ['active', 'pending'] },
      $or: [
        { 'preferences.sleepTime': preferences?.sleepTime },
        { 'preferences.lifestyle': preferences?.lifestyle },
        { 'preferences.studyHabits': preferences?.studyHabits },
      ],
    })
      .populate('userId', 'name email profileImage')
      .select('studentId department year preferences userId')
      .limit(10)
      .lean();

    const scoredMatches = matches.map(match => {
      let score = 0;
      if (match.preferences?.sleepTime === preferences?.sleepTime) score += 35;
      if (match.preferences?.lifestyle === preferences?.lifestyle) score += 25;
      if (match.preferences?.studyHabits === preferences?.studyHabits) score += 25;
      if (match.department === currentStudent.department) score += 15;
      return { ...match, compatibilityScore: score };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({ success: true, data: scoredMatches });
  } catch (error) {
    logger.error('Find roommate matches error:', error);
    res.status(500).json({ success: false, message: 'Failed to find matches' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { preferences } = req.body;
    const student = await Student.findOneAndUpdate(
      { userId: req.user?.id },
      { preferences },
      { new: true }
    );

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.status(200).json({ success: true, data: student.preferences, message: 'Preferences updated' });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};
