
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
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null); // For Action Sheet
  
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
      setSelectedFileId(null);
    }
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Main Drawer */}
      <div className="relative w-full max-w-sm h-full bg-[#1e1e1e] border-l border-[#3D3D3D] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-4 border-b border-[#3D3D3D] bg-[#2D2D2D]"
          style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
        >
          <h2 className="font-bold text-lg text-white">Files</h2>
          <button onClick={onClose} className="p-1 rounded-full bg-black/20 text-gray-400 hover:text-white hover:bg-black/40 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="px-4 py-3 bg-[#252525] border-b border-[#3D3D3D] flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={item.id || 'root'}>
              {idx > 0 && <ChevronRight size={14} className="text-gray-500 mx-1 shrink-0" />}
              <button 
                onClick={() => setCurrentPathId(item.id)}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${idx === breadcrumbs.length - 1 ? 'text-white bg-white/10' : 'text-gray-400 hover:text-[#ED225D]'}`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Actions Toolbar */}
        <div className="p-3 grid grid-cols-3 gap-2 border-b border-[#3D3D3D] shrink-0">
          <button onClick={() => setIsCreating('file')} className="flex flex-col items-center justify-center p-3 bg-[#2D2D2D] rounded-lg hover:bg-[#383838] active:scale-95 transition-all border border-[#3D3D3D]">
            <FilePlus size={20} className="text-[#ED225D] mb-1.5" />
            <span className="text-[10px] text-gray-300 font-medium">New Script</span>
          </button>
          <button onClick={() => setIsCreating('folder')} className="flex flex-col items-center justify-center p-3 bg-[#2D2D2D] rounded-lg hover:bg-[#383838] active:scale-95 transition-all border border-[#3D3D3D]">
            <FolderPlus size={20} className="text-yellow-400 mb-1.5" />
            <span className="text-[10px] text-gray-300 font-medium">New Folder</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 bg-[#2D2D2D] rounded-lg hover:bg-[#383838] active:scale-95 transition-all border border-[#3D3D3D]">
            <Upload size={20} className="text-blue-400 mb-1.5" />
            <span className="text-[10px] text-gray-300 font-medium">Upload Asset</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
        </div>

        {/* Inline Creator */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-3 bg-[#333] flex gap-2 border-b border-[#3D3D3D] animate-in slide-in-from-top-2">
            <input 
              autoFocus
              className="flex-1 bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm text-white outline-none focus:border-[#ED225D]"
              placeholder={isCreating === 'file' ? "Script name..." : "Folder name..."}
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
            />
            <button type="submit" className="bg-[#ED225D] text-white px-4 rounded text-xs font-bold uppercase tracking-wide">Create</button>
            <button type="button" onClick={() => setIsCreating(null)} className="text-gray-400 px-2"><X size={18}/></button>
          </form>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {currentPathId && (
            <button 
              onClick={() => {
                const parent = files.find(f => f.id === currentPathId)?.parentId || null;
                setCurrentPathId(parent);
              }}
              className="w-full flex items-center gap-3 p-3 text-gray-400 hover:bg-[#3D3D3D] rounded-lg mb-2 border border-dashed border-gray-700"
            >
              <CornerUpLeft size={16} /> <span className="text-sm font-medium">Back to parent</span>
            </button>
          )}

          {currentItems.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-600 gap-2">
              <Folder size={32} className="opacity-20"/>
              <span className="text-xs">This folder is empty</span>
            </div>
          )}

          {currentItems.map(file => (
            <div 
              key={file.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                activeFileId === file.id && file.type === 'javascript' 
                  ? 'bg-[#ED225D]/10 border border-[#ED225D]/40' 
                  : 'bg-[#262626] border border-[#333] hover:border-[#555]'
              }`}
            >
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
                {file.type === 'folder' ? <Folder size={20} className="text-yellow-400 fill-yellow-400/20"/> :
                 file.type === 'javascript' ? <FileCode size={20} className="text-[#ED225D]"/> :
                 file.type === 'image' ? <ImageIcon size={20} className="text-blue-400"/> :
                 <Video size={20} className="text-purple-400"/>}
                <span className={`text-sm font-medium truncate ${activeFileId === file.id && file.type === 'javascript' ? 'text-[#ED225D]' : 'text-gray-200'}`}>
                  {file.name}
                </span>
              </div>

              {/* Context Menu Trigger */}
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedFileId(file.id); }}
                className="p-2 -mr-2 text-gray-500 hover:text-white rounded-full active:bg-white/10"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          ))}
          {/* Spacer for bottom safe area in case list is long */}
          <div className="h-20" /> 
        </div>
      </div>

      {/* ACTION SHEET (Mobile Native Context Menu) */}
      {selectedFile && (
        <>
          <div className="absolute inset-0 bg-black/40 z-[60]" onClick={() => setSelectedFileId(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[#2D2D2D] rounded-t-2xl z-[70] p-4 pb-8 animate-in slide-in-from-bottom duration-300 border-t border-[#444] shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#3D3D3D] pb-3">
              <div className="flex items-center gap-3 overflow-hidden">
                {selectedFile.type === 'folder' ? <Folder size={20} className="text-yellow-400"/> : <FileCode size={20} className="text-[#ED225D]"/>}
                <span className="font-bold text-white truncate">{selectedFile.name}</span>
              </div>
              <button onClick={() => setSelectedFileId(null)} className="p-1 bg-black/20 rounded-full text-gray-400"><X size={16}/></button>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => { setRenameValue(selectedFile.name); setIsRenaming(selectedFile.id); setSelectedFileId(null); }}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-[#383838] text-white hover:bg-[#444] active:scale-98 transition-all"
              >
                <Edit2 size={18} className="text-blue-400"/>
                <span className="font-medium">Rename</span>
              </button>
              
              <button 
                 onClick={() => { setIsMoving(selectedFile.id); setSelectedFileId(null); }}
                 className="w-full flex items-center gap-4 p-3 rounded-xl bg-[#383838] text-white hover:bg-[#444] active:scale-98 transition-all"
              >
                <Move size={18} className="text-yellow-400"/>
                <span className="font-medium">Move to...</span>
              </button>

              {selectedFile.name !== 'sketch.js' && (
                <button 
                  onClick={() => { onDeleteFile(selectedFile.id); setSelectedFileId(null); }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/30 active:scale-98 transition-all border border-red-900/30"
                >
                  <Trash2 size={18} />
                  <span className="font-medium">Delete</span>
                </button>
              )}
            </div>
            {/* Safe area spacer for bottom of sheet */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </>
      )}

      {/* Rename Dialog Overlay */}
      {isRenaming && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-[#2D2D2D] p-5 rounded-2xl border border-[#444] w-full max-w-xs shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Rename Item</h3>
            <input 
              autoFocus
              className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-3 py-3 text-white outline-none focus:border-[#ED225D] text-lg mb-6"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsRenaming(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#3D3D3D]">Cancel</button>
              <button onClick={submitRename} className="px-6 py-2 rounded-lg text-sm font-bold bg-[#ED225D] text-white shadow-lg shadow-pink-900/30">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Move Dialog Overlay */}
      {isMoving && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-[#2D2D2D] rounded-2xl border border-[#444] w-full max-w-xs shadow-2xl flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-[#3D3D3D] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Select Destination</h3>
              <button onClick={() => setIsMoving(null)}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button 
                onClick={() => { onMoveFile(isMoving, null); setIsMoving(null); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#3D3D3D] rounded-xl text-left transition-colors border border-transparent hover:border-[#555]"
              >
                <div className="p-2 bg-[#3D3D3D] rounded-lg">
                    <CornerUpLeft size={16} className="text-gray-400"/>
                </div>
                <span className="text-sm font-bold text-gray-200">Root Folder</span>
              </button>
              
              {allFolders
                .filter(f => f.id !== isMoving)
                .map(f => (
                <button 
                  key={f.id}
                  onClick={() => { onMoveFile(isMoving, f.id); setIsMoving(null); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#3D3D3D] rounded-xl text-left transition-colors border border-transparent hover:border-[#555]"
                >
                   <div className="p-2 bg-[#3D3D3D] rounded-lg">
                      <Folder size={16} className="text-yellow-400"/>
                   </div>
                  <span className="text-sm font-medium text-gray-200">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
