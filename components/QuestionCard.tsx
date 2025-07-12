'use client';

import Link from 'next/link';
import { FiEye, FiMessageSquare, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface QuestionCardProps {
  question: {
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
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const voteCount = question.votes.upvotes.length - question.votes.downvotes.length;
  
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Vote Stats */}
        <div className="flex flex-col items-center space-y-2 text-gray-500">
          <div className="flex items-center space-x-1">
            <FiThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{question.votes.upvotes.length}</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{voteCount}</div>
          <div className="flex items-center space-x-1">
            <FiThumbsDown className="w-4 h-4" />
            <span className="text-sm font-medium">{question.votes.downvotes.length}</span>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/questions/${question._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2">
              {question.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {question.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="tag hover:bg-primary-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
            {question.tags.length > 3 && (
              <span className="text-gray-500 text-sm">+{question.tags.length - 3} more</span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Asked by {question.author.username}</span>
              <span>Reputation: {question.author.reputation}</span>
              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FiEye className="w-4 h-4" />
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiMessageSquare className="w-4 h-4" />
                <span>{question.answers} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 