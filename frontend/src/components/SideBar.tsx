import React from 'react';
import { FiEdit, FiBox, FiSettings } from 'react-icons/fi';
import SidebarItem from './SidebarItem'; // Make sure this file exists

interface SidebarProps {
  expanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded }) => (
  // z-50 ensures it's on top of everything (Backdrop is z-40)
  <aside 
    className={`
      h-screen fixed top-0 left-0 z-50
      transition-transform duration-300 ease-in-out
      ${expanded ? 'translate-x-0' : '-translate-x-full'}
    `}
  >
    {/* Dark mode background */}
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

      <div className="border-t border-zinc-700 flex p-3">
        <SidebarItem 
          icon={<FiSettings size={20} />} 
          text="Settings & help" 
        />
      </div>
    </nav>
  </aside>
);

export default Sidebar;