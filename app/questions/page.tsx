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
    <div className="min-h-screen bg-[#0d1117]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#f0f6fc]">Questions</h1>
              <p className="mt-2 text-[#7d8590]">Find answers to your questions or help others</p>
            </div>
            {session && (
              <Link
                href="/questions/ask"
                className="inline-flex items-center px-4 py-2 btn-primary"
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
            <div className="card p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
                    Search Questions
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d8590] w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg focus:ring-2 focus:ring-[#238636] focus:border-[#238636] text-[#c9d1d9] placeholder-[#7d8590] transition-github"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Sort Options */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4 flex items-center">
                <FiFilter className="mr-2" />
                Sort by
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'newest', label: 'Newest', icon: FiClock },
                  { value: 'popular', label: 'Most Popular', icon: FiTrendingUp },
                  { value: 'votes', label: 'Most Voted', icon: FiThumbsUp },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-github flex items-center ${
                      sortBy === option.value 
                        ? 'bg-[#238636] text-white border border-[#238636]' 
                        : 'text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#f0f6fc]'
                    }`}
                  >
                    <option.icon className="mr-2 w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Filter</h3>
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
                    className={`w-full text-left px-3 py-2 rounded-lg transition-github ${
                      filter === option.value 
                        ? 'bg-[#238636] text-white border border-[#238636]' 
                        : 'text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#f0f6fc]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedTag || filter !== 'all') && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[#f0f6fc]">Active Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#58a6ff] hover:text-[#79c0ff] transition-github"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {searchTerm && (
                    <div className="flex items-center justify-between bg-[#21262d] px-3 py-2 rounded-lg">
                      <span className="text-sm text-[#c9d1d9]">Search: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-[#7d8590] hover:text-[#c9d1d9] transition-github"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {selectedTag && (
                    <div className="flex items-center justify-between bg-[#21262d] px-3 py-2 rounded-lg">
                      <span className="text-sm text-[#c9d1d9]">Tag: {selectedTag}</span>
                      <button
                        onClick={() => setSelectedTag('')}
                        className="text-[#7d8590] hover:text-[#c9d1d9] transition-github"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {filter !== 'all' && (
                    <div className="flex items-center justify-between bg-[#21262d] px-3 py-2 rounded-lg">
                      <span className="text-sm text-[#c9d1d9]">Filter: {filter}</span>
                      <button
                        onClick={() => setFilter('all')}
                        className="text-[#7d8590] hover:text-[#c9d1d9] transition-github"
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
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-4 bg-[#21262d] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#21262d] rounded w-1/2 mb-4"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-[#21262d] rounded w-16"></div>
                      <div className="h-3 bg-[#21262d] rounded w-20"></div>
                      <div className="h-3 bg-[#21262d] rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="card p-8 text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 text-[#7d8590] mb-4" />
                <h3 className="text-lg font-medium text-[#f0f6fc] mb-2">No questions found</h3>
                <p className="text-[#7d8590] mb-4">
                  {searchTerm || selectedTag || filter !== 'all' 
                    ? 'Try adjusting your search or filters.' 
                    : 'Be the first to ask a question!'}
                </p>
                {session && (
                  <Link
                    href="/questions/ask"
                    className="btn-primary"
                  >
                    Ask Question
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question._id} className="card p-6 hover:shadow-github-lg transition-github">
                    <div className="flex items-start space-x-4">
                      {/* Vote Count */}
                      <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                        <div className="text-lg font-bold text-[#f0f6fc]">
                          {getVoteCount(question.votes)}
                        </div>
                        <div className="text-xs text-[#7d8590]">votes</div>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/questions/${question._id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition-github line-clamp-2 mb-2">
                            {question.title}
                          </h3>
                          <p className="text-[#7d8590] line-clamp-2 mb-3">
                            {question.shortDescription}
                          </p>
                        </Link>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {question.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag} 
                              className="tag text-xs"
                            >
                              <FiTag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {question.tags.length > 3 && (
                            <span className="text-xs text-[#7d8590]">
                              +{question.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-[#7d8590]">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FiUser className="w-4 h-4" />
                              <span>{question.author.username}</span>
                              <span className="text-[#238636]">({question.author.reputation})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiClock className="w-4 h-4" />
                              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FiMessageSquare className="w-4 h-4" />
                              <span>{question.answers} answers</span>
                            </div>
                            {question.isAccepted && (
                              <span className="badge badge-success">Accepted</span>
                            )}
                          </div>
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