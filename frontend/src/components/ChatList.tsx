import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from './MessageBubble'; // Import the type we just made'
import ResponseLoader from './ResponseLoader'

interface ChatListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    // This is the full-height, scrollable container
    <div className="flex-1 w-full overflow-y-auto p-4 md:p-6">

      {/* THIS IS THE FIX:
        This new div wraps all your chat content.
        - 'max-w-3xl': Sets a max width (same as your prompt box).
        - 'mx-auto':   Centers the content (margin left/right auto).
        - 'space-y-4': Applies spacing between chat bubbles.
      */}
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Render all messages */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* 2. Show the Loader component when loading */}
        {isLoading && <ResponseLoader />}
        
        {/* Invisible element to scroll to */}
        <div ref={bottomRef} />

      </div> {/* End of the new wrapper div */}
    </div>
  );
};

export default ChatList;