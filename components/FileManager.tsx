
import React, { useRef } from 'react';
import { AppFile } from '../types';
import { X, FileCode, Image as ImageIcon, Video, Plus, Upload, Trash2, FilePlus } from 'lucide-react';

interface FileManagerProps {
  files: AppFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: (name: string, type: 'javascript') => void;
  onUploadFile: (file: File) => void;
  onDeleteFile: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ 
  files, activeFileId, onSelectFile, onAddFile, onUploadFile, onDeleteFile, isOpen, onClose 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFileName, setNewFileName] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      let name = newFileName.trim();
      if (!name.endsWith('.js')) name += '.js';
      onAddFile(name, 'javascript');
      setNewFileName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-72 h-full bg-[#2D2D2D] border-l border-[#3D3D3D] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#3D3D3D]">
          <h2 className="font-bold text-white">Project Files</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex-1 bg-[#3D3D3D] hover:bg-[#4D4D4D] text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <FilePlus size={14} /> New Script
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-[#3D3D3D] hover:bg-[#4D4D4D] text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <Upload size={14} /> Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileUpload}
            />
          </div>

          {isAdding && (
            <form onSubmit={handleCreateFile} className="flex gap-2 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                autoFocus
                placeholder="Name (e.g., Ball.js)"
                className="flex-1 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#ED225D]"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
              />
              <button type="submit" className="bg-[#ED225D] text-white px-2 rounded text-xs">OK</button>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 pb-4 space-y-1">
            {files.map(file => (
              <div 
                key={file.id}
                onClick={() => file.type === 'javascript' && onSelectFile(file.id)}
                className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  activeFileId === file.id && file.type === 'javascript' 
                    ? 'bg-[#ED225D]/20 text-[#ED225D]' 
                    : 'text-gray-300 hover:bg-[#3D3D3D]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {file.type === 'javascript' ? <FileCode size={16} /> : 
                   file.type === 'image' ? <ImageIcon size={16} className="text-blue-400"/> : 
                   <Video size={16} className="text-purple-400"/>}
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                
                {file.name !== 'sketch.js' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-[#3D3D3D] text-[10px] text-gray-500 text-center">
          Assets are automatically linked when you use their names in code (e.g. loadImage('img.png'))
        </div>
      </div>
    </div>
  );
};

export default FileManager;
