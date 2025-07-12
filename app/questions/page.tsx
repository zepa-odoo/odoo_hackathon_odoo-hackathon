'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiPlus, 
  FiSearch, 
  FiTrendingUp, 
  FiClock, 
  FiMessageSquare, 
  FiFilter,
  FiEye,
  FiThumbsUp,
  FiTag,
  FiUser,
  FiX
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';

interface Question {
  _id: string;
  title: string;
  content: string;
  shortDescription: string;
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

  const getVoteCount = (votes: { upvotes: string[]; downvotes: string[] }) => {
    return votes.upvotes.length - votes.downvotes.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
              <p className="mt-2 text-gray-600">Find answers to your questions or help others</p>
            </div>
            {session && (
              <Link
                href="/questions/ask"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Ask Question
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Questions
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Sort Options */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiFilter className="mr-2" />
                Sort by
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'newest', label: 'Newest', icon: FiClock },
                  { value: 'popular', label: 'Most Popular', icon: FiTrendingUp },
                  { value: 'votes', label: 'Most Voted', icon: FiThumbsUp },
                  { value: 'views', label: 'Most Viewed', icon: FiEye },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      sortBy === option.value 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <option.icon className="mr-2 w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Questions' },
                  { value: 'unanswered', label: 'No Answers' },
                  { value: 'accepted', label: 'Accepted Answers' },
                  { value: 'upvoted', label: 'Highly Upvoted' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filter === option.value 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedTag || filter !== 'all') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {searchTerm && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700">Search: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {selectedTag && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700">Tag: {selectedTag}</span>
                      <button
                        onClick={() => setSelectedTag('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {filter !== 'all' && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700">Filter: {filter}</span>
                      <button
                        onClick={() => setFilter('all')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedTag || filter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to ask a question!'
                  }
                </p>
                {session && (
                  <Link
                    href="/questions/ask"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Ask Question
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-6">
                      {/* Stats */}
                      <div className="flex flex-col items-center space-y-2 text-center min-w-[80px]">
                        <div className="text-lg font-bold text-gray-900">
                          {getVoteCount(question.votes)}
                        </div>
                        <div className="text-xs text-gray-500">votes</div>
                        <div className="text-lg font-bold text-gray-900">
                          {question.answers}
                        </div>
                        <div className="text-xs text-gray-500">answers</div>
                        <div className="text-sm text-gray-500">
                          {question.views} views
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <Link
                          href={`/questions/${question._id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {question.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {question.shortDescription}
                          </p>
                        </Link>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                            >
                              <FiTag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {question.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{question.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FiUser className="w-4 h-4" />
                              <span>{question.author.username}</span>
                            </div>
                            <span>Reputation: {question.author.reputation}</span>
                            <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                          </div>
                          {question.isAccepted && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <FiMessageSquare className="w-4 h-4" />
                              <span>Accepted</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 