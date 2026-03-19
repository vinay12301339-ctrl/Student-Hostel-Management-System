import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  block: string;
  type: string;
  capacity: number;
  occupiedCount: number;
  status: string;
  monthlyRent: number;
  features: {
    hasAC: boolean;
    hasWifi: boolean;
    hasAttachedBathroom: boolean;
    hasBalcony: boolean;
    hasStudyTable: boolean;
    hasWardrobe: boolean;
  };
}

interface RoomFormData {
  roomNumber: string;
  floor: number;
  block: string;
  type: string;
  capacity: number;
  monthlyRent: number;
  description: string;
}

export default function AdminRooms() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms?limit=100');
      return response.data;
    },
  });

  const { register, handleSubmit, reset } = useForm<RoomFormData>();

  const createMutation = useMutation({
    mutationFn: async (data: RoomFormData) => {
      const response = editRoom
        ? await api.put(`/rooms/${editRoom._id}`, data)
        : await api.post('/rooms', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(editRoom ? 'Room updated!' : 'Room created!');
      setShowForm(false);
      setEditRoom(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/rooms/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Room deleted!');
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Delete failed');
    },
  });

  const rooms: Room[] = data?.data || [];

  const handleEdit = (room: Room) => {
    setEditRoom(room);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-500 text-sm mt-1">{rooms.length} rooms total</p>
        </div>
        <button
          onClick={() => { setEditRoom(null); reset(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Room stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { status: 'available', label: 'Available', color: 'bg-green-50 text-green-700' },
          { status: 'occupied', label: 'Occupied', color: 'bg-red-50 text-red-700' },
          { status: 'maintenance', label: 'Maintenance', color: 'bg-yellow-50 text-yellow-700' },
          { status: 'blocked', label: 'Blocked', color: 'bg-gray-50 text-gray-700' },
        ].map(({ status, label, color }) => (
          <div key={status} className={`p-4 rounded-xl ${color}`}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1">
              {rooms.filter((r) => r.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                  <th className="pb-3 pr-4">Room</th>
                  <th className="pb-3 pr-4">Block/Floor</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Capacity</th>
                  <th className="pb-3 pr-4">Rent</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map((room) => (
                  <tr key={room._id} className="text-sm hover:bg-gray-50">
                    <td className="py-3 pr-4 font-semibold">{room.roomNumber}</td>
                    <td className="py-3 pr-4 text-gray-600">Block {room.block}, F{room.floor}</td>
                    <td className="py-3 pr-4 capitalize">{room.type}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span>{room.occupiedCount}/{room.capacity}</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full"
                            style={{ width: `${(room.occupiedCount / room.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-medium">₹{room.monthlyRent.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        room.status === 'available' ? 'bg-green-100 text-green-700' :
                        room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this room?')) {
                              deleteMutation.mutate(room._id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editRoom ? 'Edit Room' : 'Add New Room'}
            </h3>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    {...register('roomNumber', { required: true })}
                    defaultValue={editRoom?.roomNumber}
                    placeholder="101"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                  <input
                    {...register('block', { required: true })}
                    defaultValue={editRoom?.block}
                    placeholder="A"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    {...register('floor', { required: true, valueAsNumber: true })}
                    defaultValue={editRoom?.floor}
                    type="number"
                    min="1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select {...register('type', { required: true })} className="input-field" defaultValue={editRoom?.type}>
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="dormitory">Dormitory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    {...register('capacity', { required: true, valueAsNumber: true })}
                    defaultValue={editRoom?.capacity}
                    type="number"
                    min="1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    {...register('monthlyRent', { required: true, valueAsNumber: true })}
                    defaultValue={editRoom?.monthlyRent}
                    type="number"
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={2} className="input-field resize-none" />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditRoom(null); reset(); }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <div className="spinner w-4 h-4" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editRoom ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
