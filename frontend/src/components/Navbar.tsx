import React from 'react';
// 1. Add FiZap to your imports
import { FiMenu, FiZap } from 'react-icons/fi';
import corexLogo from '../assets/corex.png';

interface NavbarProps {
  isTempChat: boolean;
  onToggleTempChat: () => void;
  onToggleSidebar: () => void;
}

// 2. The TempChatButton sub-component is no longer needed.

const Navbar: React.FC<NavbarProps> = ({ 
  isTempChat, 
  onToggleTempChat, 
  onToggleSidebar 
}) => {
  return (
    <nav className="bg-black shadow-md w-full sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Group: Toggle + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
              aria-label="Toggle sidebar"
            >
              <FiMenu size={24} />
            </button>
            
            <a href="/" className="flex-shrink-0 flex items-center">
              <img src={corexLogo} alt="CoreX Logo" className="w-25 h-11 rounded-xl" />
            </a>
          </div>

          {/* Right Group: Temp Chat Icon Button */}
          <div className="flex items-center">
            {/* 3. Replaced the button with this icon button */}
            <button
              onClick={onToggleTempChat}
              className={`
                p-2 rounded-lg focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500
                transition-colors
              `}
              aria-label="Toggle temporary chat"
            >
              <FiZap 
                size={22}
                className={
                  isTempChat 
                    ? "text-red-500" // ON state
                    : "text-gray-400 hover:text-white" // OFF state
                } 
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;