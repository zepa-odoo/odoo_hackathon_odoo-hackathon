import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const filter = searchParams.get('filter') || 'all';
    
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    // Tag filter
    if (tag) {
      query.tags = tag;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Advanced filters
    if (filter === 'unanswered') {
      query.answers = { $size: 0 };
    } else if (filter === 'accepted') {
      query.isAccepted = true;
    } else if (filter === 'upvoted') {
      query['votes.upvotes'] = { $exists: true, $ne: [] };
    }
    
    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'popular':
        sortObj = { views: -1 };
        break;
      case 'votes':
        sortObj = { 'votes.upvotes': -1 };
        break;
      case 'views':
        sortObj = { views: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
    
    const questions = await Question.find(query)
      .populate('author', 'username reputation')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Add answer count and vote count to each question
    const questionsWithStats = await Promise.all(
      questions.map(async (question) => {
        const answerCount = await Question.aggregate([
          { $match: { _id: question._id } },
          {
            $lookup: {
              from: 'answers',
              localField: '_id',
              foreignField: 'question',
              as: 'answers'
            }
          },
          { $unwind: '$answers' },
          { $count: 'count' }
        ]);

        const voteCount = (question.votes?.upvotes?.length || 0) - (question.votes?.downvotes?.length || 0);
        
        return {
          ...question,
          answers: answerCount[0]?.count || 0,
          voteCount
        };
      })
    );
    
    const total = await Question.countDocuments(query);
    
    return NextResponse.json({
      questions: questionsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

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
    
    const { title, content, tags, shortDescription, images } = await request.json();
    
    if (!title || !content || !tags || tags.length === 0) {
      return NextResponse.json(
        { error: 'Title, content, and tags are required' },
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
    
    const question = new Question({
      title,
      content,
      shortDescription: shortDescription || content.substring(0, 200),
      author: session.user.id,
      tags: tags.map((tag: string) => tag.toLowerCase().trim()),
      images: images || [],
      answers: 0,
      views: 0,
      votes: {
        upvotes: [],
        downvotes: []
      }
    });
    
    await question.save();
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation')
      .lean();
    
    return NextResponse.json(populatedQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
} 