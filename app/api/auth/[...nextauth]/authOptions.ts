import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user || user.isBanned) {
          return null;
        }

        // Check if user is suspended
        if (user.suspendedUntil && new Date() < user.suspendedUntil) {
          return null;
        }

        const isValidPassword = await user.comparePassword(credentials.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          reputation: user.reputation,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.reputation = user.reputation;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.reputation = token.reputation as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 