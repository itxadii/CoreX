import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar.tsx';

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

// --- 2. COMBINE ALL LOGIC INTO THE 'App' COMPONENT ---
function App() {
  
  // --- ALL STATE LIVES HERE ---
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isTempChat, setIsTempChat] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- ALL HANDLERS LIVE HERE ---
  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const handleToggleTempChat = () => {
    setIsTempChat((prev) => !prev);
    console.log("Temp chat is now:", !isTempChat);
  };

  const handleTestApi = async () => {
    if (!prompt) {
      setApiResponse(JSON.stringify({ error: "Prompt cannot be empty." }, null, 2));
      return;
    }
    setIsLoading(true);
    setApiResponse('Loading...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));

    } catch (error) {
      console.error("Error fetching from API:", error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setApiResponse(JSON.stringify({ error: "Fetch failed", message: errorMessage }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. USE THE CORRECT JSX LAYOUT ---
  return (
    // 1. This outer div is now 'relative' to position the sidebar
    <div className="relative h-screen bg-black">
      
      {/* 1. SIDEBAR */}
      {/* It's rendered the same, but its internal CSS will change */}
      <Sidebar 
        expanded={isSidebarExpanded} 
      />

      {/* 2. MAIN CONTENT AREA (Navbar + Page) */}
      {/*
        This div now gets a conditional 'margin-left'
        It also needs 'transition-all' to animate the margin change
      */}
      <div className={`
          flex flex-col h-screen overflow-hidden
          transition-all duration-300 ease-in-out
          ${isSidebarExpanded ? 'ml-64' : 'ml-0'}
      `}>
        
        {/* 3. NAVBAR */}
        <Navbar 
          onToggleSidebar={handleToggleSidebar}
          isTempChat={isTempChat}
          onToggleTempChat={handleToggleTempChat}
        />
        {/* 4. PAGE CONTENT (with its own scrollbar) */}
        <main className="flex-1 overflow-y-auto p-4 font-mono">
          <h1 className="text-3xl font-bold">CoreX API Test</h1>
          <p>Enter a prompt and see the raw JSON response from your API.</p>
          
          <div className="input-group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your test prompt..."
              disabled={isLoading}
            />
            <button onClick={handleTestApi} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test API'}
            </button>
          </div>

          <label>Raw API Response:</label>
          <pre className="response-box">
            {apiResponse}
          </pre>
        </main>
      </div>
    </div>
  );
}

export default App;