import React, { useState, useEffect, useCallback, useRef } from 'react';
import CodeEditor from './components/Editor';
import { generateP5HTML } from './utils/p5Template';
import { ConsoleLog, Tab } from './types';
import Console from './components/Console';
import AIAssistant from './components/AIAssistant';
import { Play, Square, Code as CodeIcon, Eye, Terminal, Sparkles, Share2 } from 'lucide-react';

const DEFAULT_CODE = `function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
  noStroke();
}

function draw() {
  let x = mouseX;
  let y = mouseY;
  let ix = width - mouseX;  // Inverse X
  let iy = height - mouseY; // Inverse Y
  
  background(20, 10); // Fade effect
  
  fill(255, 150);
  circle(x, height/2, y/2 + 10);
  
  fill(0, 159, 255, 150);
  circle(ix, height/2, iy/2 + 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(20);
}`;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.EDITOR);
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [unreadLogs, setUnreadLogs] = useState<boolean>(false);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { source, type, message } = event.data;
      if (source !== 'p5-runner') return;

      const newLog: ConsoleLog = {
        id: Math.random().toString(36).substr(2, 9),
        type: type as 'log' | 'error' | 'warn',
        message: message,
        timestamp: Date.now()
      };

      setLogs(prev => [...prev, newLog]);
      if (!isConsoleOpen) {
        setUnreadLogs(true);
      }
      
      // Auto open console on error
      if (type === 'error') {
        setIsConsoleOpen(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isConsoleOpen]);

  const runSketch = useCallback(() => {
    setLogs([]); // Clear logs on run
    setUnreadLogs(false);
    const html = generateP5HTML(code);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);
    setIsRunning(true);
    setActiveTab(Tab.PREVIEW);
  }, [code]);

  const stopSketch = useCallback(() => {
    setIsRunning(false);
    setIframeSrc(''); // Unload iframe
    setActiveTab(Tab.EDITOR);
  }, []);

  const handleAIResult = (newCode: string) => {
    setCode(newCode);
    setActiveTab(Tab.EDITOR);
    // Optionally run immediately? Let's let user decide.
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#18181b] overflow-hidden text-white relative">
      {/* Header / Top Bar */}
      <header className="h-14 bg-[#2D2D2D] border-b border-[#3D3D3D] flex items-center justify-between px-4 shrink-0 z-10 select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ED225D] flex items-center justify-center rounded-lg font-bold text-white shadow-lg shadow-pink-900/50">
            p5
          </div>
          <span className="font-bold text-lg hidden sm:block">Mobile Studio</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-800/50 transition-all active:scale-95"
          >
            <Sparkles size={14} />
            <span>AI Assist</span>
          </button>
          
          <button
            onClick={isRunning ? stopSketch : runSketch}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isRunning 
                ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-[#ED225D] text-white hover:bg-[#c91d4e] shadow-pink-900/50'
            }`}
          >
            {isRunning ? (
              <>
                <Square size={14} fill="currentColor" />
                Stop
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Run
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden w-full">
        {/* Editor Tab */}
        <div className={`absolute inset-0 transition-transform duration-300 transform w-full h-full ${activeTab === Tab.EDITOR ? 'translate-x-0' : '-translate-x-full'}`}>
          <CodeEditor code={code} onChange={setCode} />
        </div>

        {/* Preview Tab - Added touch-action-none to prevent gestures on the container */}
        <div className={`absolute inset-0 bg-[#18181b] transition-transform duration-300 transform w-full h-full touch-none ${activeTab === Tab.PREVIEW ? 'translate-x-0' : 'translate-x-full'}`}>
          {isRunning && iframeSrc ? (
             <iframe
             src={iframeSrc}
             className="w-full h-full border-none block"
             title="p5.js sketch preview"
             allow="camera; microphone; geolocation"
             scrolling="no"
           />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <Play size={48} className="opacity-20" />
              <p>Sketch is stopped</p>
            </div>
          )}
        </div>

        {/* Console Overlay */}
        <Console 
          logs={logs} 
          isOpen={isConsoleOpen} 
          onClose={() => setIsConsoleOpen(false)} 
          onClear={() => setLogs([])} 
        />
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-[#2D2D2D] border-t border-[#3D3D3D] flex items-center justify-around shrink-0 z-10 select-none safe-area-pb">
        <button
          onClick={() => setActiveTab(Tab.EDITOR)}
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors active:scale-95 ${activeTab === Tab.EDITOR ? 'text-[#ED225D]' : 'text-gray-400 hover:text-white'}`}
        >
          <CodeIcon size={20} />
          <span className="text-[10px] font-medium">Code</span>
        </button>

        <button
          onClick={() => setActiveTab(Tab.PREVIEW)}
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors active:scale-95 ${activeTab === Tab.PREVIEW ? 'text-[#ED225D]' : 'text-gray-400 hover:text-white'}`}
        >
          <Eye size={20} />
          <span className="text-[10px] font-medium">Preview</span>
        </button>

        <button
          onClick={() => {
            setIsConsoleOpen(!isConsoleOpen);
            setUnreadLogs(false);
          }}
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors relative active:scale-95 ${isConsoleOpen ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:text-white'}`}
        >
          <div className="relative">
            <Terminal size={20} />
            {unreadLogs && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#2D2D2D]" />
            )}
            {logs.some(l => l.type === 'error') && !isConsoleOpen && (
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#2D2D2D]" />
            )}
          </div>
          <span className="text-[10px] font-medium">Console</span>
        </button>
      </nav>

      {/* AI Modal */}
      <AIAssistant 
        currentCode={code} 
        onCodeGenerated={handleAIResult} 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />
    </div>
  );
}

export default App;
