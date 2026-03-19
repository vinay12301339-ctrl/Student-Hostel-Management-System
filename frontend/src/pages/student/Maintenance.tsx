import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
  aiCategory: string;
  aiSuggestion: string;
  assignedTo?: { name: string; email: string };
  resolvedAt?: string;
  studentRating?: number;
}

interface TicketFormData {
  title: string;
  description: string;
  priority: string;
}

const priorityColors: Record<string, string> = {
  emergency: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const statusIcons: Record<string, { icon: React.ElementType; color: string }> = {
  open: { icon: Clock, color: 'text-blue-500' },
  in_progress: { icon: Wrench, color: 'text-orange-500' },
  resolved: { icon: CheckCircle, color: 'text-green-500' },
  rejected: { icon: XCircle, color: 'text-red-500' },
  closed: { icon: CheckCircle, color: 'text-gray-500' },
};

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketFormData>();

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/maintenance/my${params}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: TicketFormData) => {
      const response = await api.post('/maintenance', formData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Ticket #${data.data.ticketNumber} created! 🔧`);
      toast(`💡 AI Suggestion: ${data.data.aiSuggestion}`, { duration: 6000, icon: '🤖' });
      reset();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to create ticket');
    },
  });

  const tickets: Ticket[] = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance & Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">Report issues and track their resolution</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status ? status.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-16">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No maintenance requests</h3>
          <p className="text-gray-500 mt-2">Report an issue to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const StatusIcon = statusIcons[ticket.status]?.icon || Clock;
            const statusColor = statusIcons[ticket.status]?.color || 'text-gray-500';
            return (
              <div
                key={ticket._id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                      <span className="font-mono text-xs text-gray-500">{ticket.ticketNumber}</span>
                      <span className={`badge ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {ticket.priority}
                      </span>
                      {ticket.isSlaBreach && (
                        <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          SLA Breach
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                    {ticket.aiSuggestion && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-lg">
                        <span className="text-sm">🤖</span>
                        <p className="text-xs text-blue-700">{ticket.aiSuggestion}</p>
                      </div>
                    )}
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
            );
          })}
        </div>
      )}

      {/* Create ticket modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Report an Issue</h3>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">🤖 AI-powered categorization</span>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., Water leaking from ceiling"
                  className="input-field"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  className="input-field resize-none"
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  {...register('priority')}
                  className="input-field"
                >
                  <option value="low">Low - Can wait</option>
                  <option value="medium">Medium - Needs attention</option>
                  <option value="high">High - Urgent</option>
                  <option value="emergency">Emergency - Immediate action needed</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); reset(); }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <div className="spinner w-4 h-4" /> : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket detail modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h3>
                <p className="text-sm text-gray-500 font-mono">{selectedTicket.ticketNumber}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <span className={`badge ${priorityColors[selectedTicket.priority]}`}>
                  {selectedTicket.priority}
                </span>
                <span className="badge bg-gray-100 text-gray-700">
                  {selectedTicket.category}
                </span>
              </div>

              <p className="text-gray-700">{selectedTicket.description}</p>

              {selectedTicket.aiSuggestion && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-1">🤖 AI Suggestion</p>
                  <p className="text-sm text-blue-700">{selectedTicket.aiSuggestion}</p>
                </div>
              )}

              {selectedTicket.assignedTo && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Assigned to</p>
                  <p className="text-sm font-medium">{selectedTicket.assignedTo.name}</p>
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-500">
                <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                <span>SLA: {new Date(selectedTicket.slaDeadline).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full btn-secondary mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
