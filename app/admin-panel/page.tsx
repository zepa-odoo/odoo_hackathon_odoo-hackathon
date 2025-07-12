'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaQuestion, FaComment, FaFlag, FaBan, FaTrash, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  reputation: number;
  isBanned: boolean;
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
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'answers'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.role || session.user.role !== 'admin') {
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.role || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.user.username}</span>
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaQuestion className="inline mr-2" />
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'answers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaComment className="inline mr-2" />
              Answers ({answers.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reputation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.reputation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.isBanned ? (
                          <button
                            onClick={() => unbanUser(user._id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <FaCheck className="inline" />
                          </button>
                        ) : (
                          <button
                            onClick={() => banUser(user._id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            <FaBan className="inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question._id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{question.title}</div>
                          <div className="text-sm text-gray-500">{question.content.substring(0, 100)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {question.author.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.views} views, {question.answers} answers
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/questions/${question._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye className="inline" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(question._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {answers.map((answer) => (
                    <tr key={answer._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{answer.content.substring(0, 100)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {answer.author.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {answer.question.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteAnswer(answer._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 