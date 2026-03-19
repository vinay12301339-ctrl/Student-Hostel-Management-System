import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { Student } from '../models/Student.model';
import { logger } from '../utils/logger';

const generateTokens = (
  userId: string,
  role: string,
  email: string
): { accessToken: string; refreshToken: string } => {
  const secret = process.env.JWT_SECRET || 'hostel_secret_key_2024';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'hostel_refresh_secret_2024';

  const accessToken = jwt.sign({ id: userId, role, email }, secret, {
    expiresIn: '24h',
  });
  const refreshToken = jwt.sign({ id: userId, role, email }, refreshSecret, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role = 'student', rollNumber, department, year, course } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password, phone, role });

    if (role === 'student') {
      const studentId = `STU${Date.now()}`;
      await Student.create({
        userId: user._id,
        studentId,
        rollNumber: rollNumber || studentId,
        department: department || 'General',
        year: year || 1,
        course: course || 'B.Tech',
      });
    }

    const { accessToken, refreshToken } = generateTokens(
      String(user._id),
      user.role,
      user.email
    );
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(
      String(user._id),
      user.role,
      user.email
    );
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id })
        .populate('roomId')
        .lean();
    }

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
        student: studentProfile,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'hostel_refresh_secret_2024';
    const decoded = jwt.verify(token, refreshSecret) as {
      id: string;
      role: string;
      email: string;
    };

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const tokens = generateTokens(String(user._id), user.role, user.email);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: undefined });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};
