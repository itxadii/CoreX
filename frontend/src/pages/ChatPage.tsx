import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar'; 
import PromptInput from '../components/PromptInput';
import ChatList from '../components/ChatList';
import Particles from '../components/Particles'; // Make sure to import this
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
  
  // --- History Management ---
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
    // If we switch chats, turn off temp mode
    if (isTempChat) setIsTempChat(false); 

    setCurrentSessionId(sessionId);
    setIsSidebarExpanded(false);
    
    const sessionMessages = fullHistory.filter((item: any) => item.SessionId === sessionId);
    
    // Sort chronologically
    sessionMessages.sort((a: any, b: any) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());

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
    // We keep isTempChat state as is, or you can reset it: setIsTempChat(false);
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

      // LOGIC ADJUSTMENT: If isTempChat is true, do not send the sessionId
      // This forces the backend to treat it as a one-off or new session without linking history
      const effectiveSessionId = isTempChat ? null : currentSessionId;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || '' 
        },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          sessionId: effectiveSessionId 
        }),
      });

      const data = await response.json();
      const aiText = data.response || "No response";

      // LOGIC ADJUSTMENT: Only save the session ID if we are NOT in temp mode
      if (!isTempChat && !currentSessionId && data.sessionId) {
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
    <div className="relative h-screen w-full bg-black text-white overflow-hidden flex">
      
      {/* 1. BACKGROUND LAYER (Particles) */}
      {/* Absolute position, negative z-index to sit behind text, but inside the container */}
      <div className="absolute inset-0 z-0">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          refresh={false}
        />
      </div>

      {/* 2. INTERFACE LAYER (Sidebar + Chat) */}
      {/* z-10 ensures this sits ON TOP of the particles */}
      <div className="z-10 flex w-full h-full relative">
        
        <Sidebar 
          expanded={isSidebarExpanded} 
          signOut={handleSignOut}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onHistoryLoaded={handleHistoryLoaded}
        />

        {/* Mobile Overlay for Sidebar */}
        {isSidebarExpanded && (
          <div 
            onClick={handleToggleSidebar} 
            className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          />
        )}

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Navbar 
            onToggleSidebar={handleToggleSidebar}
            isTempChat={isTempChat}
            onToggleTempChat={handleToggleTempChat} 
          />
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <ChatList messages={messages} isLoading={isLoading} />
            
            {/* Input Area - Added backdrop blur to make text readable over particles */}
            <div className="w-full p-4 bg-black/80 border-t border-zinc-800 backdrop-blur-md">
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