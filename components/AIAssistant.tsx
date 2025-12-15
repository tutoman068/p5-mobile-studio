import React, { useState } from 'react';
import { generateP5Code } from '../services/geminiService';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const newCode = await generateP5Code(prompt, currentCode);
      onCodeGenerated(newCode);
      setPrompt('');
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#2D2D2D] w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-[#2D2D2D]">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles size={20} />
            <h2 className="font-bold text-white">AI Creative Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-gray-300 text-sm mb-4">
            Describe what you want to create or how you want to change your sketch.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Draw a grid of rotating colorful squares' or 'Make the ball bounce faster'"
                className="w-full h-32 bg-[#1e1e1e] text-white p-3 rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-base"
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
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/20'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Code...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Generate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;