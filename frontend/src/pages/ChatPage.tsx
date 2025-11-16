import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar'; // Fixed casing to standard 'Sidebar'
import PromptInput from '../components/PromptInput';
import ChatList from '../components/ChatList';
import type { ChatMessage } from '../components/MessageBubble';

// --- 1. CONFIGURE AMPLIFY ---
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_0kTTQtmWq",
      userPoolClientId: "16pcm64ma6l1j6ga9htr40dibf",
    }
  }
});

const API_URL = "https://cpii8b8jlj.execute-api.ap-south-1.amazonaws.com/dev";

function App() {
  
  // --- STATE ---
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isTempChat, setIsTempChat] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Changed: Store a list of messages instead of one string
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // --- HANDLERS ---
  const handleToggleSidebar = () => setIsSidebarExpanded(prev => !prev);
  const handleToggleTempChat = () => setIsTempChat(prev => !prev);

  const handleTestApi = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    const currentPrompt = prompt;
    setPrompt(''); // Clear input immediately

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), // Native browser UUID
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
      
      // Determine the text to show. 
      // Adjust 'data.response' if your API returns the text in a different field.
      const aiText = data.response || data.message || JSON.stringify(data, null, 2);

      // 2. Add AI Message
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: aiText,
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
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
    <div className="relative h-screen bg-black text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar expanded={isSidebarExpanded} />

      {/* MAIN LAYOUT */}
      <div className={`
          flex flex-col h-full 
          transition-all duration-300 ease-in-out
          ${isSidebarExpanded ? 'ml-64' : 'ml-0'}
      `}>
        
        {/* NAVBAR */}
        <Navbar 
          onToggleSidebar={handleToggleSidebar}
          isTempChat={isTempChat}
          onToggleTempChat={handleToggleTempChat}
        />

        {/* CHAT CONTENT - Takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* 1. Scrollable Chat List */}
          <ChatList messages={messages} isLoading={isLoading} />

          {/* 2. Input Area (Fixed at bottom) */}
          <div className="relative w-full p-4 bg-black/90 border-t border-zinc-800 backdrop-blur-sm">
            <div className="relative max-w-3xl mx-auto">
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