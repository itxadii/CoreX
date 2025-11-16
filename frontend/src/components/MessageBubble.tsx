import React from 'react';

// Define the shape of a message object
// We export this so other files can use it
export interface ChatMessage {
  id: string; // Unique ID for React's 'key' prop
  text: string;
  sender: 'user' | 'ai';
}

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Base classes for all bubbles
  const baseBubbleClasses = 'max-w-xl px-4 py-3 rounded-2xl shadow';

  // Conditional classes for styling
  const bubbleClasses = isUser
    ? 'bg-teal-200 text-black' // User's bubble
    : 'bg-green-200 text-gray-900'; // AI's bubble (like the image)

  const containerClasses = isUser
    ? 'flex justify-end' // Align user's bubble to the right
    : 'flex justify-start'; // Align AI's bubble to the left

  return (
    <div className={`w-full ${containerClasses} my-2`}>
      <div className={`${baseBubbleClasses} ${bubbleClasses}`}>
        {/* 'whitespace-pre-wrap' respects newlines, just like a <pre> tag */}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;