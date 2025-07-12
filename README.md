# StackIt - Q&A Community Platform

A modern, feature-rich Q&A community platform built with Next.js, TypeScript, and MongoDB. StackIt provides a comprehensive solution for creating and managing question-and-answer communities with advanced features like reputation systems, admin management, and real-time notifications.

## 🌟 Features

### Core Functionality
- **Question & Answer System**: Create, edit, and manage questions with rich text editing
- **Voting System**: Upvote and downvote questions and answers
- **Tag System**: Organize content with customizable tags
- **Search & Filter**: Advanced search and filtering capabilities
- **User Profiles**: Detailed user profiles with reputation tracking

### Reputation System
- **Question Asking**: +50 reputation for asking questions
- **Answering**: +100 reputation for providing answers
- **Accepted Answers**: +50 reputation for having answers accepted
- **User Stats**: Track questions asked, answers given, and accepted answers

### Admin Features
- **Master Admin System**: Special master admin role with enhanced privileges
- **User Management**: Ban, suspend, and manage user accounts
- **Content Moderation**: Delete questions and answers
- **Suspension System**: Time-based user suspensions with custom reasons
- **Admin Management**: Add/remove admin accounts (master admin only)

### Enhanced User Experience
- **GitHub Dark Theme**: Beautiful dark theme inspired by GitHub
- **Rich Text Editor**: Advanced content editing with image support
- **Image Upload**: Support for images in questions and answers
- **Real-time Notifications**: Get notified for answers, mentions, and more
- **Responsive Design**: Mobile-friendly interface

### Security & Authentication
- **NextAuth.js**: Secure authentication system
- **Role-based Access**: User, admin, and master admin roles
- **Suspension System**: Prevent suspended users from accessing the platform
- **Input Validation**: Comprehensive form validation and sanitization

## 🚀 Live Demo

Visit the live application: **[stack1t.vercel.app](https://stack1t.vercel.app)**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom GitHub-inspired theme
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QA_Forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the master admin account**
   ```bash
   npm run setup-admin
   ```
   
   This creates the master admin account:
   - Email: `mohilp03437@gmail.com`
   - Password: `Parth@007`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Master Admin Setup
The application comes with a pre-configured master admin account:
- **Email**: `mohilp03437@gmail.com`
- **Password**: `Parth@007`

Only the master admin can:
- Add/remove other admin accounts
- Access the admin management panel
- Perform all administrative functions

### Admin Roles
- **Master Admin**: Full system access, can manage other admins
- **Admin**: Can manage users, questions, and answers
- **User**: Standard user with voting and content creation rights

## 📱 Usage

### For Users
1. **Sign up/Login**: Create an account or sign in
2. **Ask Questions**: Use the rich text editor to create detailed questions
3. **Answer Questions**: Provide helpful answers to earn reputation
4. **Vote**: Upvote good content and downvote poor content
5. **Accept Answers**: Mark the best answer as accepted (question authors only)

### For Admins
1. **Access Admin Panel**: Navigate to `/admin-panel`
2. **Manage Users**: Ban, suspend, or remove users
3. **Moderate Content**: Delete inappropriate questions and answers
4. **View Statistics**: Monitor user activity and platform usage

### For Master Admins
1. **Admin Management**: Add or remove admin accounts
2. **System Configuration**: Access advanced system settings
3. **Full Control**: All admin privileges plus master-level functions

## 🎨 Customization

### Theme Customization
The application uses a GitHub-inspired dark theme. You can customize colors by modifying the CSS variables in `app/globals.css`.

### Feature Configuration
- **Reputation Points**: Modify reputation values in the API routes
- **Suspension Limits**: Adjust maximum suspension periods
- **Content Limits**: Change character limits for questions and answers

## 🔒 Security Features

- **Input Sanitization**: All user inputs are sanitized
- **Role-based Access Control**: Secure access to admin features
- **Session Management**: Secure session handling with NextAuth.js
- **Rate Limiting**: Built-in protection against abuse
- **Suspension System**: Time-based user restrictions

## 📊 Database Schema

### User Model
```typescript
{
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'master';
  reputation: number;
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  isBanned: boolean;
  suspendedUntil?: Date;
  suspensionReason?: string;
}
```

### Question Model
```typescript
{
  title: string;
  content: string;
  author: ObjectId;
  tags: string[];
  images: string[];
  votes: { upvotes: ObjectId[], downvotes: ObjectId[] };
  views: number;
  answers: number;
  isAccepted: boolean;
}
```

### Answer Model
```typescript
{
  content: string;
  images: string[];
  author: ObjectId;
  question: ObjectId;
  votes: { upvotes: ObjectId[], downvotes: ObjectId[] };
  isAccepted: boolean;
}
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Database managed with [MongoDB](https://www.mongodb.com/)

---

**StackIt** - Empowering communities through knowledge sharing. 