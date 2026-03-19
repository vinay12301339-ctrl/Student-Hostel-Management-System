import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  studentId: {
    studentId: string;
    rollNumber: string;
  };
  roomId: {
    roomNumber: string;
    block: string;
    floor: number;
    type: string;
    monthlyRent: number;
  };
  type: string;
  status: string;
  checkInDate: string;
  notes: string;
  createdAt: string;
}

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: async () => {
      const response = await api.get(`/bookings?status=${statusFilter}&limit=50`);
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/bookings/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Booking approved! 🎉');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: () => toast.error('Failed to approve booking'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.patch(`/bookings/${id}/reject`, { rejectionReason: reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Booking rejected');
      setRejectingId(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: () => toast.error('Failed to reject booking'),
  });

  const bookings: Booking[] = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Manage room booking requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No {statusFilter} bookings</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700 capitalize">{booking.type}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Student</p>
                      <p className="font-medium">{booking.studentId?.studentId}</p>
                      <p className="text-xs text-gray-500">{booking.studentId?.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Room Requested</p>
                      <p className="font-medium">Room {booking.roomId?.roomNumber}</p>
                      <p className="text-xs text-gray-500">
                        Block {booking.roomId?.block} • {booking.roomId?.type} •
                        ₹{booking.roomId?.monthlyRent?.toLocaleString()}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Check-in Date</p>
                      <p className="font-medium">
                        {new Date(booking.checkInDate).toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">Note: {booking.notes}</p>
                  )}
                </div>

                {booking.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => approveMutation.mutate(booking._id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(booking._id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Booking</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectingId, reason: rejectionReason })}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? <div className="spinner w-4 h-4" /> : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
