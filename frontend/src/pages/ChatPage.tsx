import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar';
import PromptInput from '../components/PromptInput';
import ChatList from '../components/ChatList';
import type { ChatMessage } from '../components/MessageBubble';
import { v4 as uuidv4 } from 'uuid';

// Vite exposes them on import.meta.env
const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID;
const DEV_API_URL = import.meta.env.VITE_API_URL;

// --- 2. VALIDATE ENV VARIABLES ---
// This prevents the app from crashing if the .env file is missing
if (!USER_POOL_ID || !USER_POOL_CLIENT_ID || !DEV_API_URL) {
  throw new Error("Missing environment variables. Please check your .env file and restart the dev server.");
}
// --- 1. CONFIGURE AMPLIFY ---
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
    }
  }
});
const API_URL = DEV_API_URL;

function App() {
  
  // --- STATE ---
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isTempChat, setIsTempChat] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // --- HANDLERS ---
  const handleToggleSidebar = () => setIsSidebarExpanded(prev => !prev);
  const handleToggleTempChat = () => setIsTempChat(prev => !prev);

  const handleTestApi = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    const currentPrompt = prompt;
    setPrompt(''); // Clear input immediately

    const userMsg: ChatMessage = {
      id: uuidv4(), // Use uuid
      text: currentPrompt,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();
      // Adjust 'data.response' if your API returns text in a different field
      const aiText = data.response || data.message || JSON.stringify(data, null, 2);

      const aiMsg: ChatMessage = {
        id: uuidv4(),
        text: aiText,
        sender: 'ai'
      };
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

  // --- RENDER ---
  return (
    // The root div is now a simple flex container
    <div className="h-screen bg-black text-white overflow-hidden flex">
      
      {/* 1. SIDEBAR - Floats on top */}
      <Sidebar expanded={isSidebarExpanded} />

      {/* 2. BACKDROP - Appears behind sidebar */}
      {isSidebarExpanded && (
        <div 
          onClick={handleToggleSidebar} // Click to close
          className="fixed inset-0 bg-black/60 z-40" // Removed lg:hidden to work on all screens
        />
      )}

      {/* 3. MAIN CONTENT - NO MARGIN-LEFT
          This div *always* takes up the full space.
      */}
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

export default App;