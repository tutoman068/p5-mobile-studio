
import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/Editor';
import { generateP5HTML } from './utils/p5Template';
import { ConsoleLog, Tab, AppFile, FileType } from './types';
import Console from './components/Console';
import AIAssistant from './components/AIAssistant';
import FileManager from './components/FileManager';
import { Play, Square, Code as CodeIcon, Eye, Terminal, Sparkles, FolderOpen, Menu } from 'lucide-react';

const DEFAULT_SKETCH = `function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
  noStroke();
}

function draw() {
  let x = mouseX;
  let y = mouseY;
  
  background(20, 10);
  
  fill(255, 150);
  circle(x, height/2, 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(20);
}`;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.EDITOR);
  
  // File System State
  const [files, setFiles] = useState<AppFile[]>([
    { id: 'main', name: 'sketch.js', content: DEFAULT_SKETCH, type: 'javascript' }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('main');
  
  // History State for the active file
  // Map fileId -> History Stack
  const [fileHistory, setFileHistory] = useState<Record<string, { past: string[], future: string[] }>>({
    'main': { past: [], future: [] }
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState<boolean>(false);
  const [unreadLogs, setUnreadLogs] = useState<boolean>(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // --- History Management ---
  const updateFileContent = (newContent: string) => {
    // 1. Push current content to past
    setFileHistory(prev => ({
      ...prev,
      [activeFileId]: {
        past: [...(prev[activeFileId]?.past || []), activeFile.content],
        future: []
      }
    }));

    // 2. Update file
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const undo = () => {
    const history = fileHistory[activeFileId] || { past: [], future: [] };
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    
    setFileHistory(prev => ({
      ...prev,
      [activeFileId]: {
        past: newPast,
        future: [activeFile.content, ...history.future]
      }
    }));
    
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: previous } : f));
  };

  const redo = () => {
    const history = fileHistory[activeFileId] || { past: [], future: [] };
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setFileHistory(prev => ({
      ...prev,
      [activeFileId]: {
        past: [...history.past, activeFile.content],
        future: newFuture
      }
    }));

    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: next } : f));
  };

  // --- Runner ---
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
      if (!isConsoleOpen) setUnreadLogs(true);
      if (type === 'error') setIsConsoleOpen(true);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isConsoleOpen]);

  const runSketch = useCallback(() => {
    setLogs([]);
    setUnreadLogs(false);
    
    // Find main sketch
    const mainSketch = files.find(f => f.name === 'sketch.js')?.content || '';
    
    const html = generateP5HTML(mainSketch, files);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);
    setIsRunning(true);
    setActiveTab(Tab.PREVIEW);
  }, [files]);

  const stopSketch = useCallback(() => {
    setIsRunning(false);
    setIframeSrc('');
    setActiveTab(Tab.EDITOR);
  }, []);

  // --- File Operations ---
  const handleAddFile = (name: string, type: FileType) => {
    const newFile: AppFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      content: type === 'javascript' ? '// New file' : ''
    };
    setFiles([...files, newFile]);
    if (type === 'javascript') {
      setActiveFileId(newFile.id);
      setIsFileManagerOpen(false);
    }
  };

  const handleUploadFile = (file: File) => {
    const type: FileType = file.type.startsWith('video') ? 'video' : 'image';
    const objectUrl = URL.createObjectURL(file);
    const newFile: AppFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type,
      content: objectUrl,
      blob: file
    };
    setFiles([...files, newFile]);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId('main');
  };

  const handleAIResult = (newCode: string) => {
    updateFileContent(newCode);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#18181b] overflow-hidden text-white relative">
      {/* Header */}
      <header 
        className="bg-[#2D2D2D] border-b border-[#3D3D3D] flex items-end justify-between px-4 pb-2 shrink-0 z-10 select-none relative shadow-lg"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          minHeight: 'calc(3.5rem + env(safe-area-inset-top))'
        }}
      >
        <div className="flex items-center gap-2 h-8">
          <div className="w-8 h-8 bg-[#ED225D] flex items-center justify-center rounded-lg font-bold text-white shadow-lg shadow-pink-900/50">
            p5
          </div>
          <button 
             onClick={() => setIsFileManagerOpen(true)}
             className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <span className="font-bold text-sm max-w-[100px] truncate">{activeFile.name}</span>
            <FolderOpen size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 h-8">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-800/50 transition-all active:scale-95"
          >
            <Sparkles size={14} />
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

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden w-full bg-[#1e1e1e]">
        <div className={`absolute inset-0 transition-transform duration-300 transform w-full h-full ${activeTab === Tab.EDITOR ? 'translate-x-0' : '-translate-x-full'}`}>
          <CodeEditor 
            code={activeFile.content} 
            onChange={updateFileContent} 
            onUndo={undo}
            onRedo={redo}
            canUndo={(fileHistory[activeFileId]?.past?.length || 0) > 0}
            canRedo={(fileHistory[activeFileId]?.future?.length || 0) > 0}
            readOnly={activeFile.type !== 'javascript'}
          />
        </div>

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

        <Console 
          logs={logs} 
          isOpen={isConsoleOpen} 
          onClose={() => setIsConsoleOpen(false)} 
          onClear={() => setLogs([])} 
        />
      </main>

      {/* Footer - Fixed Layout */}
      <nav 
        className="bg-[#2D2D2D] border-t border-[#3D3D3D] flex items-center justify-around shrink-0 z-10 select-none w-full"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingTop: '8px',
          height: 'auto' // Allow container to grow naturally with safe area
        }}
      >
        <button
          onClick={() => setActiveTab(Tab.EDITOR)}
          className={`flex flex-col items-center gap-1 w-full p-2 transition-colors active:scale-95 ${activeTab === Tab.EDITOR ? 'text-[#ED225D]' : 'text-gray-400 hover:text-white'}`}
        >
          <CodeIcon size={20} />
          <span className="text-[10px] font-medium">Code</span>
        </button>

        <button
          onClick={() => setActiveTab(Tab.PREVIEW)}
          className={`flex flex-col items-center gap-1 w-full p-2 transition-colors active:scale-95 ${activeTab === Tab.PREVIEW ? 'text-[#ED225D]' : 'text-gray-400 hover:text-white'}`}
        >
          <Eye size={20} />
          <span className="text-[10px] font-medium">Preview</span>
        </button>

        <button
          onClick={() => {
            setIsConsoleOpen(!isConsoleOpen);
            setUnreadLogs(false);
          }}
          className={`flex flex-col items-center gap-1 w-full p-2 transition-colors relative active:scale-95 ${isConsoleOpen ? 'text-white bg-gray-700/50 rounded-lg mx-2' : 'text-gray-400 hover:text-white'}`}
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

      {/* Overlays */}
      <AIAssistant 
        currentCode={activeFile.content} 
        onCodeGenerated={handleAIResult} 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />
      
      <FileManager 
        files={files}
        activeFileId={activeFileId}
        onSelectFile={(id) => { setActiveFileId(id); setIsFileManagerOpen(false); }}
        onAddFile={handleAddFile}
        onUploadFile={handleUploadFile}
        onDeleteFile={handleDeleteFile}
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
      />
    </div>
  );
}

export default App;
