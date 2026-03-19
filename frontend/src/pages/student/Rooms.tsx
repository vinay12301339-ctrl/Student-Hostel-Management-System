import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, Wifi, Wind, Bath, Search, Filter, Star } from 'lucide-react';
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
  amenities: string[];
  features: {
    hasAC: boolean;
    hasWifi: boolean;
    hasAttachedBathroom: boolean;
    hasBalcony: boolean;
    hasStudyTable: boolean;
    hasWardrobe: boolean;
  };
  rating: number;
  description: string;
}

export default function RoomsPage() {
  const [filter, setFilter] = useState({ type: '', status: 'available', search: '' });
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rooms', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      const response = await api.get(`/rooms?${params.toString()}`);
      return response.data;
    },
  });

  const handleBookRoom = async (room: Room) => {
    setIsBooking(true);
    try {
      await api.post('/bookings', {
        roomId: room._id,
        checkInDate: new Date().toISOString(),
        notes: 'Room booking request',
      });
      toast.success('Booking request submitted successfully! 🎉');
      setBookingRoom(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  const rooms: Room[] = data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and book your perfect room</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={filter.search}
              onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filter.type}
            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="dormitory">Dormitory</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Room grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="card text-center py-16">
          <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No rooms found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="card hover:shadow-md transition-shadow">
              {/* Room header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">Room {room.roomNumber}</h3>
                    <span className={`badge text-xs ${
                      room.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : room.status === 'occupied'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Block {room.block} • Floor {room.floor} • {room.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">
                    ₹{room.monthlyRent.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">/month</p>
                </div>
              </div>

              {/* Occupancy */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Occupancy</span>
                  <span>{room.occupiedCount}/{room.capacity}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full"
                    style={{ width: `${(room.occupiedCount / room.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {room.features.hasAC && (
                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                    <Wind className="w-3 h-3" /> AC
                  </span>
                )}
                {room.features.hasWifi && (
                  <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
                    <Wifi className="w-3 h-3" /> WiFi
                  </span>
                )}
                {room.features.hasAttachedBathroom && (
                  <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                    <Bath className="w-3 h-3" /> Bath
                  </span>
                )}
              </div>

              {/* Rating */}
              {room.rating > 0 && (
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{room.rating.toFixed(1)}</span>
                </div>
              )}

              {/* Action */}
              {room.status === 'available' && (
                <button
                  onClick={() => setBookingRoom(room)}
                  className="w-full btn-primary py-2 text-sm"
                >
                  Book This Room
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking modal */}
      {bookingRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Booking</h3>
            <p className="text-gray-600 mb-4">
              You're about to request Room {bookingRoom.roomNumber} in Block {bookingRoom.block}.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Room Number</span>
                <span className="font-medium">{bookingRoom.roomNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium capitalize">{bookingRoom.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly Rent</span>
                <span className="font-medium text-primary-600">₹{bookingRoom.monthlyRent.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBookingRoom(null)}
                className="flex-1 btn-secondary"
                disabled={isBooking}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBookRoom(bookingRoom)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={isBooking}
              >
                {isBooking ? <div className="spinner w-4 h-4" /> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
