# StackIt - Q&A Forum

Try it:- https://q-a-forum.vercel.app/

A modern, feature-rich Q&A forum built with Next.js 14, TypeScript, and MongoDB Atlas. StackIt provides a platform for developers to ask questions, share knowledge, and build their reputation through community engagement.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure signup/signin with NextAuth.js
- **Password Criteria**: Passwords must be at least 8 characters, with uppercase, lowercase, number, and special character
- **Question Management**: Ask, view, and manage questions with rich text editing and image upload (up to 2 images per question)
- **Answer System**: Provide answers with upvote/downvote functionality
- **Tag System**: Organize content with tags and browse by topics
- **Search & Filter**: Advanced search with multiple filtering options
- **Image Upload & Display**: Attach images to questions and view them in detail pages

### Advanced Features
- **Dynamic Sorting**: Sort by newest, most popular, most voted, or most viewed
- **Smart Filtering**: Filter by unanswered questions, accepted answers, or highly upvoted content
- **View Counting**: Track question views dynamically
- **Reputation System**: Build reputation through community engagement
- **Admin Panel**: Full moderation panel for admins at `/admin-panel` (ban/unban users, delete questions/answers)
- **Responsive, Modern UI**: GitHub-inspired, clean, and accessible design

### User Experience
- **Real-time Notifications**: Stay updated with community activity
- **Rich Text Editor**: Enhanced content creation experience (bold, italic, lists, emoji, links, images, alignment)
- **Authentication Flow**: Seamless login redirects for protected actions
- **Loading States**: Smooth user experience with skeleton loading
- **Error Handling**: Comprehensive error messages and validation
- **Click Outside to Close**: Profile and notification dropdowns close when clicking outside
- **Logo Redirect**: Clicking the logo always takes you to the questions page

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB Atlas
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd QA_Forum
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**:
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses

5. **Get Connection String**:
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your desired database name

### 5. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use an online generator and add it to your `.env.local` file.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
QA_Forum/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── questions/     # Question management
│   │   ├── tags/          # Tag management
│   │   ├── vote/          # Voting API
│   │   ├── answers/       # Answer management
│   │   ├── notifications/ # Notification count
│   │   └── upload/        # Image upload
│   ├── auth/              # Authentication pages
│   ├── questions/         # Question pages
│   ├── tags/              # Tags page
│   ├── profile/           # User profile page
│   └── admin-panel/       # Admin panel (admins only)
├── components/            # Reusable React components
├── models/               # MongoDB/Mongoose models
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── scripts/              # Database seeding scripts
```

## 🔧 Configuration

### Database Models

The application uses three main models:

1. **User Model** (`models/User.ts`):
   - Username, email, password
   - Role (user/admin)
   - Reputation system
   - Account status (banned/active)

2. **Question Model** (`models/Question.ts`):
   - Title, content, short description
   - Tags, images
   - Vote tracking (upvotes/downvotes)
   - View count, answer count
   - Author reference

3. **Answer Model** (`models/Answer.ts`):
   - Content
   - Vote tracking
   - Acceptance status
   - Author and question references

### Authentication

The app uses NextAuth.js with:
- Credentials provider for email/password
- JWT sessions
- Protected routes
- Role-based access control
- Passwords must meet strong criteria (see above)

## 🎯 Key Features Explained

### Dynamic Question Filtering

The questions API supports multiple filter types:
- `all`: All questions
- `unanswered`: Questions with no answers
- `accepted`: Questions with accepted answers
- `upvoted`: Highly upvoted questions

### Advanced Sorting

Questions can be sorted by:
- `newest`: Most recently created
- `popular`: Most viewed
- `votes`: Most upvoted
- `views`: Most viewed

### Image Upload System

- Maximum 2 images per question
- 1MB file size limit per image
- Automatic validation and error handling
- Preview functionality before upload
- Images are displayed on the question detail page

### Voting System

- Upvote/downvote questions and answers
- Vote counts update in real time
- Reputation is awarded for upvotes on answers
- Voting is available to all logged-in users

### Admin Panel

- **Access**: `/admin-panel` (must be logged in as an admin)
- **Features**:
  - View all users, questions, and answers
  - Ban/unban users
  - Delete any question or answer
  - Only users with the `admin` role can access this page

### Authentication Flow

- Protected routes redirect to login
- Callback URLs for seamless navigation
- Session persistence across page reloads
- Role-based component rendering

### Modern UI/UX

- GitHub-inspired, clean, and accessible design
- Responsive layout for desktop and mobile
- Click outside to close dropdowns
- Logo always redirects to questions page
- Enhanced error and loading states

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

> **Note:** No `vercel.json` file is required unless you need custom rewrites or redirects. All API routes are handled by Next.js automatically.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages 
