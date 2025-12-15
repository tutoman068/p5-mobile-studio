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

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 h-48 bg-gray-900 border-t border-gray-700 shadow-xl flex flex-col z-20 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Console ({logs.length})</h3>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic p-2 text-center">No logs output</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`flex items-start gap-2 border-b border-gray-800 pb-1 last:border-0 ${
              log.type === 'error' ? 'text-red-400 bg-red-900/10' : 
              log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
            }`}>
              <span className="mt-0.5 shrink-0">
                {log.type === 'error' ? <AlertCircle size={10} /> : 
                 log.type === 'warn' ? <AlertTriangle size={10} /> : 
                 <Info size={10} />}
              </span>
              <span className="break-all whitespace-pre-wrap">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Console;