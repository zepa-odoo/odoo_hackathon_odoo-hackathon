'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaStrikethrough, 
  FaListUl, 
  FaListOl, 
  FaLink, 
  FaImage, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight,
  FaSmile
} from 'react-icons/fa';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
];

export default function RichTextEditor({
  value, 
  onChange,
  placeholder = "Write your content here...",
  className = ""
}: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateValue();
  };

  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(emoji);
      range.deleteContents();
      range.insertNode(textNode);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setShowEmojiPicker(false);
    updateValue();
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      document.execCommand('insertHTML', false, link);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
      updateValue();
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const img = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
      document.execCommand('insertHTML', false, img);
      setShowImageDialog(false);
      setImageUrl('');
      updateValue();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        if (data.url) {
          const img = `<img src="${data.url}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
          document.execCommand('insertHTML', false, img);
          updateValue();
        }
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    updateValue();
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Text formatting */}
        <button
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <FaBold className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <FaItalic className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('strikeThrough')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Strikethrough"
        >
          <FaStrikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bullet list"
        >
          <FaListUl className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Numbered list"
        >
          <FaListOl className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Alignment */}
        <button
          onClick={() => execCommand('justifyLeft')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align left"
        >
          <FaAlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align center"
        >
          <FaAlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Align right"
        >
          <FaAlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Links and media */}
        <button
          onClick={() => setShowLinkDialog(true)}
          className="p-2 hover:bg-gray-200 rounded"
          title="Insert link"
        >
          <FaLink className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowImageDialog(true)}
          className="p-2 hover:bg-gray-200 rounded"
          title="Insert image URL"
        >
          <FaImage className="w-4 h-4" />
        </button>
        <label className="p-2 hover:bg-gray-200 rounded cursor-pointer" title="Upload image">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <FaImage className="w-4 h-4" />
        </label>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Emoji picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-200 rounded"
            title="Insert emoji"
          >
            <FaSmile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50 w-64 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateValue}
        onPaste={handlePaste}
        onBlur={updateValue}
        className="p-4 min-h-[200px] focus:outline-none"
        style={{ minHeight: '200px' }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowImageDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={insertImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 