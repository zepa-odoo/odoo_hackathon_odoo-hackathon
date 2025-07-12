'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSearch, FiTrendingUp, FiClock, FiMessageSquare } from 'react-icons/fi';
import QuestionCard from '@/components/QuestionCard';
import Header from '@/components/Header';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  tags: string[];
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  views: number;
  answers: number;
  createdAt: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchQuestions();
  }, [sortBy]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy === 'popular') params.append('sort', 'votes');
      
      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleAskQuestion = () => {
    if (session) {
      router.push('/questions/ask');
    } else {
      router.push('/auth/signin?callbackUrl=/questions/ask');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to StackIt
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A community-driven Q&A platform where developers help each other solve problems and share knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAskQuestion}
              className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center"
            >
              <FiPlus className="mr-2" />
              Ask a Question
            </button>
            <Link
              href="/questions"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Browse Questions
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sort by</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'newest' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiClock className="inline mr-2" />
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'popular' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiTrendingUp className="inline mr-2" />
                  Most Popular
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/tags"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Browse Tags
                </Link>
                <Link
                  href="/questions?filter=unanswered"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Unanswered Questions
                </Link>
                {session && (
                  <Link
                    href="/questions/ask"
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Ask Question
                  </Link>
                )}
              </div>
            </div>

            {!session && (
              <div className="card bg-primary-50 border-primary-200">
                <h3 className="text-lg font-semibold mb-4 text-primary-900">Join the Community</h3>
                <p className="text-sm text-primary-700 mb-4">
                  Sign up to ask questions, answer others, and build your reputation.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/auth/signup"
                    className="btn btn-primary w-full text-sm"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="btn btn-secondary w-full text-sm"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Questions</h2>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input flex-1 min-w-0"
                />
                <button type="submit" className="btn btn-primary">
                  <FiSearch />
                </button>
              </form>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="card text-center py-12">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to ask a question!'}
                </p>
                <button
                  onClick={handleAskQuestion}
                  className="btn btn-primary"
                >
                  Ask Question
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question._id} question={question} />
                ))}
              </div>
            )}

            {questions.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/questions"
                  className="btn btn-secondary"
                >
                  View All Questions
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 