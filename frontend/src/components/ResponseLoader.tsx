import React from 'react';

const ResponseLoader: React.FC = () => {
  return (
    <div className="flex justify-start w-full my-2">
      <div className="bg-zinc-800 px-4 py-4 rounded-2xl rounded-bl-sm border border-zinc-700 flex items-center space-x-1.5">
        {/* Dot 1 */}
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} 
        />
        {/* Dot 2 */}
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} 
        />
        {/* Dot 3 */}
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} 
        />
      </div>
    </div>
  );
};

export default ResponseLoader;