'use client';

import React, { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: RichTextEditorProps) {
  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <p className="mt-2 text-sm text-gray-500">
          You can use basic text formatting. Rich text editor will be added later.
        </p>
      </div>
    </div>
  );
} 