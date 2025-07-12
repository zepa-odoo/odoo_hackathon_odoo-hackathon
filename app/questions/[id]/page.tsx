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
  FiImage,
  FiEdit,
  FiTrash2
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
  images: string[];
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
  const [answerImages, setAnswerImages] = useState<string[]>([]);
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
          images: answerImages,
        }),
      });

      if (response.ok) {
        const newAnswer = await response.json();
        setAnswers(prev => [newAnswer, ...prev]);
        setAnswerContent('');
        setAnswerImages([]);
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
        const error = await response.json();
        toast.error(error.error || 'Failed to accept answer');
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast.error('Failed to accept answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnswers(prev => prev.filter(answer => answer._id !== answerId));
        toast.success('Answer deleted successfully');
      } else {
        toast.error('Failed to delete answer');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer');
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnswerImages(prev => [...prev, data.url]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#238636] mx-auto"></div>
            <p className="mt-4 text-[#7d8590]">Loading question...</p>
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
    <div className="min-h-screen bg-[#0d1117]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Question Header */}
        <div className="card mb-6">
          <div className="p-6 border-b border-[#30363d]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">{question.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-[#7d8590]">
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
                  className={`p-3 rounded-lg hover:bg-[#21262d] transition-github ${
                    hasUpvotedQuestion ? 'text-[#238636] bg-[#238636]/10' : 'text-[#7d8590]'
                  }`}
                  disabled={!session}
                  title="Upvote"
                >
                  <FiThumbsUp className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold text-[#f0f6fc] min-w-[2rem] text-center">
                  {questionVoteCount}
                </span>
                <button
                  onClick={() => handleVote('question', question._id, 'downvote')}
                  className={`p-3 rounded-lg hover:bg-[#21262d] transition-github ${
                    hasDownvotedQuestion ? 'text-[#da3633] bg-[#da3633]/10' : 'text-[#7d8590]'
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
                  className="prose max-w-none mb-6 text-[#c9d1d9] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Images */}
                {question.images && question.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-[#c9d1d9] mb-3 flex items-center">
                      <FiImage className="w-4 h-4 mr-2" />
                      Attached Images
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.images.map((image, index) => (
                        <div key={index} className="border border-[#30363d] rounded-lg overflow-hidden">
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
                      className="tag"
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-full flex items-center justify-center">
                      <FiUser className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-[#f0f6fc]">{question.author.username}</div>
                      <div className="text-sm text-[#7d8590]">Reputation: {question.author.reputation}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#f0f6fc] mb-6">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>

          {answers.length === 0 ? (
            <div className="card p-8 text-center">
              <FiMessageSquare className="mx-auto h-12 w-12 text-[#7d8590] mb-4" />
              <h3 className="text-lg font-medium text-[#f0f6fc] mb-2">No answers yet</h3>
              <p className="text-[#7d8590] mb-4">Be the first to answer this question!</p>
              {!session && (
                <button 
                  onClick={() => router.push('/auth/signin')}
                  className="btn-primary"
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
                const canEdit = session && answer.author._id === session.user.id;

                return (
                  <div
                    key={answer._id}
                    className={`card ${
                      answer.isAccepted ? 'border-2 border-[#238636] bg-[#238636]/5' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Vote Controls */}
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={() => handleVote('answer', answer._id, 'upvote')}
                            className={`p-3 rounded-lg hover:bg-[#21262d] transition-github ${
                              hasUpvoted ? 'text-[#238636] bg-[#238636]/10' : 'text-[#7d8590]'
                            }`}
                            disabled={!session}
                            title="Upvote"
                          >
                            <FiThumbsUp className="w-6 h-6" />
                          </button>
                          <span className="text-xl font-bold text-[#f0f6fc] min-w-[2rem] text-center">
                            {voteCount}
                          </span>
                          <button
                            onClick={() => handleVote('answer', answer._id, 'downvote')}
                            className={`p-3 rounded-lg hover:bg-[#21262d] transition-github ${
                              hasDownvoted ? 'text-[#da3633] bg-[#da3633]/10' : 'text-[#7d8590]'
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
                              className="p-3 text-[#238636] hover:bg-[#238636]/10 rounded-lg transition-github"
                              title="Accept this answer"
                            >
                              <FiCheck className="w-6 h-6" />
                            </button>
                          )}
                          
                          {answer.isAccepted && (
                            <div className="p-3 text-[#238636] bg-[#238636]/10 rounded-lg">
                              <FiCheck className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          <div 
                            className="prose max-w-none mb-4 text-[#c9d1d9] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />

                          {/* Answer Images */}
                          {answer.images && answer.images.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-[#c9d1d9] mb-3 flex items-center">
                                <FiImage className="w-4 h-4 mr-2" />
                                Attached Images
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {answer.images.map((image, index) => (
                                  <div key={index} className="border border-[#30363d] rounded-lg overflow-hidden">
                                    <img
                                      src={image}
                                      alt={`Answer image ${index + 1}`}
                                      className="w-full h-48 object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#1f6feb] to-[#388bfd] rounded-full flex items-center justify-center">
                                <FiUser className="text-white w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-[#f0f6fc]">{answer.author.username}</div>
                                <div className="text-sm text-[#7d8590]">Reputation: {answer.author.reputation}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-[#7d8590]">
                                {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                              </div>
                              {canEdit && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleDeleteAnswer(answer._id)}
                                    className="p-1 text-[#da3633] hover:bg-[#da3633]/10 rounded transition-github"
                                    title="Delete answer"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
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
          <div className="card p-6">
            <h3 className="text-xl font-bold text-[#f0f6fc] mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="mb-4"
              />
              
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
                  Attach Images (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(handleImageUpload);
                  }}
                  className="input"
                />
                {answerImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {answerImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border border-[#30363d]"
                        />
                        <button
                          type="button"
                          onClick={() => setAnswerImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-1 -right-1 bg-[#da3633] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-[#f85149] transition-github"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <h3 className="text-xl font-bold text-[#f0f6fc] mb-2">Want to answer this question?</h3>
            <p className="text-[#7d8590] mb-4">Sign in to post your answer and help others.</p>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="btn-primary"
            >
              Sign In to Answer
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 