// Sidebar.tsx
import React from 'react';
import { 
  FiEdit,
  FiBox,
  FiSettings 
} from 'react-icons/fi';
import SidebarItem from './SidebarItem'; // This component will also change

interface SidebarProps {
  expanded: boolean; // 'expanded' now means 'visible'
}

const Sidebar: React.FC<SidebarProps> = ({ expanded }) => (
  // 1. Use 'fixed' positioning to slide over everything.
  // 2. Add 'transition-transform'
  // 3. Change 'w-20' logic to '-translate-x-full'
  <aside 
    className={`
      h-screen fixed top-0 left-0 z-20
      transition-transform duration-300 ease-in-out
      ${expanded ? 'translate-x-0' : '-translate-x-full'}
    `}
  >
    {/* 2. The nav is now ALWAYS w-64. No more conditional width. */}
    <nav 
      className="h-full flex flex-col bg-white border-r shadow-sm w-64"
    >
      <div className="p-4 pb-2 flex justify-between items-center">
        {/* 3. The "New chat" text is now ALWAYS visible */}
        <span className="font-bold text-lg">
          New chat
        </span>
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <FiEdit size={20} />
        </button>
      </div>

      <ul className="flex-1 px-3">
        {/* 4. 'expanded' prop is no longer needed for items */}
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

      <div className="border-t flex p-3">
        <SidebarItem 
          icon={<FiSettings size={20} />} 
          text="Settings & help" 
        />
      </div>
    </nav>
  </aside>
);

export default Sidebar;