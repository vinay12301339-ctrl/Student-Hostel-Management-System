import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

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
  checkInDate?: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
  roomId?: {
    roomNumber: string;
    block: string;
    floor: number;
  };
}

export default function AdminStudents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const response = await api.get(`/admin/students?${params.toString()}`);
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/admin/students/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Student status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const students: Student[] = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.pagination?.total || 0} students registered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No students found</h3>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">ID / Roll No</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Room</th>
                  <th className="pb-3 pr-4">Points</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student._id} className="text-sm hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-xs">
                          {student.userId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.userId?.name}</p>
                          <p className="text-xs text-gray-500">{student.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-mono text-xs">{student.studentId}</p>
                      <p className="text-xs text-gray-500">{student.rollNumber}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p>{student.department}</p>
                      <p className="text-xs text-gray-500">Year {student.year}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {student.roomId ? (
                        <div>
                          <p className="font-medium">Room {student.roomId.roomNumber}</p>
                          <p className="text-xs text-gray-500">Block {student.roomId.block}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Not assigned</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-yellow-600">{student.points} pts</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        student.status === 'active' ? 'bg-green-100 text-green-700' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {student.status !== 'active' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: student._id, status: 'active' })}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Activate"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {student.status === 'active' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: student._id, status: 'inactive' })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Deactivate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
