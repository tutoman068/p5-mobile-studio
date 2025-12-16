
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
      className={`fixed bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-[#3D3D3D] shadow-2xl flex flex-col z-40 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
        isOpen ? 'translate-y-0' : 'translate-y-[100%]'
      }`}
      style={{
        // Height is roughly 40% of viewport
        height: '40dvh', 
        // IMPORTANT: Add padding at the bottom equal to the footer height (3.5rem + safe-area)
        // This ensures the logs are visible ABOVE the footer, while the container background slides up from behind it.
        paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] border-b border-[#3D3D3D]">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Console ({logs.length})</h3>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="p-1 hover:bg-[#3D3D3D] rounded text-gray-400 hover:text-white transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-[#3D3D3D] rounded text-gray-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic p-2 text-center mt-4">No logs output</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`flex items-start gap-2 border-b border-[#333] pb-1 last:border-0 ${
              log.type === 'error' ? 'text-red-400 bg-red-900/10' : 
              log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
            }`}>
              <span className="mt-0.5 shrink-0">
                {log.type === 'error' ? <AlertCircle size={10} /> : 
                 log.type === 'warn' ? <AlertTriangle size={10} /> : 
                 <Info size={10} />}
              </span>
              <span className="break-all whitespace-pre-wrap leading-relaxed">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Console;
