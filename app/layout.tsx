import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StackIt - Q&A Community',
  description: 'A modern Q&A community platform for asking and answering questions',
  keywords: 'Q&A, questions, answers, community, stackit, forum',
  authors: [{ name: 'StackIt Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0d1117',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
} 