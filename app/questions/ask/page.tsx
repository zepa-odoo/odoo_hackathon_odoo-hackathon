'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUpload, FiX, FiAlertCircle } from 'react-icons/fi';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';

interface QuestionForm {
  title: string;
  shortDescription: string;
  content: string;
  tags: string[];
  images: File[];
}

export default function AskQuestionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionForm>({
    title: '',
    shortDescription: '',
    content: '',
    tags: [],
    images: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'authenticated' && !session) {
      router.push('/auth/signin?callbackUrl=/questions/ask');
    }
  }, [session, status, router]);

  const handleInputChange = (field: keyof QuestionForm, value: string | string[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        handleInputChange('tags', [...formData.tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate number of images
    if (formData.images.length + files.length > 2) {
      toast.error('Maximum 2 images allowed');
      return;
    }

    // Validate file sizes
    const validFiles = files.filter(file => {
      if (file.size > 1024 * 1024) { // 1MB
        toast.error(`${file.name} is too large. Maximum size is 1MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      handleInputChange('images', [...formData.images, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/questions/ask');
      return;
    }

    if (!formData.title || !formData.content || formData.tags.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const formDataImage = new FormData();
        formDataImage.append('image', image);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataImage,
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          imageUrls.push(url);
        }
      }

      // Create question
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          shortDescription: formData.shortDescription,
          content: formData.content,
          tags: formData.tags,
          images: imageUrls,
        }),
      });

      if (response.ok) {
        const question = await response.json();
        toast.success('Question posted successfully!');
        router.push(`/questions/${question._id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to post question');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error('An error occurred while posting your question');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-[#c9d1d9]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-[#7d8590] mb-4" />
            <h2 className="text-xl font-semibold text-[#f0f6fc] mb-2">Sign in required</h2>
            <p className="text-[#c9d1d9] mb-4">
              You need to be signed in to ask a question.
            </p>
            <Link href="/auth/signin?callbackUrl=/questions/ask" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">Ask a Question</h1>
          <p className="text-[#c9d1d9]">
            Share your knowledge and help others by asking a question.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="card">
            <label htmlFor="title" className="block text-sm font-medium text-[#c9d1d9] mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What's your question? Be specific."
              className="input"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-[#7d8590]">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Short Description */}
          <div className="card">
            <label htmlFor="shortDescription" className="block text-sm font-medium text-[#c9d1d9] mb-2">
              Short Description *
            </label>
            <textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief summary of your question (max 200 characters)"
              className="input h-20 resize-none"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-[#7d8590]">
              {formData.shortDescription.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div className="card">
            <label htmlFor="content" className="block text-sm font-medium text-[#c9d1d9] mb-2">
              Detailed Description *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Provide detailed information about your question..."
              className="min-h-48"
            />
          </div>

          {/* Tags */}
          <div className="card">
            <label htmlFor="tags" className="block text-sm font-medium text-[#c9d1d9] mb-2">
              Tags * (max 5)
            </label>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="Type tags and press Enter or comma (e.g., javascript, react)"
              className="input"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="tag flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-1 text-sm text-[#7d8590]">
              {formData.tags.length}/5 tags
            </p>
          </div>

          {/* Images */}
          <div className="card">
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
              Images (optional, max 2, 1MB each)
            </label>
            <div className="border-2 border-dashed border-[#30363d] rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FiUpload className="w-8 h-8 text-[#7d8590] mb-2" />
                <span className="text-sm text-[#c9d1d9]">
                  Click to upload images or drag and drop
                </span>
              </label>
            </div>
            
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-[#da3633] text-white rounded-full p-1 hover:bg-[#f85149] transition-github"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/questions" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 