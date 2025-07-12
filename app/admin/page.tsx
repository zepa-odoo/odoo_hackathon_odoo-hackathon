'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiMessageSquare, FiFlag, FiShield, FiBarChart } from 'react-icons/fi';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  bannedUsers: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchStats();
    }
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage your community and monitor platform activity.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiMessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiMessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Answers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAnswers}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiShield className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bannedUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full btn btn-secondary text-left"
              >
                <FiUsers className="inline mr-2" />
                View All Users
              </button>
              <button
                onClick={() => router.push('/admin/users/banned')}
                className="w-full btn btn-secondary text-left"
              >
                <FiShield className="inline mr-2" />
                Manage Banned Users
              </button>
            </div>
          </div>

          {/* Content Moderation */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Moderation</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/reports')}
                className="w-full btn btn-secondary text-left"
              >
                <FiFlag className="inline mr-2" />
                Review Reported Content
              </button>
              <button
                onClick={() => router.push('/admin/questions')}
                className="w-full btn btn-secondary text-left"
              >
                <FiMessageSquare className="inline mr-2" />
                Moderate Questions
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/analytics')}
                className="w-full btn btn-secondary text-left"
              >
                <FiBarChart className="inline mr-2" />
                View Analytics
              </button>
              <button
                onClick={() => router.push('/admin/reports/export')}
                className="w-full btn btn-secondary text-left"
              >
                <FiBarChart className="inline mr-2" />
                Export Reports
              </button>
            </div>
          </div>

          {/* Platform Management */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Management</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/announcements')}
                className="w-full btn btn-secondary text-left"
              >
                <FiMessageSquare className="inline mr-2" />
                Send Announcements
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="w-full btn btn-secondary text-left"
              >
                <FiShield className="inline mr-2" />
                Platform Settings
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                // Placeholder for ban user functionality
                toast('Ban user functionality coming soon');
              }}
              className="btn btn-danger"
            >
              Ban User
            </button>
            <button
              onClick={() => {
                // Placeholder for delete content functionality
                toast('Delete content functionality coming soon');
              }}
              className="btn btn-danger"
            >
              Delete Content
            </button>
            <button
              onClick={() => {
                // Placeholder for send announcement functionality
                toast('Send announcement functionality coming soon');
              }}
              className="btn btn-primary"
            >
              Send Announcement
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 