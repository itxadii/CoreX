import React from 'react';
import { FiPlus, FiMic, FiArrowUp } from 'react-icons/fi'; 

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  onSubmit, 
  isLoading = false 
}) => {
  
  // Handles form submission on "Enter" key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        onSubmit();
      }
    }
  };

  // Handles form submission on button click
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading && prompt.trim()) {
      onSubmit();
    }
  };

  return (
    <form 
      className="w-full"
      onSubmit={handleSubmit}
    >
      {/* MAIN CHANGE: 
        - This container is now 'flex' instead of 'relative'
        - We use 'items-center' to align everything vertically
      */}
      <div className="flex w-full items-center bg-sky-200 rounded-full shadow-lg text-black">
        
        {/* Left Plus Icon (as a button) */}
        <button 
          type="button" 
          className="p-3 rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="New chat"
        >
          <FiPlus size={20} />
        </button>

        {/* Prompt Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you today?" // Placeholder from your image
          disabled={isLoading}
          className="
            flex-1 w-full py-3.5             /* flex-1 is the magic */
            bg-transparent 
            text-gray-800 placeholder:text-gray-600
            focus:outline-none
            text-sm md:text-base
          "
        />

        {/* Right Icons Container (no longer absolute) */}
        <div className="flex items-center pr-2.5">
          {/* Mic Icon */}
          <button 
            type="button" 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Use microphone"
          >
            <FiMic size={20} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="
              p-2.5 bg-gray-100 rounded-full
              text-gray-700
              hover:bg-gray-200
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ml-1
            "
            aria-label="Send prompt"
          >
            <FiArrowUp size={20} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptInput;