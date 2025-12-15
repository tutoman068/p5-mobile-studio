import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const [currentLine, setCurrentLine] = useState(1);

  // Split code into lines to count them
  const lines = code.split('\n');
  
  // Handle cursor movement to update current line
  const handleCursor = (e: any) => {
    const textarea = e.target;
    if (!textarea) return;
    
    const selectionStart = textarea.selectionStart;
    const value = textarea.value;
    
    // Calculate line number based on newline characters up to cursor
    const line = value.substring(0, selectionStart).split('\n').length;
    setCurrentLine(line);
  };

  const LINE_HEIGHT = 21; // Fixed line height for sync
  const PADDING_Y = 16;   // Top/Bottom padding

  // The structure here is crucial:
  // 1. Outer div is the scroll container.
  // 2. Inner div is a flex container with min-h-full. This allows it to grow if content is long,
  //    or stay full height if content is short.
  // 3. The Gutter is 'sticky' so it scrolls with content but stays visible horizontally? 
  //    Actually, standard sticky left-0 makes it float over horizontal scroll.
  //    But here we want vertical alignment.
  
  return (
    <div className="h-full overflow-auto bg-[#1e1e1e] relative">
      <div className="flex min-h-full font-mono text-sm relative">
        {/* Line Numbers Gutter */}
        <div 
          className="shrink-0 flex flex-col items-end bg-[#262626] border-r border-[#3D3D3D] select-none sticky left-0 z-10"
          style={{ 
            paddingTop: PADDING_Y, 
            paddingBottom: PADDING_Y,
            minWidth: '3rem',
            // No fixed height here, let it stretch with the parent flex container
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
          {/* Active Line Highlight Background */}
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
              whiteSpace: 'pre', // Disable wrapping to keep lines in sync with gutter
              minHeight: '100%'
            }}
            textareaClassName="focus:outline-none"
            onClick={handleCursor}
            onKeyUp={handleCursor}
            onSelect={handleCursor}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
