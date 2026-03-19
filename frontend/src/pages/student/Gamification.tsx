import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Award, TrendingUp, Medal } from 'lucide-react';
import api from '../../utils/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  earned: boolean;
}

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  profileImage?: string;
  points: number;
  badges: string[];
}

interface AchievementsData {
  totalPoints: number;
  earnedBadges: Achievement[];
  unearnedBadges: Achievement[];
  rank: number;
}

export default function GamificationPage() {
  const { data: achievements, isLoading: loadingAch } = useQuery({
    queryKey: ['my-achievements'],
    queryFn: async () => {
      const response = await api.get('/gamification/achievements');
      return response.data.data as AchievementsData;
    },
  });

  const { data: leaderboard, isLoading: loadingLead } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get('/gamification/leaderboard');
      return response.data.data as LeaderboardEntry[];
    },
  });

  if (loadingAch || loadingLead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievements & Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">Earn points and badges for being an awesome hostelite!</p>
      </div>

      {/* Points overview */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Your Total Points</p>
            <p className="text-5xl font-bold mt-1">{achievements?.totalPoints || 0}</p>
            <p className="text-yellow-100 text-sm mt-2">Global Rank #{achievements?.rank || '-'}</p>
          </div>
          <div className="text-right">
            <Trophy className="w-20 h-20 text-yellow-200 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned badges */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Medal className="w-5 h-5 text-yellow-500" />
            Earned Badges ({achievements?.earnedBadges.length || 0})
          </h3>

          {achievements?.earnedBadges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No badges earned yet</p>
              <p className="text-xs text-gray-400 mt-1">Pay fees on time to earn your first badge!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements?.earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-yellow-600">+{badge.points}</span>
                    <p className="text-xs text-gray-400">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locked badges */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400" />
            Available Badges ({achievements?.unearnedBadges.length || 0})
          </h3>

          <div className="space-y-3">
            {achievements?.unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  🔒
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">{badge.name}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-400">+{badge.points}</span>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          Hostel Leaderboard
        </h3>

        <div className="space-y-2">
          {leaderboard?.map((entry) => (
            <div
              key={entry.studentId}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                entry.rank <= 3 ? 'bg-yellow-50 border border-yellow-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                entry.rank === 1 ? 'bg-yellow-400 text-white' :
                entry.rank === 2 ? 'bg-gray-300 text-white' :
                entry.rank === 3 ? 'bg-orange-400 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </div>

              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                {entry.name?.charAt(0)}
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{entry.name}</p>
                <div className="flex gap-1 mt-0.5">
                  {entry.badges.slice(0, 3).map((_badge, i) => (
                    <span key={i} className="text-xs">🏅</span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">{entry.points}</p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </div>
          ))}

          {(!leaderboard || leaderboard.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No rankings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
