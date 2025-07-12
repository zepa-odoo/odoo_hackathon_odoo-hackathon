'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { FiThumbsUp, FiThumbsDown, FiCheck, FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import RichTextEditor from '@/components/RichTextEditor';
import Header from '@/components/Header';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  _id: string;
  title: string;
  content: string;
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
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [params.id]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setQuestion(data.question);
        setAnswers(data.answers);
      } else {
        toast.error('Question not found');
        router.push('/');
      }
    } catch (error) {
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
          setQuestion(updatedItem);
        } else {
          setAnswers(prev => 
            prev.map(answer => 
              answer._id === itemId ? updatedItem : answer
            )
          );
        }
      } else {
        toast.error('Failed to vote');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to answer');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please enter an answer');
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
          questionId: params.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswers(prev => [data, ...prev]);
        setAnswerContent('');
        toast.success('Answer posted successfully!');
      } else {
        toast.error(data.error || 'Failed to post answer');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!session || !question || question.author._id !== session.user.id) {
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'PUT',
      });

      if (response.ok) {
        setAnswers(prev =>
          prev.map(answer => ({
            ...answer,
            isAccepted: answer._id === answerId,
          }))
        );
        setQuestion(prev => prev ? { ...prev, isAccepted: true, acceptedAnswer: answerId } : null);
        toast.success('Answer accepted!');
      } else {
        toast.error('Failed to accept answer');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
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
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Question */}
        <div className="card mb-8">
          <div className="flex gap-4">
            {/* Vote Controls */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleVote('question', question._id, 'upvote')}
                className={`p-2 rounded hover:bg-gray-100 ${
                  hasUpvotedQuestion ? 'text-primary-600' : 'text-gray-400'
                }`}
                disabled={!session}
              >
                <FiThumbsUp className="w-5 h-5" />
              </button>
              <span className="text-lg font-bold text-gray-900">{questionVoteCount}</span>
              <button
                onClick={() => handleVote('question', question._id, 'downvote')}
                className={`p-2 rounded hover:bg-gray-100 ${
                  hasDownvotedQuestion ? 'text-red-600' : 'text-gray-400'
                }`}
                disabled={!session}
              >
                <FiThumbsDown className="w-5 h-5" />
              </button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
              
              <div 
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Asked by {question.author.username}</span>
                  <span>Reputation: {question.author.reputation}</span>
                  <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span>{question.views} views</span>
                  <span>{answers.length} answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>

          {answers.length === 0 ? (
            <div className="card text-center py-8">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
              <p className="text-gray-500">Be the first to answer this question!</p>
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
                    className={`card ${answer.isAccepted ? 'border-2 border-green-500' : ''}`}
                  >
                    <div className="flex gap-4">
                      {/* Vote Controls */}
                      <div className="flex flex-col items-center space-y-2">
                        <button
                          onClick={() => handleVote('answer', answer._id, 'upvote')}
                          className={`p-2 rounded hover:bg-gray-100 ${
                            hasUpvoted ? 'text-primary-600' : 'text-gray-400'
                          }`}
                          disabled={!session}
                        >
                          <FiThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-bold text-gray-900">{voteCount}</span>
                        <button
                          onClick={() => handleVote('answer', answer._id, 'downvote')}
                          className={`p-2 rounded hover:bg-gray-100 ${
                            hasDownvoted ? 'text-red-600' : 'text-gray-400'
                          }`}
                          disabled={!session}
                        >
                          <FiThumbsDown className="w-5 h-5" />
                        </button>
                        
                        {/* Accept Answer Button */}
                        {session && question.author._id === session.user.id && !question.isAccepted && (
                          <button
                            onClick={() => handleAcceptAnswer(answer._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Accept this answer"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                        )}
                        
                        {answer.isAccepted && (
                          <div className="p-2 text-green-600 bg-green-50 rounded">
                            <FiCheck className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1">
                        <div 
                          className="prose max-w-none mb-4"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Answered by {answer.author.username}</span>
                            <span>Reputation: {answer.author.reputation}</span>
                            <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
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
        {session && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                content={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="mb-4"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
} 