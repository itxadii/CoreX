import React, { useRef } from 'react';
import { FiMic, FiArrowUp, FiPaperclip, FiX, FiFile, FiImage } from 'react-icons/fi'; 

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isTempMode?: boolean;
  // File Handling Props
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  onSubmit, 
  isLoading = false,
  isTempMode = false,
  selectedFile,
  onFileSelect,
  onClearFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Enter key: Submit if there is text OR a file selected
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (prompt.trim() || selectedFile)) {
        onSubmit();
      }
    }
  };

  // Handle Submit button click
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading && (prompt.trim() || selectedFile)) {
      onSubmit();
    }
  };

  // Handle File Selection from hidden input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit file size to 4MB (AWS Lambda payload limit is 6MB total)
      if (file.size > 4 * 1024 * 1024) {
        alert("File too large. Please upload files under 4MB.");
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <form className="w-full relative" onSubmit={handleSubmit}>
      
      {/* 1. File Preview Pill - Shows above input when file is selected */}
      {selectedFile && (
        <div className="absolute -top-12 left-4 flex items-center bg-zinc-800 text-white px-3 py-1.5 rounded-lg border border-zinc-700 shadow-md animate-fade-in-up z-20">
          <span className="mr-2 text-sky-400">
            {selectedFile.type.startsWith('image') ? <FiImage size={16} /> : <FiFile size={16} />}
          </span>
          <span className="text-xs max-w-[150px] truncate">{selectedFile.name}</span>
          <button 
            type="button" 
            onClick={() => {
              onClearFile();
              // Reset file input value so same file can be selected again if needed
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="ml-3 text-gray-400 hover:text-white"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* 2. Main Input Container */}
      <div className={`
        flex w-full items-center rounded-3xl shadow-lg transition-all duration-300
        ${isTempMode 
          ? "bg-zinc-200 border-2 border-dashed border-zinc-400 text-gray-600" // Temp Mode Style
          : "bg-sky-200 text-black border-2 border-transparent" // Normal Style
        }
      `}>
        
        {/* Hidden File Input Element */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp, application/pdf"
          className="hidden"
        />

        {/* Paperclip / Attachment Button */}
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 pl-4 rounded-l-3xl hover:bg-black/5 transition-colors"
          aria-label="Attach file"
          disabled={isLoading}
        >
          <FiPaperclip size={20} className={isTempMode ? "text-gray-500" : "text-gray-700"} />
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isTempMode ? "Temporary Chat enabled..." : "Ask a question or upload a doc..."}
          disabled={isLoading}
          className={`
            flex-1 w-full py-3.5 px-2
            bg-transparent 
            focus:outline-none
            text-sm md:text-base
            ${isTempMode ? "placeholder:text-gray-500 text-gray-700" : "placeholder:text-gray-600 text-gray-800"}
          `}
        />

        {/* Right Side Icons */}
        <div className="flex items-center pr-2.5">
          {/* Mic Button */}
          <button 
            type="button" 
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <FiMic size={20} className={isTempMode ? "text-gray-500" : "text-gray-700"} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !selectedFile)}
            className={`
              p-2.5 rounded-full
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ml-1 transition-colors
              ${isTempMode 
                ? "bg-zinc-400 text-white hover:bg-zinc-500" 
                : "bg-gray-100 text-gray-700 hover:bg-white" 
              }
            `}
          >
            <FiArrowUp size={20} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptInput;