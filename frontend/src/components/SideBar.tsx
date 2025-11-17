import React from 'react';
// 1. Import the FiLogOut icon
import { FiEdit, FiBox, FiSettings, FiLogOut } from 'react-icons/fi';
import SidebarItem from './SidebarItem'; // Make sure this file exists

// 2. Add signOut to the props interface
interface SidebarProps {
  expanded: boolean;
  signOut?: () => void; // Make it optional
}

// 3. Get 'signOut' from the props
const Sidebar: React.FC<SidebarProps> = ({ expanded, signOut }) => (
  <aside 
    className={`
      h-screen fixed top-0 left-0 z-50
      transition-transform duration-300 ease-in-out
      ${expanded ? 'translate-x-0' : '-translate-x-full'}
    `}
  >
    <nav 
      className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800 w-64"
    >
      <div className="p-4 pb-2 flex justify-between items-center text-white">
        <span className="font-bold text-lg">
          New chat
        </span>
        <button className="p-2 rounded-lg hover:bg-zinc-700">
          <FiEdit size={20} />
        </button>
      </div>

      <ul className="flex-1 px-3">
        {/* Your chat history items */}
        <SidebarItem 
          icon={<FiBox size={20} />} 
          text="Chat History 1" 
          active
        />
        <SidebarItem 
          icon={<FiBox size={20} />} 
          text="Chat History 2" 
        />
        <SidebarItem 
          icon={<FiBox size={20} />} 
          text="Chat History 3" 
        />
      </ul>

      {/* 4. Update the footer to be flex-col to stack items */}
      <div className="border-t border-zinc-700 flex flex-col p-3">
        <SidebarItem 
          icon={<FiSettings size={20} />} 
          text="Settings & help" 
        />
        
        {/* 5. Add the new Sign Out item */}
        {/* This will now show because the 'signOut' prop is being passed */}
        {signOut && (
          <SidebarItem 
            icon={<FiLogOut size={20} />} 
            text="Sign Out"
            onClick={signOut}
          />
        )}
      </div>
    </nav>
  </aside>
);

export default Sidebar;