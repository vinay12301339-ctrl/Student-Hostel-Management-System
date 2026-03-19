import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  slaDeadline: string;
  isSlaBreach: boolean;
  aiSuggestion: string;
  studentId?: { studentId: string; rollNumber: string };
  roomId?: { roomNumber: string; block: string; floor: number };
  assignedTo?: { name: string; email: string };
  resolvedAt?: string;
}

const priorityColors: Record<string, string> = {
  emergency: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export default function AdminMaintenance() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}&limit=50` : '?limit=50';
      const response = await api.get(`/maintenance${params}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const response = await api.patch(`/maintenance/${id}/status`, { status, resolutionNotes: notes });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ticket updated!');
      setSelectedTicket(null);
      setNewStatus('');
      setResolutionNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
    onError: () => toast.error('Update failed'),
  });

  const tickets: Ticket[] = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Operations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and resolve maintenance tickets</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['open', 'in_progress', 'resolved', 'closed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-16">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No {statusFilter.replace('_', ' ')} tickets</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">{ticket.ticketNumber}</span>
                    <span className={`badge ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                    <span className="badge bg-gray-100 text-gray-700 capitalize">{ticket.category}</span>
                    {ticket.isSlaBreach && (
                      <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        SLA Breach
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Room {ticket.roomId?.roomNumber}, Block {ticket.roomId?.block}</span>
                    <span>Student: {ticket.studentId?.rollNumber}</span>
                    <span>SLA: {new Date(ticket.slaDeadline).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className={`badge ${
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.title}</h3>
            <p className="text-sm text-gray-500 font-mono mb-4">{selectedTicket.ticketNumber}</p>

            <p className="text-gray-700 mb-4">{selectedTicket.description}</p>

            {selectedTicket.aiSuggestion && (
              <div className="p-3 bg-blue-50 rounded-xl mb-4">
                <p className="text-xs font-semibold text-blue-800 mb-1">🤖 AI Suggestion</p>
                <p className="text-sm text-blue-700">{selectedTicket.aiSuggestion}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select
                  value={newStatus || selectedTicket.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                  placeholder="Add notes about resolution..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setSelectedTicket(null); setNewStatus(''); setResolutionNotes(''); }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate({
                  id: selectedTicket._id,
                  status: newStatus || selectedTicket.status,
                  notes: resolutionNotes,
                })}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <div className="spinner w-4 h-4" /> : 'Update Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
