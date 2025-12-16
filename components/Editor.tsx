
import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import { Copy, RotateCcw, RotateCw, Check } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, onChange, onUndo, onRedo, canUndo, canRedo, readOnly = false 
}) => {
  const [currentLine, setCurrentLine] = useState(1);
  const [copied, setCopied] = useState(false);

  // Split code into lines to count them
  const lines = code.split('\n');
  
  const handleCursor = (e: any) => {
    const textarea = e.target;
    if (!textarea) return;
    const selectionStart = textarea.selectionStart;
    const value = textarea.value;
    const line = value.substring(0, selectionStart).split('\n').length;
    setCurrentLine(line);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const LINE_HEIGHT = 21;
  const PADDING_Y = 16;

  return (
    <div className="h-full overflow-auto bg-[#1e1e1e] relative group">
      <div className="flex min-h-full font-mono text-sm relative">
        {/* Line Numbers Gutter */}
        <div 
          className="shrink-0 flex flex-col items-end bg-[#262626] border-r border-[#3D3D3D] select-none sticky left-0 z-10"
          style={{ 
            paddingTop: PADDING_Y, 
            paddingBottom: PADDING_Y,
            minWidth: '3rem',
          }}
        >
          {lines.map((_, i) => (
            <div 
              key={i} 
              className={`w-full pr-3 text-[12px] leading-[21px] transition-colors text-right ${
                currentLine === i + 1 ? 'text-[#ED225D] font-bold' : 'text-gray-600'
              }`}
              style={{ height: LINE_HEIGHT }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0 relative">
          <div 
            className="absolute left-0 right-0 bg-[#ED225D]/10 pointer-events-none transition-all duration-75 border-l-2 border-[#ED225D]"
            style={{ 
              top: PADDING_Y + (currentLine - 1) * LINE_HEIGHT, 
              height: LINE_HEIGHT,
              width: '100%',
              zIndex: 0
            }}
          />

          <Editor
            value={code}
            onValueChange={onChange}
            highlight={(code) => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
            padding={PADDING_Y}
            className="font-mono min-h-full"
            style={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: 14,
              lineHeight: `${LINE_HEIGHT}px`,
              backgroundColor: 'transparent',
              whiteSpace: 'pre',
              minHeight: '100%'
            }}
            textareaClassName="focus:outline-none"
            onClick={handleCursor}
            onKeyUp={handleCursor}
            onSelect={handleCursor}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Floating Toolbar */}
      {!readOnly && (
        <div className="fixed bottom-20 right-4 z-20 flex gap-2">
           <div className="flex bg-[#2D2D2D]/90 backdrop-blur border border-[#3D3D3D] rounded-full shadow-xl p-1.5 items-center gap-1">
             <button 
                onClick={onUndo} 
                disabled={!canUndo}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 disabled:opacity-30 transition-colors"
             >
               <RotateCcw size={18} />
             </button>
             <button 
                onClick={onRedo} 
                disabled={!canRedo}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 disabled:opacity-30 transition-colors"
             >
               <RotateCw size={18} />
             </button>
             <div className="w-px h-4 bg-gray-600 mx-1"></div>
             <button 
                onClick={handleCopy} 
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 transition-colors relative"
             >
               {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
