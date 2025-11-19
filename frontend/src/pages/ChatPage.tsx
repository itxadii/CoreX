import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar'; 
import PromptInput from '../components/PromptInput';
import ChatList from '../components/ChatList';
import type { ChatMessage } from '../components/MessageBubble';
import { v4 as uuidv4 } from 'uuid'; 
import { useNavigate } from "react-router-dom";


// --- Access ENV Variables ---
const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

// This check should ideally be in main.tsx, but here is fine too.
if (!USER_POOL_ID || !USER_POOL_CLIENT_ID || !API_URL) {
  throw new Error("Missing environment variables. Please check your .env file");
}

// --- 1. THIS IS YOUR CHAT PAGE COMPONENT ---
// It now accepts a 'signOut' function as a prop.
function ChatPage({ signOut }: { signOut?: () => void }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isTempChat, setIsTempChat] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const navigate = useNavigate();

  const handleToggleSidebar = () => setIsSidebarExpanded(prev => !prev);
  const handleToggleTempChat = () => setIsTempChat(prev => !prev);
  const handleSignOut = async () => {
    try {
      await signOut?.();     // Cognito logout
      navigate("/");         // Go to LandingPage
    } catch (err) {
      console.error("Signout error:", err);
    }
  };
  const handleTestApi = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    const currentPrompt = prompt;
    setPrompt(''); 

    const userMsg: ChatMessage = { id: uuidv4(), text: currentPrompt, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();
      const aiText = data.response || data.message || JSON.stringify(data, null, 2);

      const aiMsg: ChatMessage = { id: uuidv4(), text: aiText, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        text: "Error: Failed to reach the server.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex">
      <Sidebar expanded={isSidebarExpanded} signOut={handleSignOut} />

      {isSidebarExpanded && (
        <div 
          onClick={handleToggleSidebar} 
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar 
          onToggleSidebar={handleToggleSidebar}
          isTempChat={isTempChat}
          onToggleTempChat={handleToggleTempChat} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ChatList messages={messages} isLoading={isLoading} />
          <div className="w-full p-4 bg-black/90 border-t border-zinc-800 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleTestApi}
                isLoading={isLoading}
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                CoreX can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;