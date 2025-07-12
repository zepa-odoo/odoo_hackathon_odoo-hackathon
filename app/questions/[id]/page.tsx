'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiThumbsUp, 
  FiThumbsDown, 
  FiCheck, 
  FiMessageSquare, 
  FiEye, 
  FiClock,
  FiUser,
  FiTag,
  FiImage
} from 'react-icons/fi';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  title: string;
  content: string;
  shortDescription: string;
  images: string[];
  author: {
    _id: string;
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
  isAccepted: boolean;
  acceptedAnswer?: string;
  createdAt: string;
}

interface Answer {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    reputation: number;
  };
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  isAccepted: boolean;
  createdAt: string;
}

export default function QuestionPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
        setAnswers(data.answers);
      } else {
        toast.error('Question not found');
        router.push('/questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'question' | 'answer', itemId: string, voteType: 'upvote' | 'downvote') => {
    if (!session) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, itemId, voteType }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        
        if (type === 'question') {
          setQuestion(prev => prev ? { ...prev, votes: updatedItem.votes } : null);
        } else {
          setAnswers(prev => prev.map(answer => 
            answer._id === itemId ? { ...answer, votes: updatedItem.votes } : answer
          ));
        }
        toast.success('Vote recorded successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please sign in to answer');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please write an answer');
      return;
    }

    setSubmittingAnswer(true);

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answerContent,
          questionId: id,
        }),
      });

      if (response.ok) {
        const newAnswer = await response.json();
        setAnswers(prev => [newAnswer, ...prev]);
        setAnswerContent('');
        toast.success('Answer posted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to post answer');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error('Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'PUT',
      });

      if (response.ok) {
        setAnswers(prev => prev.map(answer => ({
          ...answer,
          isAccepted: answer._id === answerId
        })));
        setQuestion(prev => prev ? { ...prev, isAccepted: true, acceptedAnswer: answerId } : null);
        toast.success('Answer accepted!');
      } else {
        toast.error('Failed to accept answer');
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast.error('Failed to accept answer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const questionVoteCount = question.votes.upvotes.length - question.votes.downvotes.length;
  const hasUpvotedQuestion = session && question.votes.upvotes.includes(session.user.id);
  const hasDownvotedQuestion = session && question.votes.downvotes.includes(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Question Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiEye className="w-4 h-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{answers.length} answers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Vote Controls */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleVote('question', question._id, 'upvote')}
                  className={`p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    hasUpvotedQuestion ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                  }`}
                  disabled={!session}
                  title="Upvote"
                >
                  <FiThumbsUp className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                  {questionVoteCount}
                </span>
                <button
                  onClick={() => handleVote('question', question._id, 'downvote')}
                  className={`p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    hasDownvotedQuestion ? 'text-red-600 bg-red-50' : 'text-gray-400'
                  }`}
                  disabled={!session}
                  title="Downvote"
                >
                  <FiThumbsDown className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div 
                  className="prose max-w-none mb-6 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Images */}
                {question.images && question.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FiImage className="w-4 h-4 mr-2" />
                      Attached Images
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.images.map((image, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Question image ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <FiUser className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{question.author.username}</div>
                      <div className="text-sm text-gray-500">Reputation: {question.author.reputation}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>

          {answers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
              <p className="text-gray-500 mb-4">Be the first to answer this question!</p>
              {!session && (
                <button 
                  onClick={() => router.push('/auth/signin')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign in to Answer
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer) => {
                const voteCount = answer.votes.upvotes.length - answer.votes.downvotes.length;
                const hasUpvoted = session && answer.votes.upvotes.includes(session.user.id);
                const hasDownvoted = session && answer.votes.downvotes.includes(session.user.id);

                return (
                  <div
                    key={answer._id}
                    className={`bg-white border rounded-lg shadow-sm ${
                      answer.isAccepted ? 'border-2 border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Vote Controls */}
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={() => handleVote('answer', answer._id, 'upvote')}
                            className={`p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                              hasUpvoted ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                            }`}
                            disabled={!session}
                            title="Upvote"
                          >
                            <FiThumbsUp className="w-6 h-6" />
                          </button>
                          <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                            {voteCount}
                          </span>
                          <button
                            onClick={() => handleVote('answer', answer._id, 'downvote')}
                            className={`p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                              hasDownvoted ? 'text-red-600 bg-red-50' : 'text-gray-400'
                            }`}
                            disabled={!session}
                            title="Downvote"
                          >
                            <FiThumbsDown className="w-6 h-6" />
                          </button>
                          
                          {/* Accept Answer Button */}
                          {session && question.author._id === session.user.id && !question.isAccepted && (
                            <button
                              onClick={() => handleAcceptAnswer(answer._id)}
                              className="p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Accept this answer"
                            >
                              <FiCheck className="w-6 h-6" />
                            </button>
                          )}
                          
                          {answer.isAccepted && (
                            <div className="p-3 text-green-600 bg-green-100 rounded-lg">
                              <FiCheck className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          <div 
                            className="prose max-w-none mb-4 text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />

                          {/* Meta Info */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                <FiUser className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{answer.author.username}</div>
                                <div className="text-sm text-gray-500">Reputation: {answer.author.reputation}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {session ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="mb-4"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Want to answer this question?</h3>
            <p className="text-gray-600 mb-4">Sign in to post your answer and help others.</p>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Answer
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 