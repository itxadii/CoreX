import React from 'react';

// 1. Add 'onClick' to the props interface
interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void; // <-- ADD THIS LINE
}

// 2. Get 'onClick' from the props
const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  text, 
  active = false,
  onClick 
}) => {
  return (
    // 3. Apply the 'onClick' handler to the <li>
    <li 
      onClick={onClick}
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active 
            ? "bg-zinc-700 text-white" // Dark mode active
            : "text-gray-300 hover:bg-zinc-800 hover:text-white" // Dark mode inactive
        }
    `}>
      {icon}
      <span className="w-40 ml-3">
        {text}
      </span>
    </li>
  );
}

export default SidebarItem;