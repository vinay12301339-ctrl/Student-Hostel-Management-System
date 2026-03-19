import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
  phone?: string;
  profileImage?: string;
}

interface Student {
  _id: string;
  studentId: string;
  rollNumber: string;
  department: string;
  year: number;
  course: string;
  status: string;
  points: number;
  badges: string[];
  roomId?: { roomNumber: string; block: string; floor: number };
}

interface AuthState {
  user: User | null;
  student: Student | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, student: Student | null, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateStudent: (student: Partial<Student>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      student: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, student, accessToken, refreshToken) =>
        set({ user, student, accessToken, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, student: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({ user: state.user ? { ...state.user, ...userData } : null })),
      updateStudent: (studentData) =>
        set((state) => ({ student: state.student ? { ...state.student, ...studentData } : null })),
    }),
    {
      name: 'hostel-auth',
      partialize: (state) => ({
        user: state.user,
        student: state.student,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
