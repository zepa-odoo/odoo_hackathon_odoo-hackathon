'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FaUsers, 
  FaQuestion, 
  FaComment, 
  FaFlag, 
  FaBan, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaCog,
  FaUserPlus,
  FaUserMinus,
  FaClock,
  FaExclamationTriangle,
  FaShieldAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  reputation: number;
  isBanned: boolean;
  suspendedUntil?: string;
  suspensionReason?: string;
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  tags: string[];
  views: number;
  answers: number;
  createdAt: string;
  isFlagged?: boolean;
}

interface Answer {
  _id: string;
  content: string;
  author: {
    username: string;
  };
  question: {
    title: string;
  };
  createdAt: string;
  isFlagged?: boolean;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'answers' | 'admins'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspensionDays, setSuspensionDays] = useState(1);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'master')) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }
      fetchData();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin-panel');
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [usersRes, questionsRes, answersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/questions'),
        fetch('/api/admin/answers')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }

      if (answersRes.ok) {
        const answersData = await answersRes.json();
        setAnswers(answersData.answers || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT'
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isBanned: true } : user
        ));
        toast.success('User banned successfully');
      } else {
        toast.error('Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'PUT'
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isBanned: false } : user
        ));
        toast.success('User unbanned successfully');
      } else {
        toast.error('Failed to unban user');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    }
  };

  const suspendUser = async (userId: string) => {
    if (suspensionDays < 1) {
      toast.error('Suspension period must be at least 1 day');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: suspensionDays,
          reason: suspensionReason || 'Violation of community guidelines'
        })
      });

      if (response.ok) {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + suspensionDays);
        
        setUsers(prev => prev.map(user => 
          user._id === userId ? { 
            ...user, 
            suspendedUntil: suspendedUntil.toISOString(),
            suspensionReason: suspensionReason || 'Violation of community guidelines'
          } : user
        ));
        setShowSuspensionModal(false);
        setSelectedUser(null);
        setSuspensionDays(1);
        setSuspensionReason('');
        toast.success(`User suspended for ${suspensionDays} day(s)`);
      } else {
        toast.error('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const unsuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'PUT'
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { 
            ...user, 
            suspendedUntil: undefined,
            suspensionReason: undefined
          } : user
        ));
        toast.success('User suspension removed');
      } else {
        toast.error('Failed to remove suspension');
      }
    } catch (error) {
      console.error('Error removing suspension:', error);
      toast.error('Failed to remove suspension');
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
        toast.success('Question deleted successfully');
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const deleteAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/admin/answers/${answerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAnswers(prev => prev.filter(a => a._id !== answerId));
        toast.success('Answer deleted successfully');
      } else {
        toast.error('Failed to delete answer');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer');
    }
  };

  const isMasterAdmin = session?.user?.role === 'master';
  const isSuspended = (user: User) => user.suspendedUntil && new Date(user.suspendedUntil) > new Date();

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#238636] mx-auto"></div>
          <p className="mt-4 text-[#7d8590]">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'master')) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-4">Access Denied</h1>
          <p className="text-[#7d8590] mb-4">You need admin privileges to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="bg-[#161b22] shadow-github border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="w-8 h-8 text-[#238636]" />
              <div>
                <h1 className="text-2xl font-bold text-[#f0f6fc]">Admin Panel</h1>
                <p className="text-sm text-[#7d8590]">
                  {isMasterAdmin ? 'Master Administrator' : 'Administrator'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#7d8590]">Welcome, {session.user.username}</span>
              <button 
                onClick={() => router.push('/')}
                className="btn-secondary"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-[#30363d] mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-github ${
                activeTab === 'users'
                  ? 'border-[#238636] text-[#238636]'
                  : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#30363d]'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-github ${
                activeTab === 'questions'
                  ? 'border-[#238636] text-[#238636]'
                  : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#30363d]'
              }`}
            >
              <FaQuestion className="inline mr-2" />
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-github ${
                activeTab === 'answers'
                  ? 'border-[#238636] text-[#238636]'
                  : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#30363d]'
              }`}
            >
              <FaComment className="inline mr-2" />
              Answers ({answers.length})
            </button>
            {isMasterAdmin && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-github ${
                  activeTab === 'admins'
                    ? 'border-[#238636] text-[#238636]'
                    : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#30363d]'
                }`}
              >
                <FaCog className="inline mr-2" />
                Admin Management
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#30363d]">
                <thead className="bg-[#21262d]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#161b22] divide-y divide-[#30363d]">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-[#f0f6fc]">{user.username}</div>
                          <div className="text-sm text-[#7d8590]">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'master' ? 'bg-[#d29922] text-white' :
                          user.role === 'admin' ? 'bg-[#1f6feb] text-white' : 
                          'bg-[#21262d] text-[#c9d1d9]'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c9d1d9]">
                        <div>Rep: {user.reputation}</div>
                        <div>Q: {user.questionsAsked} | A: {user.answersGiven}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSuspended(user) ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#d29922] text-white">
                            Suspended
                          </span>
                        ) : user.isBanned ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#da3633] text-white">
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#238636] text-white">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {isSuspended(user) ? (
                            <button
                              onClick={() => unsuspendUser(user._id)}
                              className="text-[#238636] hover:text-[#2ea043] transition-github"
                              title="Remove suspension"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          ) : user.isBanned ? (
                            <button
                              onClick={() => unbanUser(user._id)}
                              className="text-[#238636] hover:text-[#2ea043] transition-github"
                              title="Unban user"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowSuspensionModal(true);
                                }}
                                className="text-[#d29922] hover:text-[#e3b341] transition-github"
                                title="Suspend user"
                              >
                                <FaClock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => banUser(user._id)}
                                className="text-[#da3633] hover:text-[#f85149] transition-github"
                                title="Ban user"
                              >
                                <FaBan className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#30363d]">
                <thead className="bg-[#21262d]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#161b22] divide-y divide-[#30363d]">
                  {questions.map((question) => (
                    <tr key={question._id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[#f0f6fc]">{question.title}</div>
                          <div className="text-sm text-[#7d8590]">{question.content.substring(0, 100)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c9d1d9]">
                        {question.author.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7d8590]">
                        {question.views} views, {question.answers} answers
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/questions/${question._id}`)}
                            className="text-[#1f6feb] hover:text-[#388bfd] transition-github"
                            title="View question"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteQuestion(question._id)}
                            className="text-[#da3633] hover:text-[#f85149] transition-github"
                            title="Delete question"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#30363d]">
                <thead className="bg-[#21262d]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#161b22] divide-y divide-[#30363d]">
                  {answers.map((answer) => (
                    <tr key={answer._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#c9d1d9]">{answer.content.substring(0, 100)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c9d1d9]">
                        {answer.author.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7d8590]">
                        {answer.question.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteAnswer(answer._id)}
                          className="text-[#da3633] hover:text-[#f85149] transition-github"
                          title="Delete answer"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'admins' && isMasterAdmin && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Admin Management</h3>
                <p className="text-[#7d8590] mb-4">
                  As a master administrator, you can manage other admin accounts.
                </p>
                <div className="flex space-x-4">
                  <button className="btn-primary">
                    <FaUserPlus className="mr-2" />
                    Add Admin
                  </button>
                  <button className="btn-secondary">
                    <FaUserMinus className="mr-2" />
                    Remove Admin
                  </button>
                </div>
              </div>
              
              <div className="bg-[#21262d] rounded-lg p-4">
                <h4 className="text-md font-medium text-[#f0f6fc] mb-3">Current Admins</h4>
                <div className="space-y-2">
                  {users.filter(user => user.role === 'admin' || user.role === 'master').map(user => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-[#161b22] rounded">
                      <div>
                        <div className="font-medium text-[#f0f6fc]">{user.username}</div>
                        <div className="text-sm text-[#7d8590]">{user.email}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'master' ? 'bg-[#d29922] text-white' : 'bg-[#1f6feb] text-white'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suspension Modal */}
      {showSuspensionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] rounded-lg p-6 w-96 border border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Suspend User</h3>
            <p className="text-[#7d8590] mb-4">
              Suspend {selectedUser.username} for a specified number of days.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Suspension Period (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={suspensionDays}
                  onChange={(e) => setSuspensionDays(parseInt(e.target.value) || 1)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="textarea"
                  placeholder="Reason for suspension..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowSuspensionModal(false);
                  setSelectedUser(null);
                  setSuspensionDays(1);
                  setSuspensionReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => suspendUser(selectedUser._id)}
                className="btn-danger"
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 