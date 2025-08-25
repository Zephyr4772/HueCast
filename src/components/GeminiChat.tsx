import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Bot, User, AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id: string;
}

interface TypingIndicatorProps {
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-900">
        <div className="flex items-center space-x-2">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">Assistant is typing</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [model, setModel] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize Gemini with enhanced error handling
  useEffect(() => {
    const initModel = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          setInitError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
          console.error('Gemini API key is not configured');
          return;
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        });
        setModel(model);
        console.log('Gemini model initialized successfully');
      } catch (error) {
        console.error('Error initializing Gemini model:', error);
        setInitError('Failed to initialize AI chat. Please check your connection and try again.');
      }
    };

    initModel();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Add welcome message on component mount
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant specialized in air quality information. Ask me about AQI levels, health recommendations, or any air quality concerns you might have.',
      timestamp: Date.now(),
      id: 'welcome-' + Date.now()
    }]);
  }, []);

  const generateMessageId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !model) {
      console.log('Submit prevented:', { hasInput: !!input.trim(), isLoading, hasModel: !!model });
      return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content: input.trim(),
      timestamp: Date.now(),
      id: generateMessageId()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    console.log('Sending message to Gemini:', { input: userMessage.content, model: !!model });

    try {
      const prompt = `You are an expert Air Quality Assistant. Your responses should be:
      1. Accurate and scientifically sound
      2. Easy to understand for general audience  
      3. Actionable when appropriate
      4. Concise but comprehensive (3-5 sentences max)
      5. Include health implications when relevant
      
      Current context: Air Quality Index (AQI) discussion
      User question: ${userMessage.content}
      
      Please provide a helpful response:`;

      console.log('Sending prompt to Gemini');
      
      const result = await model.generateContent(prompt);
      console.log('Received result from Gemini');
      
      const response = await result.response;
      const responseText = await response.text();
      console.log('Response text received:', responseText.substring(0, 100) + '...');
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        id: generateMessageId()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error details:', { error, errorMessage });
      
      const errorResponse: Message = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or rephrase your question.`,
        timestamp: Date.now(),
        id: generateMessageId()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setInitError(null);
    window.location.reload();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (initError) {
    return (
      <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm">
        <div className="p-4 border-b bg-red-50">
          <h3 className="font-medium text-red-900 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>AI Chat Error</span>
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-700 mb-4">{initError}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`flex flex-col border rounded-lg bg-white shadow-sm transition-all duration-300 ${
        isExpanded ? 'h-96' : 'h-full'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 0 }}
              className="p-2 bg-blue-100 rounded-lg"
            >
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </motion.div>
            <div>
              <h3 className="font-medium text-gray-900">AI Air Quality Assistant</h3>
              <p className="text-sm text-gray-500">
                {model ? 'Ready to help' : 'Initializing...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 1 && (
              <span className="text-xs text-gray-400">{messages.length - 1} messages</span>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-gray-400"
            >
              ▼
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {msg.role === 'assistant' && (
                          <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        {msg.role === 'user' && (
                          <User className="h-4 w-4 text-blue-100 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 opacity-75 ${
                            msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <TypingIndicator isVisible={isLoading} />
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about air quality, health effects, or AQI levels..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isLoading || !model}
                  maxLength={500}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim() || !model}
                  className={`p-3 rounded-lg transition-colors flex items-center space-x-2 ${
                    isLoading || !input.trim() || !model
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  whileHover={{ scale: isLoading || !input.trim() || !model ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading || !input.trim() || !model ? 1 : 0.95 }}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {input.length}/500 characters • Press Enter to send
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GeminiChat;
