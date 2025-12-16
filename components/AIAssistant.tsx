
import React, { useState } from 'react';
import { generateP5Code } from '../services/geminiService';
import { Sparkles, X, Send, Loader2, History, MessageSquare, ChevronRight } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  currentCode: string;
  onCodeGenerated: (code: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentCode, onCodeGenerated, isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  
  // Ideally this would be persisted in App.tsx or localStorage, but for now local state
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Add user message to history
    const userMsg: ChatMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    setHistory(prev => [userMsg, ...prev]);

    try {
      const newCode = await generateP5Code(prompt, currentCode);
      
      // Add assistant response
      const aiMsg: ChatMessage = { role: 'assistant', content: 'Code generated successfully.', code: newCode, timestamp: Date.now() };
      setHistory(prev => [aiMsg, ...prev]);
      
      onCodeGenerated(newCode);
      setPrompt('');
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (code: string) => {
    onCodeGenerated(code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#2D2D2D] w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-[#2D2D2D]">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles size={20} />
            <h2 className="font-bold text-white">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'generate' ? 'text-white border-b-2 border-purple-500 bg-purple-500/10' : 'text-gray-400'}`}
          >
            <Sparkles size={14} /> Generate
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'history' ? 'text-white border-b-2 border-purple-500 bg-purple-500/10' : 'text-gray-400'}`}
          >
            <History size={14} /> History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {activeTab === 'generate' ? (
            <div className="h-full flex flex-col">
               <p className="text-gray-300 text-sm mb-4">
                Describe what you want to create or how you want to change your sketch.
              </p>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
                <div className="relative flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Draw a grid of rotating colorful squares' or 'Make the ball bounce faster'"
                    className="w-full h-full bg-[#1e1e1e] text-white p-3 rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-base"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shrink-0 ${
                    isLoading 
                      ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Generate Code
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No history yet.</div>
              ) : (
                history.map((msg, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    {msg.role === 'user' ? (
                      <div className="bg-[#1e1e1e] p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <MessageSquare size={12} /> You
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 text-xs text-purple-300 mb-2">
                          <Sparkles size={12} /> Assistant
                        </div>
                        {msg.code && (
                           <button 
                             onClick={() => loadFromHistory(msg.code!)}
                             className="w-full text-left text-xs bg-black/40 p-2 rounded font-mono text-green-400 hover:bg-black/60 transition-colors flex items-center justify-between group"
                           >
                             <span>Load generated code...</span>
                             <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                           </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
