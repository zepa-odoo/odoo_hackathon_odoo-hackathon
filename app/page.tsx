import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/authOptions';
import { FaSearch, FaQuestion, FaTags, FaUsers, FaChartLine } from 'react-icons/fa';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Hero Section */}
      <section className="bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#f0f6fc] mb-6">
              Welcome to <span className="text-[#58a6ff]">StackIt</span>
            </h1>
            <p className="text-xl text-[#c9d1d9] mb-8 max-w-3xl mx-auto">
              Ask questions, share knowledge, and connect with developers from around the world. 
              Get answers to your programming questions and help others learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link 
                  href="/questions/ask" 
                  className="bg-[#238636] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#2ea043] transition-github"
                >
                  Ask a Question
                </Link>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className="bg-[#238636] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#2ea043] transition-github"
                >
                  Get Started
                </Link>
              )}
              <Link 
                href="/questions" 
                className="border border-[#30363d] text-[#c9d1d9] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#21262d] transition-github"
              >
                Browse Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#f0f6fc] mb-4">
              Why Choose StackIt?
            </h2>
            <p className="text-lg text-[#c9d1d9] max-w-2xl mx-auto">
              Our platform is designed to make learning and sharing knowledge easy and effective.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1f6feb] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-[#58a6ff]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-2">Smart Search</h3>
              <p className="text-[#c9d1d9]">
                Find answers quickly with our powerful search and filtering system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1f6feb] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaQuestion className="w-8 h-8 text-[#58a6ff]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-2">Quality Answers</h3>
              <p className="text-[#c9d1d9]">
                Get verified answers from experienced developers and experts.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#a371f7] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTags className="w-8 h-8 text-[#bc8cff]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-2">Organized Topics</h3>
              <p className="text-[#c9d1d9]">
                Questions are organized by tags and categories for easy navigation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d29922] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-[#f0b72f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-2">Community</h3>
              <p className="text-[#c9d1d9]">
                Join a community of developers helping each other grow and learn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#161b22] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#f0f6fc] mb-4">
              Platform Statistics
            </h2>
            <p className="text-lg text-[#c9d1d9]">
              See how our community is growing and helping developers worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#58a6ff] mb-2">1,000+</div>
              <div className="text-[#c9d1d9]">Questions Asked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#58a6ff] mb-2">5,000+</div>
              <div className="text-[#c9d1d9]">Answers Provided</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#bc8cff] mb-2">500+</div>
              <div className="text-[#c9d1d9]">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#f0b72f] mb-2">50+</div>
              <div className="text-[#c9d1d9]">Topics Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#f0f6fc] mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[#c9d1d9] mb-8">
            Join thousands of developers who are already learning and sharing knowledge on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link 
                href="/questions/ask" 
                className="bg-[#238636] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#2ea043] transition-github"
              >
                Ask Your First Question
              </Link>
            ) : (
              <Link 
                href="/auth/signup" 
                className="bg-[#238636] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#2ea043] transition-github"
              >
                Create Account
              </Link>
            )}
            <Link 
              href="/questions" 
              className="border border-[#30363d] text-[#c9d1d9] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#21262d] transition-github"
            >
              Explore Questions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 