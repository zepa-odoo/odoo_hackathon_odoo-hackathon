import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const answer = await Answer.findById(params.id).populate('question');
    
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    
    const question = await Question.findById(answer.question._id);
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the question author
    if (question.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the question author can accept answers' },
        { status: 403 }
      );
    }
    
    // Update answer and question
    await Promise.all([
      Answer.findByIdAndUpdate(params.id, { isAccepted: true }),
      Question.findByIdAndUpdate(question._id, { 
        isAccepted: true, 
        acceptedAnswer: params.id 
      }),
    ]);
    
    return NextResponse.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    console.error('Error accepting answer:', error);
    return NextResponse.json(
      { error: 'Failed to accept answer' },
      { status: 500 }
    );
  }
} 