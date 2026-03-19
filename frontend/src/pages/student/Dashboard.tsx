import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  Wrench,
  BedDouble,
  Trophy,
  Bell,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuthStore } from '../../utils/store';

interface DashboardData {
  student: {
    studentId: string;
    rollNumber: string;
    department: string;
    year: number;
    course: string;
    status: string;
    points: number;
    badges: string[];
    checkInDate: string;
    roomId: {
      roomNumber: string;
      block: string;
      floor: number;
      type: string;
    };
  };
  stats: {
    pendingFeesCount: number;
    pendingFeesAmount: number;
    openTickets: number;
    unreadNotifications: number;
    points: number;
    badges: string[];
  };
  currentMonthFee: {
    totalAmount: number;
    paidAmount: number;
    status: string;
    dueDate: string;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) => (
  <div className="card flex items-start gap-4">
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await api.get('/students/dashboard');
      return response.data.data as DashboardData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  const { student, stats, currentMonthFee } = data || {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-sm">{getGreeting()},</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name} 👋</h1>
            <p className="text-primary-200 text-sm mt-1">
              {student?.department} | Year {student?.year} | {student?.course}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold">{stats?.points || 0} pts</span>
            </div>
            <p className="text-xs text-primary-200 mt-1">{stats?.badges?.length || 0} badges earned</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Room"
          value={student?.roomId?.roomNumber || 'Not Assigned'}
          subtitle={student?.roomId ? `Block ${student.roomId.block}, Floor ${student.roomId.floor}` : undefined}
          icon={BedDouble}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          title="Pending Fees"
          value={stats?.pendingFeesAmount ? `₹${stats.pendingFeesAmount.toLocaleString()}` : '₹0'}
          subtitle={`${stats?.pendingFeesCount || 0} pending invoices`}
          icon={CreditCard}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets || 0}
          subtitle="Maintenance requests"
          icon={Wrench}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          title="Notifications"
          value={stats?.unreadNotifications || 0}
          subtitle="Unread messages"
          icon={Bell}
          color="text-green-600"
          bg="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current fee status */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">This Month's Fee Status</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          {currentMonthFee ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{currentMonthFee.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Paid: ₹{currentMonthFee.paidAmount.toLocaleString()}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl ${
                  currentMonthFee.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : currentMonthFee.status === 'overdue'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {currentMonthFee.status === 'paid' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : currentMonthFee.status === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold capitalize">{currentMonthFee.status}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Payment Progress</span>
                  <span>{Math.round((currentMonthFee.paidAmount / currentMonthFee.totalAmount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentMonthFee.paidAmount / currentMonthFee.totalAmount) * 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Due date: {new Date(currentMonthFee.dueDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No fee record for this month</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Badges</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>

          {stats?.badges && stats.badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {stats.badges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100"
                >
                  <span className="text-lg">🏆</span>
                  <span className="text-xs font-medium text-gray-700 capitalize">
                    {badge.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No badges yet</p>
              <p className="text-xs text-gray-400 mt-1">Pay fees on time to earn your first badge!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '💳', label: 'Pay Fees', path: '/student/fees', color: 'bg-blue-50 hover:bg-blue-100' },
            { icon: '🔧', label: 'Report Issue', path: '/student/maintenance', color: 'bg-orange-50 hover:bg-orange-100' },
            { icon: '🏠', label: 'Browse Rooms', path: '/student/rooms', color: 'bg-green-50 hover:bg-green-100' },
            { icon: '🏆', label: 'View Ranking', path: '/student/gamification', color: 'bg-purple-50 hover:bg-purple-100' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.path}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-colors cursor-pointer`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
