
import React, { useEffect, useRef } from 'react';
import { ConsoleLog } from '../types';
import { X, Trash2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ConsoleProps {
  logs: ConsoleLog[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

const Console: React.FC<ConsoleProps> = ({ logs, isOpen, onClose, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-[#3D3D3D] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex flex-col z-50 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        // Height: 45% of viewport
        height: '45dvh', 
        // IMPORTANT: Add safe area padding so content doesn't get hidden by home bar
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#2D2D2D] border-b border-[#3D3D3D] shrink-0">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Console ({logs.length})
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={onClear} className="p-1.5 hover:bg-[#3D3D3D] rounded text-gray-400 hover:text-white transition-colors" title="Clear logs">
            <Trash2 size={16} />
          </button>
          <div className="w-px h-4 bg-gray-600"></div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#3D3D3D] rounded text-gray-400 hover:text-white transition-colors" title="Close console">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-50">
             <div className="w-10 h-10 border-2 border-gray-600 rounded-lg flex items-center justify-center">
               <span className="font-bold text-lg">;</span>
             </div>
             <p>No logs output</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`flex items-start gap-2.5 p-2 rounded ${
              log.type === 'error' ? 'text-red-300 bg-red-900/20 border border-red-900/30' : 
              log.type === 'warn' ? 'text-yellow-300 bg-yellow-900/10 border border-yellow-900/20' : 'text-gray-300 hover:bg-white/5'
            }`}>
              <span className="mt-0.5 shrink-0 opacity-70">
                {log.type === 'error' ? <AlertCircle size={12} /> : 
                 log.type === 'warn' ? <AlertTriangle size={12} /> : 
                 <Info size={12} />}
              </span>
              <span className="break-all whitespace-pre-wrap leading-relaxed select-text">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Console;
