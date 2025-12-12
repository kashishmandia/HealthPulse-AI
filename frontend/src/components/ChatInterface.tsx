import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../services/api';
import { ShimmerButton } from "./ui/shimmer-button";
import { GlowCard } from "./ui/glow-card";
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm HealthPulse AI. I can analyze your vitals and symptoms to provide health insights. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.chatWithAI(userMessage.text);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: response.response, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "Connection error. Please try again.", timestamp: new Date() };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // FIX: Removed 'overflow-hidden' from here so the glowing border is not cut off
    <GlowCard 
      glowColor="purple-blue" 
      customSize={true} 
      noPadding={true}
      className="h-[600px] flex flex-col" 
    >
      
      {/* INNER WRAPPER: Handles the overflow and structure */}
      <div className="w-full h-full flex flex-col overflow-hidden rounded-[24px] bg-black/20">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 backdrop-blur-md z-10">
          <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              AI Health Assistant <Sparkles size={14} className="text-yellow-400" />
            </h3>
            <p className="text-xs text-gray-400">Powered by Gemini Pro</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' 
                    : 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none border border-blue-500/30'
                    : 'bg-white/10 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md'
                }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] block mt-2 opacity-60 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-white/10 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-3 backdrop-blur-md z-10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your symptoms, vitals, or health advice..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <ShimmerButton 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 !p-0 flex items-center justify-center rounded-xl"
              background="linear-gradient(to right, #9333ea, #4f46e5)"
              shimmerColor="#ffffff"
          >
              <Send size={18} className="text-white ml-0.5" />
          </ShimmerButton>
        </form>
      </div>
    </GlowCard>
  );
}