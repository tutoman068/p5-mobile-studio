
import React, { useRef, useState, useMemo } from 'react';
import { AppFile } from '../types';
import { 
  X, FileCode, Image as ImageIcon, Video, Folder, FolderPlus, 
  Upload, Trash2, FilePlus, MoreVertical, Edit2, Move, ChevronRight, CornerUpLeft 
} from 'lucide-react';

interface FileManagerProps {
  files: AppFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: (name: string, type: 'javascript' | 'folder', parentId: string | null) => void;
  onUploadFile: (file: File, parentId: string | null) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onMoveFile: (id: string, newParentId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ 
  files, activeFileId, onSelectFile, onAddFile, onUploadFile, 
  onDeleteFile, onRenameFile, onMoveFile, isOpen, onClose 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPathId, setCurrentPathId] = useState<string | null>(null); // null = root
  const [menuTargetId, setMenuTargetId] = useState<string | null>(null);
  
  // Modal States
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isMoving, setIsMoving] = useState<string | null>(null);
  
  // Creation States
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  // Derived: Current Folder's items
  const currentItems = useMemo(() => {
    return files.filter(f => f.parentId === currentPathId).sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [files, currentPathId]);

  // Derived: Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const path: {id: string | null, name: string}[] = [{id: null, name: 'Root'}];
    let curr = currentPathId;
    const stack = [];
    while (curr) {
      const folder = files.find(f => f.id === curr);
      if (folder) {
        stack.unshift({id: folder.id, name: folder.name});
        curr = folder.parentId;
      } else {
        break;
      }
    }
    return [...path, ...stack];
  }, [files, currentPathId]);

  // Derived: All Folders (for Move dialog)
  const allFolders = useMemo(() => files.filter(f => f.type === 'folder'), [files]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0], currentPathId);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() && isCreating) {
      let name = newItemName.trim();
      if (isCreating === 'file' && !name.endsWith('.js')) name += '.js';
      onAddFile(name, isCreating === 'file' ? 'javascript' : 'folder', currentPathId);
      setNewItemName('');
      setIsCreating(null);
    }
  };

  const submitRename = () => {
    if (isRenaming && renameValue.trim()) {
      onRenameFile(isRenaming, renameValue.trim());
      setIsRenaming(null);
      setRenameValue('');
      setMenuTargetId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-80 h-full bg-[#2D2D2D] border-l border-[#3D3D3D] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3D3D3D] bg-[#2D2D2D]">
          <h2 className="font-bold text-white">Files</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="px-4 py-2 bg-[#252525] border-b border-[#3D3D3D] flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={item.id || 'root'}>
              {idx > 0 && <ChevronRight size={14} className="text-gray-500 mx-1" />}
              <button 
                onClick={() => setCurrentPathId(item.id)}
                className={`text-xs font-medium ${idx === breadcrumbs.length - 1 ? 'text-white' : 'text-gray-400 hover:text-[#ED225D]'}`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Actions Toolbar */}
        <div className="p-3 grid grid-cols-3 gap-2 border-b border-[#3D3D3D]">
          <button onClick={() => setIsCreating('file')} className="flex flex-col items-center justify-center p-2 bg-[#3D3D3D] rounded hover:bg-[#444] active:scale-95 transition-all">
            <FilePlus size={16} className="text-[#ED225D] mb-1" />
            <span className="text-[10px] text-gray-300">File</span>
          </button>
          <button onClick={() => setIsCreating('folder')} className="flex flex-col items-center justify-center p-2 bg-[#3D3D3D] rounded hover:bg-[#444] active:scale-95 transition-all">
            <FolderPlus size={16} className="text-yellow-400 mb-1" />
            <span className="text-[10px] text-gray-300">Folder</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-2 bg-[#3D3D3D] rounded hover:bg-[#444] active:scale-95 transition-all">
            <Upload size={16} className="text-blue-400 mb-1" />
            <span className="text-[10px] text-gray-300">Upload</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
        </div>

        {/* Inline Creator */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-3 bg-[#333] flex gap-2 border-b border-[#3D3D3D] animate-in slide-in-from-top-2">
            <input 
              autoFocus
              className="flex-1 bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#ED225D]"
              placeholder={isCreating === 'file' ? "Script name..." : "Folder name..."}
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
            />
            <button type="submit" className="bg-[#ED225D] text-white px-3 rounded text-xs font-medium">OK</button>
            <button type="button" onClick={() => setIsCreating(null)} className="text-gray-400 px-1"><X size={14}/></button>
          </form>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 relative">
          {currentPathId && (
            <button 
              onClick={() => {
                const parent = files.find(f => f.id === currentPathId)?.parentId || null;
                setCurrentPathId(parent);
              }}
              className="w-full flex items-center gap-2 p-2 text-gray-400 hover:bg-[#3D3D3D] rounded mb-1"
            >
              <CornerUpLeft size={16} /> <span className="text-sm">...</span>
            </button>
          )}

          {currentItems.length === 0 && (
            <div className="text-center text-gray-500 text-xs mt-10">Empty folder</div>
          )}

          {currentItems.map(file => (
            <div 
              key={file.id}
              className={`group flex items-center justify-between p-2 rounded transition-colors ${
                activeFileId === file.id && file.type === 'javascript' 
                  ? 'bg-[#ED225D]/20 border border-[#ED225D]/30' 
                  : 'hover:bg-[#3D3D3D] border border-transparent'
              }`}
            >
              {/* Item Click Area */}
              <div 
                className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer"
                onClick={() => {
                  if (file.type === 'folder') {
                    setCurrentPathId(file.id);
                  } else if (file.type === 'javascript') {
                    onSelectFile(file.id);
                    onClose();
                  }
                }}
              >
                {file.type === 'folder' ? <Folder size={18} className="text-yellow-400 fill-yellow-400/20"/> :
                 file.type === 'javascript' ? <FileCode size={18} className="text-[#ED225D]"/> :
                 file.type === 'image' ? <ImageIcon size={18} className="text-blue-400"/> :
                 <Video size={18} className="text-purple-400"/>}
                <span className={`text-sm truncate ${activeFileId === file.id ? 'text-[#ED225D] font-medium' : 'text-gray-200'}`}>
                  {file.name}
                </span>
              </div>

              {/* Context Menu Trigger */}
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuTargetId(menuTargetId === file.id ? null : file.id); }}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
              >
                <MoreVertical size={16} />
              </button>

              {/* Absolute Context Menu */}
              {menuTargetId === file.id && (
                <div className="absolute right-8 mt-6 w-32 bg-[#1e1e1e] border border-[#444] shadow-xl rounded-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={(e) => { e.stopPropagation(); setRenameValue(file.name); setIsRenaming(file.id); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#333] hover:text-white flex items-center gap-2">
                    <Edit2 size={12}/> Rename
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setIsMoving(file.id); setMenuTargetId(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#333] hover:text-white flex items-center gap-2">
                    <Move size={12}/> Move
                  </button>
                  {file.name !== 'sketch.js' && (
                    <button onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); setMenuTargetId(null); }} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 flex items-center gap-2">
                      <Trash2 size={12}/> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rename Dialog Overlay */}
      {isRenaming && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#2D2D2D] p-4 rounded-xl border border-[#444] w-full max-w-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Rename Item</h3>
            <input 
              autoFocus
              className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-2 text-white outline-none focus:border-[#ED225D] mb-3"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsRenaming(null)} className="px-3 py-1.5 text-xs text-gray-400">Cancel</button>
              <button onClick={submitRename} className="px-3 py-1.5 text-xs bg-[#ED225D] text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Move Dialog Overlay */}
      {isMoving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#2D2D2D] rounded-xl border border-[#444] w-full max-w-xs shadow-2xl flex flex-col max-h-[60vh]">
            <div className="p-4 border-b border-[#3D3D3D]">
              <h3 className="text-sm font-bold text-white">Move to...</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <button 
                onClick={() => { onMoveFile(isMoving, null); setIsMoving(null); }}
                className="w-full flex items-center gap-2 p-3 hover:bg-[#3D3D3D] rounded text-left"
              >
                <CornerUpLeft size={16} className="text-gray-400"/>
                <span className="text-sm text-gray-200">Root /</span>
              </button>
              {allFolders
                .filter(f => f.id !== isMoving) // Can't move folder into itself
                .map(f => (
                <button 
                  key={f.id}
                  onClick={() => { onMoveFile(isMoving, f.id); setIsMoving(null); }}
                  className="w-full flex items-center gap-2 p-3 hover:bg-[#3D3D3D] rounded text-left"
                >
                  <Folder size={16} className="text-yellow-400"/>
                  <span className="text-sm text-gray-200">{f.name}</span>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-[#3D3D3D] flex justify-end">
              <button onClick={() => setIsMoving(null)} className="px-3 py-1.5 text-xs text-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
