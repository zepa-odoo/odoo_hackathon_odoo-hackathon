import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { content, questionId } = await request.json();
    
    if (!content || !questionId) {
      return NextResponse.json(
        { error: 'Content and question ID are required' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(session.user.id);
    
    if (!user || user.isBanned) {
      return NextResponse.json(
        { error: 'User not found or banned' },
        { status: 403 }
      );
    }
    
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    const answer = new Answer({
      content,
      author: session.user.id,
      question: questionId,
    });
    
    await answer.save();
    
    // Create notification for question author
    if (question.author.toString() !== session.user.id) {
      await Notification.create({
        recipient: question.author,
        sender: session.user.id,
        type: 'answer',
        title: 'New Answer',
        message: `${session.user.username} answered your question: "${question.title}"`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id,
      });
    }
    
    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation')
      .lean();
    
    return NextResponse.json(populatedAnswer, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    );
  }
} 