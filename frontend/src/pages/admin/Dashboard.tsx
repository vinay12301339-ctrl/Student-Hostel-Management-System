import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BedDouble,
  CreditCard,
  Wrench,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface DashboardData {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    pendingBookings: number;
    openTickets: number;
    overdueFeesCount: number;
    occupancyRate: number;
    monthlyRevenue: number;
  };
  charts: {
    revenueByMonth: Array<{ _id: { year: number; month: number }; total: number; count: number }>;
    ticketsByCategory: Array<{ _id: string; count: number }>;
  };
}

const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
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

  const { overview, charts } = data || {};
  const revenueData = (charts?.revenueByMonth || []).slice().reverse().map((r) => ({
    name: `${months[r._id.month]} ${r._id.year}`,
    revenue: r.total,
    payments: r.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Complete overview of hostel operations</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Students',
            value: overview?.totalStudents || 0,
            sub: `${overview?.activeStudents || 0} active`,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            title: 'Occupancy Rate',
            value: `${overview?.occupancyRate || 0}%`,
            sub: `${overview?.occupiedRooms || 0} / ${overview?.totalRooms || 0} rooms`,
            icon: BedDouble,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            title: 'Monthly Revenue',
            value: `₹${((overview?.monthlyRevenue || 0) / 1000).toFixed(0)}K`,
            sub: 'This month',
            icon: CreditCard,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            title: 'Open Tickets',
            value: overview?.openTickets || 0,
            sub: `${overview?.pendingBookings || 0} pending bookings`,
            icon: Wrench,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Overdue Fees</p>
            <p className="text-xl font-bold text-yellow-900">{overview?.overdueFeesCount || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Pending Bookings</p>
            <p className="text-xl font-bold text-blue-900">{overview?.pendingBookings || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
          <Wrench className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-orange-800">Maintenance Rooms</p>
            <p className="text-xl font-bold text-orange-900">{overview?.maintenanceRooms || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue Trend</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No revenue data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Tickets by category */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Tickets by Category</h3>
          {charts?.ticketsByCategory && charts.ticketsByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts.ticketsByCategory}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {charts.ticketsByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-2">
                {charts.ticketsByCategory.map((cat, index) => (
                  <div key={cat._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="capitalize">{cat._id}</span>
                    </div>
                    <span className="font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>No ticket data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
