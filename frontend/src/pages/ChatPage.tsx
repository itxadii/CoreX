import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar'; 
import PromptInput from '../components/PromptInput';
import ChatList from '../components/ChatList';
import Particles from '../components/Particles'; 
import type { ChatMessage } from '../components/MessageBubble';
import { v4 as uuidv4 } from 'uuid'; 
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_URL;

// Helper: Convert File to Base64 (for AWS Lambda/Bedrock payload)
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the Data-URI prefix (e.g., "data:image/png;base64,")
      const result = reader.result as string;
      const base64String = result.split(',')[1]; 
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

function ChatPage({ signOut }: { signOut?: () => void }) {
  // UI State
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isTempChat, setIsTempChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // History State
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

  // --- Sidebar & History Logic ---
  const handleHistoryLoaded = (rawHistory: any[]) => {
    setFullHistory(rawHistory);
  };

  const handleSelectChat = (sessionId: string) => {
    if (isTempChat) setIsTempChat(false); // Disable temp mode if loading history

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
    setSelectedFile(null);
  };

  // --- Main API Logic ---
  const handleTestApi = async () => {
    // Prevent empty submit (must have text OR file)
    if (!prompt.trim() && !selectedFile) return;

    setIsLoading(true);
    
    // Capture values before clearing state
    const currentPrompt = prompt;
    const currentFile = selectedFile;
    
    // Clear inputs immediately
    setPrompt(''); 
    setSelectedFile(null);

    // Optimistic UI Update: Show message immediately
    const displayMsg = currentFile 
        ? `[Attached: ${currentFile.name}] ${currentPrompt}` 
        : currentPrompt;
        
    const userMsg: ChatMessage = { id: uuidv4(), text: displayMsg, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // Determine Session ID (Pass NULL if temp mode)
      const effectiveSessionId = isTempChat ? null : currentSessionId;

      // Prepare Request Body
      let requestBody: any = {
        prompt: currentPrompt,
        sessionId: effectiveSessionId,
        isTemporary: isTempChat // Flag for Backend
      };

      // Handle File Conversion
      if (currentFile) {
        const base64Data = await convertFileToBase64(currentFile);
        requestBody.file = {
          name: currentFile.name,
          type: currentFile.type,
          data: base64Data
        };
      }

      // API Call
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || '' 
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const aiText = data.response || "No response";

      // Save Session ID if new and NOT temporary
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
      
      {/* 1. BACKGROUND PARTICLES (Z-Index 0) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          refresh={false}
        />
      </div>

      {/* 2. MAIN INTERFACE (Z-Index 10) */}
      <div className="z-10 flex w-full h-full relative">
        <Sidebar 
          expanded={isSidebarExpanded} 
          signOut={handleSignOut}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onHistoryLoaded={handleHistoryLoaded}
        />

        {/* Mobile Sidebar Overlay */}
        {isSidebarExpanded && (
          <div 
            onClick={handleToggleSidebar} 
            className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          />
        )}

        {/* Chat Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Navbar 
            onToggleSidebar={handleToggleSidebar}
            isTempChat={isTempChat}
            onToggleTempChat={handleToggleTempChat} 
          />
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <ChatList messages={messages} isLoading={isLoading} />
            
            {/* Input Area (Backdrop Blur for readability over particles) */}
            <div className="w-full p-4 bg-black/80 border-t border-zinc-800 backdrop-blur-md">
              <div className="max-w-3xl mx-auto">
                <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSubmit={handleTestApi}
                  isLoading={isLoading}
                  isTempMode={isTempChat}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  onClearFile={() => setSelectedFile(null)}
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