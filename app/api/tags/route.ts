import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Aggregate to get tag statistics
    const tagStats = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const tags = tagStats.map(tag => ({
      name: tag._id,
      count: tag.count,
      description: getTagDescription(tag._id)
    }));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

function getTagDescription(tagName: string): string {
  const descriptions: { [key: string]: string } = {
    'javascript': 'Programming language for web development',
    'react': 'JavaScript library for building user interfaces',
    'nodejs': 'JavaScript runtime for server-side development',
    'python': 'High-level programming language',
    'typescript': 'Typed superset of JavaScript',
    'nextjs': 'React framework for production',
    'mongodb': 'NoSQL database',
    'sql': 'Structured Query Language',
    'html': 'Markup language for web pages',
    'css': 'Styling language for web pages',
    'git': 'Version control system',
    'docker': 'Containerization platform',
    'aws': 'Cloud computing platform',
    'api': 'Application Programming Interface',
    'database': 'Data storage and management',
    'frontend': 'Client-side development',
    'backend': 'Server-side development',
    'fullstack': 'Full-stack development',
    'mobile': 'Mobile app development',
    'testing': 'Software testing and quality assurance'
  };

  return descriptions[tagName.toLowerCase()] || 'General programming topic';
} 