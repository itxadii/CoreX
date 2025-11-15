// SidebarItem.tsx
import React from 'react';

// 1. Update the props: 'expanded' is no longer needed
interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  text, 
  active = false
}) => {
  return (
    <li className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active 
            ? "bg-gray-200 text-gray-800"
            : "hover:bg-gray-100 text-gray-600"
        }
    `}>
      {icon}
      
      {/* 2. Text label is now always visible */}
      {/* The 'overflow-hidden' and 'w-0' logic is removed */}
      <span className="w-40 ml-3">
        {text}
      </span>
      
      {/* 3. Tooltip logic is removed */}
    </li>
  );
}

export default SidebarItem;