
import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/Editor';
import { generateP5HTML } from './utils/p5Template';
import { ConsoleLog, Tab, AppFile, FileType } from './types';
import Console from './components/Console';
import AIAssistant from './components/AIAssistant';
import FileManager from './components/FileManager';
import { Play, Square, Code as CodeIcon, Eye, Terminal, Sparkles, FolderOpen, Image as ImageIcon } from 'lucide-react';

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
    { id: 'main', name: 'sketch.js', parentId: null, content: DEFAULT_SKETCH, type: 'javascript' }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('main');
  
  // History State
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

  const updateFileContent = (newContent: string) => {
    setFileHistory(prev => ({
      ...prev,
      [activeFileId]: {
        past: [...(prev[activeFileId]?.past || []), activeFile.content],
        future: []
      }
    }));
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const undo = () => {
    const history = fileHistory[activeFileId] || { past: [], future: [] };
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setFileHistory(prev => ({
      ...prev,
      [activeFileId]: {
        past: history.past.slice(0, -1),
        future: [activeFile.content, ...history.future]
      }
    }));
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: previous } : f));
  };

  const redo = () => {
    const history = fileHistory[activeFileId] || { past: [], future: [] };
    if (history.future.length === 0) return;
    const next = history.future[0];
    setFileHistory(prev => ({
      ...prev,
      [activeFileId]: {
        past: [...history.past, activeFile.content],
        future: history.future.slice(1)
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
    const mainSketch = files.find(f => f.name === 'sketch.js' && f.parentId === null)?.content || '';
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

  const handleAddFile = (name: string, type: FileType, parentId: string | null) => {
    const newFile: AppFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      parentId,
      content: type === 'javascript' ? '// New file' : ''
    };
    setFiles([...files, newFile]);
    if (type === 'javascript') {
      setActiveFileId(newFile.id);
      setIsFileManagerOpen(false);
    }
  };

  const handleUploadFile = (file: File, parentId: string | null) => {
    const type: FileType = file.type.startsWith('video') ? 'video' : 'image';
    const objectUrl = URL.createObjectURL(file);
    const newFile: AppFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type,
      parentId,
      content: objectUrl,
      blob: file
    };
    setFiles([...files, newFile]);
  };

  const handleDeleteFile = (id: string) => {
    const deleteRecursive = (targetId: string, currentFiles: AppFile[]): AppFile[] => {
      const children = currentFiles.filter(f => f.parentId === targetId);
      let remaining = currentFiles.filter(f => f.id !== targetId);
      children.forEach(child => {
        remaining = deleteRecursive(child.id, remaining);
      });
      return remaining;
    };
    
    setFiles(prev => deleteRecursive(id, prev));
    if (activeFileId === id) setActiveFileId('main');
  };

  const handleRenameFile = (id: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const handleMoveFile = (id: string, newParentId: string | null) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, parentId: newParentId } : f));
  };

  const handleAIResult = (newCode: string) => {
    updateFileContent(newCode);
  };

  return (
    // ROOT: Relative container inside the Fixed Body. 
    // Using h-full to match the fixed body height.
    <div className="relative w-full h-full bg-[#18181b] flex flex-col overflow-hidden text-white font-sans touch-none select-none">
      
      {/* HEADER */}
      <header 
        className="shrink-0 bg-[#2D2D2D] border-b border-[#3D3D3D] flex items-end justify-between px-4 pb-3 z-30 shadow-lg relative"
        style={{
          paddingTop: 'calc(0.5rem + env(safe-area-inset-top))',
          height: 'calc(4rem + env(safe-area-inset-top))'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#ED225D] flex items-center justify-center rounded-xl font-bold text-white shadow-lg shadow-pink-900/50">
            p5
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Project</span>
            <span className="text-sm font-bold text-white max-w-[100px] truncate leading-tight">
              {activeFile.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsFileManagerOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3D3D3D] text-gray-300 hover:bg-[#4D4D4D] hover:text-white transition-all active:scale-95 border border-white/5">
            <FolderOpen size={18} />
          </button>
          <button onClick={() => setIsAIModalOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-purple-900 to-purple-700 border border-purple-500/30 text-purple-200 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-purple-900/30">
            <Sparkles size={18} />
          </button>
          <button onClick={isRunning ? stopSketch : runSketch} className={`flex items-center gap-2 px-4 h-10 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 border ${isRunning ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20' : 'bg-[#ED225D] text-white border-transparent hover:bg-[#c91d4e] shadow-pink-900/50'}`}>
            {isRunning ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Run</>}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 relative w-full overflow-hidden bg-[#1e1e1e] z-0">
        <div className={`absolute inset-0 transition-transform duration-300 transform w-full h-full ${activeTab === Tab.EDITOR ? 'translate-x-0' : '-translate-x-full'}`}>
          {activeFile.type === 'javascript' ? (
             <CodeEditor 
               code={activeFile.content} 
               onChange={updateFileContent} 
               onUndo={undo} 
               onRedo={redo} 
               canUndo={(fileHistory[activeFileId]?.past?.length || 0) > 0} 
               canRedo={(fileHistory[activeFileId]?.future?.length || 0) > 0} 
             />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              {activeFile.type === 'image' && <ImageIcon size={48} className="mb-4 opacity-50"/>}
              <p>Preview not available for this file type.</p>
            </div>
          )}
        </div>
        <div className={`absolute inset-0 bg-[#18181b] transition-transform duration-300 transform w-full h-full touch-none ${activeTab === Tab.PREVIEW ? 'translate-x-0' : 'translate-x-full'}`}>
          {isRunning && iframeSrc ? (
             <iframe src={iframeSrc} className="w-full h-full border-none block" title="p5.js sketch preview" allow="camera; microphone; geolocation" scrolling="no" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <Play size={48} className="opacity-20" />
              <p>Sketch is stopped</p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER - Z-INDEX 40 */}
      <nav 
        className="shrink-0 w-full bg-[#2D2D2D] border-t border-[#3D3D3D] flex items-center justify-around z-40 select-none shadow-[0_-4px_10px_rgba(0,0,0,0.2)] relative"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          height: 'calc(3.5rem + env(safe-area-inset-bottom))'
        }}
      >
        <button onClick={() => setActiveTab(Tab.EDITOR)} className={`flex flex-col items-center gap-1 w-full pb-1 transition-colors active:scale-95 ${activeTab === Tab.EDITOR ? 'text-[#ED225D]' : 'text-gray-400 hover:text-white'}`}>
          <CodeIcon size={20} />
          <span className="text-[10px] font-medium">Code</span>
        </button>
        <button onClick={() => setActiveTab(Tab.PREVIEW)} className={`flex flex-col items-center gap-1 w-full pb-1 transition-colors active:scale-95 ${activeTab === Tab.PREVIEW ? 'text-[#ED225D]' : 'text-gray-400 hover:text-white'}`}>
          <Eye size={20} />
          <span className="text-[10px] font-medium">Preview</span>
        </button>
        <button onClick={() => { setIsConsoleOpen(!isConsoleOpen); setUnreadLogs(false); }} className={`flex flex-col items-center gap-1 w-full pb-1 transition-colors relative active:scale-95 ${isConsoleOpen ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
          <div className="relative">
            <Terminal size={20} />
            {unreadLogs && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#2D2D2D]" />}
            {logs.some(l => l.type === 'error') && !isConsoleOpen && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#2D2D2D]" />}
          </div>
          <span className="text-[10px] font-medium">Console</span>
        </button>
      </nav>

      {/* CONSOLE - Z-INDEX 50 (Higher than Footer Z-40) */}
      <Console 
        logs={logs} 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
        onClear={() => setLogs([])} 
      />

      <AIAssistant currentCode={activeFile.type === 'javascript' ? activeFile.content : ''} onCodeGenerated={handleAIResult} isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <FileManager files={files} activeFileId={activeFileId} onSelectFile={(id) => { setActiveFileId(id); setIsFileManagerOpen(false); }} onAddFile={handleAddFile} onUploadFile={handleUploadFile} onDeleteFile={handleDeleteFile} onRenameFile={handleRenameFile} onMoveFile={handleMoveFile} isOpen={isFileManagerOpen} onClose={() => setIsFileManagerOpen(false)} />
    </div>
  );
}

export default App;

