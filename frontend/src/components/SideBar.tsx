import React, { useEffect, useState } from 'react';
import { FiEdit, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import SidebarItem from './SidebarItem';
import { fetchAuthSession } from 'aws-amplify/auth'; 

// --- Configuration ---
// Replace this with your actual API Gateway Invoke URL
const API_URL = import.meta.env.VITE_API_URL; 

// --- Types ---
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
  // New prop to tell the parent component which chat was clicked
  onSelectChat?: (sessionId: string) => void; 
  onNewChat?: () => void;
}

interface GroupedSession {
  sessionId: string;
  title: string;
  lastActive: string;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, signOut, onSelectChat, onNewChat }) => {
  const [history, setHistory] = useState<GroupedSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch History on Mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 1. Get the ID Token from Cognito
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          console.error("No auth token found");
          return;
        }

        // 2. Call API Gateway
        const response = await fetch(`${API_URL}/`, { // Ensure URL ends with correct resource path if needed
          method: 'GET',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error("Failed to fetch chats");

        const data = await response.json();
        const rawMessages: ChatMessage[] = data.history || [];

        // 3. Group raw messages by SessionId on the client side
        // (Since DynamoDB returns every single message line)
        const sessionsMap = new Map<string, GroupedSession>();

        rawMessages.forEach((msg) => {
          if (!sessionsMap.has(msg.SessionId)) {
            sessionsMap.set(msg.SessionId, {
              sessionId: msg.SessionId,
              // Use the first user message as the "Title"
              title: msg.UserMessage.length > 30 ? msg.UserMessage.substring(0, 30) + '...' : msg.UserMessage,
              lastActive: msg.Timestamp
            });
          }
        });

        // Convert Map to Array and Sort by Date (Newest first)
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
  }, [expanded]); // Reload when sidebar opens (or you could run this once on mount)

  return (
    <aside 
      className={`
        h-screen fixed top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${expanded ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <nav className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800 w-64">
        
        {/* Header / New Chat */}
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

        {/* Chat List */}
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

        {/* Footer */}
        <div className="border-t border-zinc-700 flex flex-col p-3 bg-zinc-900">
          <SidebarItem 
            icon={<FiSettings size={20} />} 
            text="Settings" 
          />
          
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
};

export default Sidebar;