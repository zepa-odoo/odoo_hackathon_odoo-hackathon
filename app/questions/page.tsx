'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiSearch, FiTrendingUp, FiClock, FiMessageSquare, FiFilter } from 'react-icons/fi';
import QuestionCard from '@/components/QuestionCard';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';

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
  isAccepted: boolean;
}

export default function QuestionsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

  useEffect(() => {
    fetchQuestions();
  }, [sortBy, filter, selectedTag]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sort', sortBy);
      if (filter) params.append('filter', filter);
      if (selectedTag) params.append('tag', selectedTag);
      
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
    updateURL();
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateURL();
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (sortBy) params.append('sort', sortBy);
    if (filter) params.append('filter', filter);
    if (selectedTag) params.append('tag', selectedTag);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/questions${newURL}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setFilter('all');
    setSelectedTag('');
    router.push('/questions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sort by</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'newest' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiClock className="inline mr-2" />
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'popular' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiTrendingUp className="inline mr-2" />
                  Most Popular
                </button>
                <button
                  onClick={() => handleSortChange('votes')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'votes' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiTrendingUp className="inline mr-2" />
                  Most Voted
                </button>
                <button
                  onClick={() => handleSortChange('views')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'views' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiMessageSquare className="inline mr-2" />
                  Most Viewed
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Filter</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  All Questions
                </button>
                <button
                  onClick={() => handleFilterChange('unanswered')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filter === 'unanswered' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  No Answers
                </button>
                <button
                  onClick={() => handleFilterChange('accepted')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filter === 'accepted' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Accepted Answers
                </button>
                <button
                  onClick={() => handleFilterChange('upvoted')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filter === 'upvoted' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Highly Upvoted
                </button>
              </div>
            </div>

            {session && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <Link
                  href="/questions/ask"
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <FiPlus className="mr-2" />
                  Ask Question
                </Link>
              </div>
            )}

            {(searchTerm || selectedTag || filter !== 'all') && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Active Filters</h3>
                <div className="space-y-2">
                  {searchTerm && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Search: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {selectedTag && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tag: {selectedTag}</span>
                      <button
                        onClick={() => setSelectedTag('')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {filter !== 'all' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Filter: {filter}</span>
                      <button
                        onClick={() => setFilter('all')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button
                    onClick={clearFilters}
                    className="w-full btn btn-secondary text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
              
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
                  {searchTerm || selectedTag || filter !== 'all' 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Be the first to ask a question!'}
                </p>
                {session && (
                  <Link href="/questions/ask" className="btn btn-primary">
                    Ask Question
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question._id} question={question} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 