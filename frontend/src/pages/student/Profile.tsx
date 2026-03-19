import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, BookOpen, Building2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuthStore } from '../../utils/store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const response = await api.get('/students/profile');
      return response.data.data;
    },
  });

  const { data: idCard } = useQuery({
    queryKey: ['student-id'],
    queryFn: async () => {
      const response = await api.get('/students/id-card');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-3xl mx-auto mb-4">
            {user?.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{profile?.studentId}</p>
          <div className="mt-3">
            <span className={`badge ${
              profile?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {profile?.status}
            </span>
          </div>

          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>{profile?.department} - Year {profile?.year}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>
                {profile?.roomId
                  ? `Room ${profile.roomId.roomNumber}, Block ${profile.roomId.block}`
                  : 'No room assigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Digital ID Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Digital ID Card
            </h3>

            {idCard ? (
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-primary-200 text-xs uppercase tracking-wider mb-1">HostelHub</p>
                    <p className="text-xs text-primary-200">Student Identity Card</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{idCard.name}</p>
                    <p className="text-primary-200 text-sm mt-1">{idCard.rollNumber}</p>
                    <p className="text-primary-200 text-sm">{idCard.department}</p>
                    <p className="text-primary-200 text-sm">Year {idCard.year} | {idCard.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary-200">Room</p>
                    <p className="text-xl font-bold">
                      {idCard.room ? `${idCard.room.roomNumber}` : 'N/A'}
                    </p>
                    {idCard.room && (
                      <p className="text-xs text-primary-200">
                        Block {idCard.room.block}, Floor {idCard.room.floor}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary-500 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-primary-200">Student ID</p>
                    <p className="text-sm font-mono font-bold">{idCard.studentId}</p>
                  </div>
                  {idCard.checkInDate && (
                    <div className="text-right">
                      <p className="text-xs text-primary-200">Check-in</p>
                      <p className="text-sm font-medium">
                        {new Date(idCard.checkInDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>ID card not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      {profile?.preferences && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Living Preferences</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Sleep Schedule', value: profile.preferences.sleepTime, icon: '🌙' },
              { label: 'Study Habits', value: profile.preferences.studyHabits, icon: '📚' },
              { label: 'Lifestyle', value: profile.preferences.lifestyle, icon: '🏃' },
              { label: 'Diet', value: profile.preferences.dietaryPreferences, icon: '🥗' },
            ].map((pref) => (
              <div key={pref.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{pref.icon}</div>
                <p className="text-xs text-gray-500">{pref.label}</p>
                <p className="text-sm font-semibold text-gray-700 capitalize mt-1">
                  {pref.value?.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
