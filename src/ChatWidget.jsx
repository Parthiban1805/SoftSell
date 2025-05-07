import { useState, useEffect, useRef } from 'react';
import { 
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

// The API key would typically be stored securely in environment variables
// For demo purposes, it's included here but should be properly secured in production
const LLAMA_API_KEY = "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";
const LLAMA_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Default welcome message from the chatbot
const WELCOME_MESSAGE = "Hi there! How can I help you with selling your software licenses today?";

// System prompt to instruct the model to only answer questions about the SoftSell website
const SYSTEM_PROMPT = `
You are a helpful assistant for SoftSell, a company that helps businesses sell their unused software licenses.
Only answer questions related to SoftSell's services, software license selling process, and general inquiries about the website.
If asked about topics unrelated to SoftSell or software license selling, politely redirect the conversation back to how you can help with software license selling.
Key information about SoftSell:
- SoftSell helps companies sell unused software licenses securely and easily
- The process involves uploading license information, getting a valuation, and receiving payment
- Payment is processed within 2 business days via bank transfer, PayPal, or crypto
- SoftSell accepts enterprise software licenses, design tools, development environments, CRM solutions, and most major business applications
- All transactions are secure with bank-level encryption
- SoftSell offers 24/7 customer support
`;

export function ChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: WELCOME_MESSAGE }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Function to query the Llama API
  const queryLlamaAPI = async (userMessage) => {
    setIsLoading(true);
    
    try {
      // Create the conversation history in the format expected by the API
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: "user", content: userMessage }
      ];
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLAMA_API_KEY}`
        },
        body: JSON.stringify({
          model: LLAMA_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error querying Llama API:', error);
      return "I'm having trouble connecting to our system right now. Please try again later or contact us at hello@softsell.com for assistance.";
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat interactions
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');
    
    // Get response from Llama API
    const botResponse = await queryLlamaAPI(userMessage);
    
    // Add bot response
    setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col ${isChatOpen ? 'h-96' : 'h-auto'} transition-all duration-300`}>
      {isChatOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 md:w-96 overflow-hidden flex flex-col">
          <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 flex justify-between items-center">
            <h4 className="font-medium">SoftSell Support</h4>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 p-1 rounded"
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="border-t border-gray-200 dark:border-gray-700 p-2 flex">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask us anything..."
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-l-lg focus:outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit"
              className={`${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-2 rounded-r-lg`}
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      )}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg ml-auto flex items-center justify-center"
          aria-label="Open chat"
        >
          <FaComments size={20} />
        </button>
      )}
    </div>
  );
}