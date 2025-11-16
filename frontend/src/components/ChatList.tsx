import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from './MessageBubble'; // Import the type we just made'
import ResponseLoader from './ResponseLoader'

interface ChatListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    // This div handles the scrolling
    <div className="flex-1 w-full overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {/* Show a 'Typing...' bubble while loading */}
      {isLoading && (
        <div className="flex justify-start">
          <ResponseLoader />
        </div>
      )}
      
      {/* This empty div is the anchor for auto-scrolling */}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatList;