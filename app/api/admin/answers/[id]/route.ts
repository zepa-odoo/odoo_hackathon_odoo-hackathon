import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const answer = await Answer.findByIdAndDelete(params.id);
    
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    return NextResponse.json(
      { error: 'Failed to delete answer' },
      { status: 500 }
    );
  }
} 