import { useState } from 'react';

// Your API URL from the 'terraform apply' output
const API_URL = "https://cpii8b8jlj.execute-api.ap-south-1.amazonaws.com/dev";

function App() {
  const [prompt, setPrompt] = useState('Hello, what is your name?');
  const [apiResponse, setApiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles sending the test request to the API.
   */
  const handleTestApi = async () => {
    if (!prompt) {
      setApiResponse(JSON.stringify({ error: "Prompt cannot be empty." }, null, 2));
      return;
    }

    setIsLoading(true);
    setApiResponse('Loading...');

    try {
      // Send the prompt to our AWS Lambda backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body MUST match what our Python agent expects: {"prompt": "..."}
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the error from the server
        setApiResponse(JSON.stringify(data, null, 2));
      } else {
        // Show the successful response from the server
        setApiResponse(JSON.stringify(data, null, 2));
      }

    } catch (error) {
      console.error("Error fetching from API:", error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // This will show "Failed to fetch" if you have a CORS error
      setApiResponse(JSON.stringify({ error: "Fetch failed", message: errorMessage }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>CoreX API Test</h1>
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
    </div>
  );
}

export default App;