# StackIt - Q&A Community Platform

A modern, feature-rich Q&A platform built with Next.js, TypeScript, and MongoDB, designed for developers to ask questions, share knowledge, and build a thriving community.

## 🌐 Live Demo

**Visit the application:** [stack1t.vercel.app](https://stack1t.vercel.app)

## ✨ Features

### Core Functionality
- **Ask & Answer Questions**: Create detailed questions with rich text formatting
- **Voting System**: Upvote/downvote questions and answers
- **Accept Answers**: Mark the best answer as accepted
- **Tag System**: Organize content with tags for easy discovery
- **Search & Filter**: Find questions by tags, popularity, and date
- **Image Support**: Attach images to questions and answers

### User Experience
- **GitHub Dark Theme**: Modern, eye-friendly dark interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Notifications**: Get notified for mentions, answers, and interactions
- **User Profiles**: Track reputation, questions, and answers
- **Edit & Delete**: Manage your own content

### Reputation System
- **+50 points** for asking a question
- **+100 points** for answering a question
- **+50 points** for having an answer accepted
- **Reputation tracking** and display on profiles

### Admin Features
- **Master Admin**: Special privileges for platform management
- **User Management**: Ban, suspend, and delete user accounts
- **Admin Panel**: Comprehensive dashboard for platform administration
- **Content Moderation**: Manage questions, answers, and user behavior

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication system

### Deployment
- **Vercel** - Hosting and deployment platform
- **MongoDB Atlas** - Cloud database hosting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QA_Forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GITHUB_ID=your_github_oauth_id
   GITHUB_SECRET=your_github_oauth_secret
   ```

4. **Database Setup**
   ```bash
   npm run setup-admin
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
QA_Forum/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── questions/         # Question pages
│   ├── tags/              # Tags page
│   ├── profile/           # User profile
│   └── admin-panel/       # Admin dashboard
├── components/            # Reusable components
├── models/               # MongoDB models
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── scripts/              # Setup and utility scripts
```

## 🔧 Configuration

### Master Admin Setup
The application comes with a master admin account:
- **Email**: mohilp03437@gmail.com
- **Password**: Parth@007

Only the master admin can:
- Add/remove other admins
- Access full admin privileges
- Manage platform settings

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GITHUB_ID` | GitHub OAuth App ID | Optional |
| `GITHUB_SECRET` | GitHub OAuth App Secret | Optional |

## 🎨 Features in Detail

### Authentication
- **NextAuth.js** integration
- **GitHub OAuth** support
- **Session management**
- **Protected routes**

### Question Management
- **Rich text editor** with formatting options
- **Image upload** support (max 2 images, 1MB each)
- **Tag system** for categorization
- **Voting mechanism** for quality control

### User Experience
- **Dark theme** based on GitHub's design
- **Responsive layout** for all devices
- **Real-time notifications** for user engagement
- **Reputation system** to encourage quality contributions

### Admin Panel
- **User management** (ban, suspend, delete)
- **Content moderation** tools
- **Admin role management**
- **Platform statistics**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Vercel** for seamless deployment
- **GitHub** for the design inspiration
- **MongoDB** for the database solution

## 📞 Support

If you have any questions or need support:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the developer community**
