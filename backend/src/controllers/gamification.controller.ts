import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Student } from '../models/Student.model';
import { logger } from '../utils/logger';

const BADGES = {
  fast_payer: { name: 'Fast Payer ⚡', description: 'Paid fees on time for 3+ months', points: 50 },
  room_keeper: { name: 'Best Room Keeper 🏆', description: 'Maintained excellent room cleanliness', points: 100 },
  eco_warrior: { name: 'Eco Warrior 🌿', description: 'Reduced energy/water usage by 20%', points: 150 },
  community_star: { name: 'Community Star ⭐', description: 'Active community contributor', points: 75 },
  scholarship_student: { name: 'Scholar 📚', description: 'Top academic performer in hostel', points: 200 },
  newbie: { name: 'Welcome Newbie 👋', description: 'Joined the hostel', points: 10 },
};

export const getLeaderboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaderboard = await Student.find({ status: 'active' })
      .populate('userId', 'name profileImage')
      .select('studentId points badges userId')
      .sort({ points: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: leaderboard.map((s, index) => ({
        rank: index + 1,
        studentId: s.studentId,
        name: (s.userId as unknown as { name: string })?.name,
        profileImage: (s.userId as unknown as { profileImage: string })?.profileImage,
        points: s.points,
        badges: s.badges,
      })),
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

export const getMyAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id }).lean();
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const earnedBadges = student.badges.map(badge => ({
      id: badge,
      ...(BADGES[badge as keyof typeof BADGES] || { name: badge, description: '', points: 0 }),
      earned: true,
    }));

    const unearnedBadges = Object.entries(BADGES)
      .filter(([key]) => !student.badges.includes(key))
      .map(([id, badge]) => ({ id, ...badge, earned: false }));

    res.status(200).json({
      success: true,
      data: {
        totalPoints: student.points,
        earnedBadges,
        unearnedBadges,
        rank: await Student.countDocuments({ points: { $gt: student.points } }) + 1,
      },
    });
  } catch (error) {
    logger.error('Get achievements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
  }
};

export const awardBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, badge, points = 0 } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    if (!student.badges.includes(badge)) {
      student.badges.push(badge);
    }
    student.points += Number(points);
    await student.save();

    res.status(200).json({ success: true, message: 'Badge awarded successfully' });
  } catch (error) {
    logger.error('Award badge error:', error);
    res.status(500).json({ success: false, message: 'Failed to award badge' });
  }
};
