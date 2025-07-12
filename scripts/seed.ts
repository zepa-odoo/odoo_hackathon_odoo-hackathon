import dbConnect from '../lib/mongodb';
import User from '../models/User';
import Question from '../models/Question';
import Answer from '../models/Answer';

async function seed() {
  try {
    await dbConnect();
    
    console.log('🌱 Starting database seed...');
    
    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@stackit.com',
      password: 'admin123',
      role: 'admin',
      reputation: 1000,
    });
    await adminUser.save();
    
    // Create regular users
    const user1 = new User({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      reputation: 150,
    });
    await user1.save();
    
    const user2 = new User({
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      reputation: 320,
    });
    await user2.save();
    
    const user3 = new User({
      username: 'dev_expert',
      email: 'dev@example.com',
      password: 'password123',
      reputation: 750,
    });
    await user3.save();
    
    console.log('👥 Created users');
    
    // Create sample questions
    const questions = [
      {
        title: 'How to implement authentication in Next.js with NextAuth?',
        content: `
          <p>I'm building a Next.js application and need to implement user authentication. I've heard NextAuth.js is a popular solution, but I'm not sure how to get started.</p>
          <p>Here's what I need:</p>
          <ul>
            <li>User registration and login</li>
            <li>Session management</li>
            <li>Protected routes</li>
            <li>Database integration</li>
          </ul>
          <p>Can someone provide a step-by-step guide or point me to good resources?</p>
        `,
        author: user1._id,
        tags: ['nextjs', 'nextauth', 'authentication', 'javascript'],
        votes: { upvotes: [user2._id, user3._id], downvotes: [] },
        views: 45,
      },
      {
        title: 'Best practices for MongoDB schema design',
        content: `
          <p>I'm designing a database schema for a social media application using MongoDB. I want to ensure good performance and scalability.</p>
          <p>Key considerations:</p>
          <ul>
            <li>Document structure</li>
            <li>Indexing strategies</li>
            <li>Embedding vs referencing</li>
            <li>Sharding considerations</li>
          </ul>
          <p>What are the best practices I should follow?</p>
        `,
        author: user2._id,
        tags: ['mongodb', 'database', 'schema-design', 'nosql'],
        votes: { upvotes: [user1._id, adminUser._id], downvotes: [] },
        views: 78,
      },
      {
        title: 'TypeScript vs JavaScript: When to use each?',
        content: `
          <p>I'm starting a new project and can't decide between TypeScript and JavaScript. I understand TypeScript adds static typing, but I'm concerned about the learning curve and setup complexity.</p>
          <p>Questions:</p>
          <ul>
            <li>When is TypeScript worth the extra complexity?</li>
            <li>How steep is the learning curve?</li>
            <li>Performance implications?</li>
            <li>Team collaboration benefits?</li>
          </ul>
        `,
        author: user3._id,
        tags: ['typescript', 'javascript', 'programming', 'web-development'],
        votes: { upvotes: [user1._id, user2._id, adminUser._id], downvotes: [] },
        views: 120,
      },
      {
        title: 'How to deploy a Next.js app to Vercel?',
        content: `
          <p>I've built a Next.js application and want to deploy it to Vercel. I've heard it's the easiest platform for Next.js apps.</p>
          <p>Steps I need help with:</p>
          <ul>
            <li>Setting up Vercel account</li>
            <li>Connecting GitHub repository</li>
            <li>Environment variables</li>
            <li>Custom domain setup</li>
          </ul>
        `,
        author: user1._id,
        tags: ['nextjs', 'vercel', 'deployment', 'web-development'],
        votes: { upvotes: [user2._id], downvotes: [] },
        views: 32,
      },
      {
        title: 'React hooks best practices and common pitfalls',
        content: `
          <p>I've been using React hooks for a while, but I want to make sure I'm following best practices and avoiding common mistakes.</p>
          <p>Areas I want to improve:</p>
          <ul>
            <li>useEffect dependency arrays</li>
            <li>Custom hooks design</li>
            <li>Performance optimization</li>
            <li>State management patterns</li>
          </ul>
        `,
        author: user2._id,
        tags: ['react', 'hooks', 'javascript', 'frontend'],
        votes: { upvotes: [user1._id, user3._id, adminUser._id], downvotes: [] },
        views: 95,
      },
    ];
    
    const createdQuestions = await Question.insertMany(questions);
    console.log('❓ Created questions');
    
    // Create sample answers
    const answers = [
      {
        content: `
          <p>Great question! NextAuth.js is indeed an excellent choice for Next.js authentication. Here's a step-by-step guide:</p>
          <h3>1. Installation</h3>
          <pre><code>npm install next-auth</code></pre>
          
          <h3>2. Basic Setup</h3>
          <p>Create an API route at <code>pages/api/auth/[...nextauth].js</code>:</p>
          <pre><code>import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
  providers: [
    Providers.Credentials({
      // Your credentials configuration
    })
  ]
})</code></pre>
          
          <p>This should get you started! Let me know if you need help with any specific part.</p>
        `,
        author: user3._id,
        question: createdQuestions[0]._id,
        votes: { upvotes: [user1._id, user2._id], downvotes: [] },
        isAccepted: true,
      },
      {
        content: `
          <p>Here's a comprehensive guide to MongoDB schema design best practices:</p>
          
          <h3>1. Document Structure</h3>
          <ul>
            <li>Keep documents under 16MB</li>
            <li>Use meaningful field names</li>
            <li>Consider query patterns when designing</li>
          </ul>
          
          <h3>2. Embedding vs Referencing</h3>
          <p><strong>Embed when:</strong></p>
          <ul>
            <li>Data is small and doesn't change often</li>
            <li>You always access the data together</li>
            <li>Data doesn't need to be shared</li>
          </ul>
          
          <p><strong>Reference when:</strong></p>
          <ul>
            <li>Data is large or changes frequently</li>
            <li>Data needs to be shared across documents</li>
            <li>You need to query the data independently</li>
          </ul>
        `,
        author: adminUser._id,
        question: createdQuestions[1]._id,
        votes: { upvotes: [user1._id, user2._id, user3._id], downvotes: [] },
        isAccepted: true,
      },
      {
        content: `
          <p>TypeScript is definitely worth considering for most projects. Here's my take:</p>
          
          <h3>When to use TypeScript:</h3>
          <ul>
            <li>Medium to large projects</li>
            <li>Team development</li>
            <li>Complex business logic</li>
            <li>Long-term maintenance</li>
          </ul>
          
          <h3>Learning Curve:</h3>
          <p>The learning curve is manageable, especially if you start gradually. You can:</p>
          <ul>
            <li>Start with <code>any</code> types</li>
            <li>Gradually add type annotations</li>
            <li>Use strict mode later</li>
          </ul>
          
          <p>The benefits in code quality and developer experience usually outweigh the initial learning cost.</p>
        `,
        author: user3._id,
        question: createdQuestions[2]._id,
        votes: { upvotes: [user1._id, user2._id], downvotes: [] },
      },
    ];
    
    await Answer.insertMany(answers);
    console.log('💬 Created answers');
    
    // Update questions with answer counts
    for (const question of createdQuestions) {
      const answerCount = await Answer.countDocuments({ question: question._id });
      await Question.findByIdAndUpdate(question._id, { answers: answerCount });
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log(`- ${await User.countDocuments()} users`);
    console.log(`- ${await Question.countDocuments()} questions`);
    console.log(`- ${await Answer.countDocuments()} answers`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 