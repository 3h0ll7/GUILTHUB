import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MessageSquareIcon, CpuIcon } from './Icons';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "Sentinel AI Online. I am ready to audit your life choices. Proceed."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userText = input;
    setInput('');
    
    const userMsg: Message = { id: uuidv4(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    try {
      const modelMsgId = uuidv4();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);
      
      const result = await chatSessionRef.current.sendMessageStream({ message: userText });
      
      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m));
        }
      }
    } catch (error) {
      const errorId = uuidv4();
      setMessages(prev => [...prev, { id: errorId, role: 'model', text: "Connection disrupted. Realigning satellite..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] max-w-4xl mx-auto flex flex-col relative rounded-3xl overflow-hidden glass-panel shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-blue-900 flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <CpuIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium tracking-wide">The Sentinel</h2>
            <div className="flex items-center gap-2 text-[10px] text-neon-blue font-mono uppercase tracking-widest">
               <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse"></span>
               System Nominal
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-3xl text-sm leading-relaxed backdrop-blur-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-neon-blue/10 border border-neon-blue/20 text-blue-100 rounded-br-sm' 
                : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-none px-6 py-4 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Input query..."
            className="w-full bg-black/30 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-white focus:border-neon-blue/50 outline-none resize-none font-sans text-sm transition-all shadow-inner"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-3 p-2 rounded-xl bg-white/5 hover:bg-neon-blue hover:text-black text-gray-400 transition-all"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;