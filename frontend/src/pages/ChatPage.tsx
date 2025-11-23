import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar'; 
import PromptInput from '../components/PromptInput';
import ChatList from '../components/ChatList';
import type { ChatMessage } from '../components/MessageBubble';
import { v4 as uuidv4 } from 'uuid'; 
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_URL;

function ChatPage({ signOut }: { signOut?: () => void }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isTempChat, setIsTempChat] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // --- New State for History Management ---
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [fullHistory, setFullHistory] = useState<any[]>([]); 

  const navigate = useNavigate();

  const handleToggleSidebar = () => setIsSidebarExpanded(prev => !prev);
  const handleToggleTempChat = () => setIsTempChat(prev => !prev);

  const handleSignOut = async () => {
    try {
      await signOut?.(); 
      navigate("/");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  // --- Logic to Handle Sidebar Selection ---
  const handleHistoryLoaded = (rawHistory: any[]) => {
    setFullHistory(rawHistory);
  };

  const handleSelectChat = (sessionId: string) => {
    // 1. Set the active session
    setCurrentSessionId(sessionId);
    setIsSidebarExpanded(false); // Close sidebar on mobile
    
    // 2. Filter history for this session
    const sessionMessages = fullHistory.filter((item: any) => item.SessionId === sessionId);
    
    // 3. Sort chronologically
    sessionMessages.sort((a: any, b: any) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());

    // 4. Convert to UI format
    const uiMessages: ChatMessage[] = [];
    sessionMessages.forEach((item: any) => {
      uiMessages.push({ id: uuidv4(), text: item.UserMessage, sender: 'user' });
      uiMessages.push({ id: uuidv4(), text: item.AgentResponse, sender: 'ai' });
    });

    setMessages(uiMessages);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsSidebarExpanded(false);
  };

  // --- API Call ---
  const handleTestApi = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    const currentPrompt = prompt;
    setPrompt(''); 

    const userMsg: ChatMessage = { id: uuidv4(), text: currentPrompt, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || '' 
        },
        // Send the currentSessionId so backend knows to append to this chat
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          sessionId: currentSessionId 
        }),
      });

      const data = await response.json();
      const aiText = data.response || "No response";

      // If backend returned a NEW sessionId (first msg of new chat), save it
      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId);
      }

      const aiMsg: ChatMessage = { id: uuidv4(), text: aiText, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg: ChatMessage = { id: uuidv4(), text: "Error: Failed to reach server.", sender: 'ai' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* background video (put file in public/hero-bg.mp4) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover"
      >
        <source src="/chatpage-bg.mp4" type="video/mp4" />
      </video>
    <div className="h-screen bg-black text-white overflow-hidden flex">
      <Sidebar 
        expanded={isSidebarExpanded} 
        signOut={handleSignOut}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onHistoryLoaded={handleHistoryLoaded} // <-- Pass this down
      />

      {isSidebarExpanded && (
        <div onClick={handleToggleSidebar} className="fixed inset-0 bg-black/60 z-40" />
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
    </div>
  );
}

export default ChatPage;