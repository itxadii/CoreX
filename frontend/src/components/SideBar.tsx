import React, { useEffect, useState } from 'react';
import { FiEdit, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import SidebarItem from './SidebarItem';
import { fetchAuthSession } from 'aws-amplify/auth'; 

const API_URL = import.meta.env.VITE_API_URL; 

interface ChatMessage {
  UserId: string;
  SessionId: string;
  Timestamp: string;
  UserMessage: string;
  AgentResponse: string;
}

interface SidebarProps {
  expanded: boolean;
  signOut?: () => void;
  onSelectChat?: (sessionId: string) => void; 
  onNewChat?: () => void;
  // Callback to give raw data to parent
  onHistoryLoaded?: (history: any[]) => void; 
}

interface GroupedSession {
  sessionId: string;
  title: string;
  lastActive: string;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, signOut, onSelectChat, onNewChat, onHistoryLoaded }) => {
  const [history, setHistory] = useState<GroupedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) return;

        const response = await fetch(`${API_URL}/`, {
          method: 'GET',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error("Failed to fetch chats");

        const data = await response.json();
        const rawMessages: ChatMessage[] = data.history || [];

        // --- Pass raw data up to parent ---
        if (onHistoryLoaded) {
          onHistoryLoaded(rawMessages);
        }

        // --- Group by SessionId ---
        const sessionsMap = new Map<string, GroupedSession>();

        rawMessages.forEach((msg) => {
          // Only add if we haven't seen this session OR if this message is OLDER than what we have (to find the first user msg)
          // Actually, let's just grab the first time we see the session ID for simplicity, assuming sorted or just use first user msg.
          if (!sessionsMap.has(msg.SessionId)) {
             sessionsMap.set(msg.SessionId, {
               sessionId: msg.SessionId,
               title: msg.UserMessage.length > 25 ? msg.UserMessage.substring(0, 25) + '...' : msg.UserMessage,
               lastActive: msg.Timestamp
             });
          }
        });

        const sortedSessions = Array.from(sessionsMap.values()).sort((a, b) => 
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );

        setHistory(sortedSessions);

      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (expanded) {
      loadHistory();
    }
  }, [expanded]); 

  return (
    <aside 
      className={`
        h-screen fixed top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${expanded ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <nav className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800 w-64">
        
        <div className="p-4 pb-2 flex justify-between items-center text-white">
          <span className="font-bold text-lg">Chats</span>
          <button 
            onClick={onNewChat}
            className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"
            title="New Chat"
          >
            <FiEdit size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-zinc-700">
          {loading ? (
            <div className="text-zinc-500 text-sm text-center mt-4">Loading...</div>
          ) : (
            <ul className="space-y-1 mt-2">
              {history.length === 0 && (
                <li className="text-zinc-600 text-sm px-2">No chat history found.</li>
              )}
              
              {history.map((session) => (
                <SidebarItem 
                  key={session.sessionId}
                  icon={<FiMessageSquare size={18} />} 
                  text={session.title}
                  onClick={() => onSelectChat && onSelectChat(session.sessionId)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-zinc-700 flex flex-col p-3 bg-zinc-900">
          <SidebarItem icon={<FiSettings size={20} />} text="Settings" />
          {signOut && (
            <SidebarItem icon={<FiLogOut size={20} />} text="Sign Out" onClick={signOut} />
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;