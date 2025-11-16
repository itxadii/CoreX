import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Plugin to enable GitHub Flavored Markdown (for tables)

// This interface defines the shape of a message object
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-6`}>
      {/*
        THIS IS THE FIX:
        All 'prose' classes are now on this parent <div>,
        which fixes the TypeScript error.
      */}
      <div 
        className={`
          max-w-[85%] px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm overflow-hidden
          ${isUser 
            ? 'bg-zinc-800 text-white rounded-br-sm' // User Style
            : 'bg-zinc-900 text-gray-100 rounded-bl-sm border border-zinc-700' // AI Style
          }

          /* --- All the 'prose' classes moved here --- */
          prose prose-invert prose-sm max-w-none

          /* Table Styles (for dark mode) */
          prose-table:border-collapse prose-table:border prose-table:border-zinc-600
          prose-th:bg-zinc-900 prose-th:p-2 prose-th:border prose-th:border-zinc-600
          prose-td:p-2 prose-td:border prose-td:border-zinc-600
          
          /* Heading Styles */
          prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-white
          
          /* List Styles */
          prose-ul:my-2 prose-li:my-0
          
          /* Remove extra margins from the first/last elements to fit the bubble */
          prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0
        `}
      >
        {/*
          Now the <ReactMarkdown> component is clean and
          only contains the props it actually accepts.
        */}
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;