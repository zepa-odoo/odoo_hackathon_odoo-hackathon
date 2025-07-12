'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUser, FaQuestion, FaComment, FaTrophy, FaCalendar, FaEdit } from 'react-icons/fa';

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  views: number;
  answers: number;
  createdAt: string;
}

interface Answer {
  _id: string;
  content: string;
  question: {
    _id: string;
    title: string;
  };
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  isAccepted: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const [questionsRes, answersRes] = await Promise.all([
        fetch(`/api/questions?author=${session?.user?.id}`),
        fetch(`/api/answers?author=${session?.user?.id}`)
      ]);

      const questionsData = await questionsRes.json();
      const answersData = await answersRes.json();

      setQuestions(questionsData.questions || []);
      setAnswers(answersData.answers || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReputation = () => {
    const questionVotes = questions.reduce((total, q) => 
      total + (q.votes.upvotes.length - q.votes.downvotes.length), 0
    );
    const answerVotes = answers.reduce((total, a) => 
      total + (a.votes.upvotes.length - a.votes.downvotes.length), 0
    );
    const acceptedBonus = answers.filter(a => a.isAccepted).length * 15;
    
    return (session?.user?.reputation || 0) + questionVotes + answerVotes + acceptedBonus;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h1>
          <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{session.user.username}</h1>
              <p className="text-gray-600">{session.user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <FaTrophy className="text-yellow-500" />
                  <span className="text-sm text-gray-600">Reputation: {calculateReputation()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCalendar className="text-gray-400" />
                  <span className="text-sm text-gray-600">Member since {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Link 
              href="/profile/edit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaQuestion className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
                <p className="text-gray-600">Questions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaComment className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{answers.length}</p>
                <p className="text-gray-600">Answers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaTrophy className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {answers.filter(a => a.isAccepted).length}
                </p>
                <p className="text-gray-600">Accepted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Questions ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab('answers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'answers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Answers ({answers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'questions' ? (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <FaQuestion className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by asking your first question.</p>
                    <div className="mt-6">
                      <Link
                        href="/questions/ask"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Ask Question
                      </Link>
                    </div>
                  </div>
                ) : (
                  questions.map((question) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                      <Link href={`/questions/${question._id}`} className="block">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-2">
                          {question.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{question.views} views</span>
                          <span>{question.answers} answers</span>
                          <span>{question.votes.upvotes.length - question.votes.downvotes.length} votes</span>
                        </div>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {answers.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComment className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No answers yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start helping others by answering questions.</p>
                    <div className="mt-6">
                      <Link
                        href="/questions"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Browse Questions
                      </Link>
                    </div>
                  </div>
                ) : (
                  answers.map((answer) => (
                    <div key={answer._id} className="border border-gray-200 rounded-lg p-4">
                      <Link href={`/questions/${answer.question._id}`} className="block">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-2">
                          {answer.question.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{answer.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{answer.votes.upvotes.length - answer.votes.downvotes.length} votes</span>
                          {answer.isAccepted && (
                            <span className="text-green-600 font-medium">✓ Accepted</span>
                          )}
                        </div>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 