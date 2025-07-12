import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const questionId = searchParams.get('questionId');
    
    let query: any = {};
    
    if (author) {
      query.author = author;
    }
    
    if (questionId) {
      query.question = questionId;
    }
    
    const answers = await Answer.find(query)
      .populate('author', 'username reputation')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { content, questionId, images } = await request.json();
    
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

    // Check if user is suspended
    if (user.suspendedUntil && new Date() < user.suspendedUntil) {
      return NextResponse.json(
        { error: 'Your account is currently suspended' },
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
      images: images || [],
      author: session.user.id,
      question: questionId,
    });
    
    await answer.save();

    // Update user reputation and stats (+100 reputation for answering)
    user.reputation += 100;
    user.answersGiven += 1;
    await user.save();
    
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
    
    return NextResponse.json({
      ...populatedAnswer,
      reputationGained: 100
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    );
  }
} 