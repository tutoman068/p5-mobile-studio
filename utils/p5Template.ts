
import { AppFile } from '../types';

export const generateP5HTML = (mainCode: string, files: AppFile[]) => {
  // 1. Helper to build full path for a file
  const getFullPath = (file: AppFile, allFiles: AppFile[]): string => {
    if (!file.parentId) return file.name;
    const parent = allFiles.find(f => f.id === file.parentId);
    return parent ? `${getFullPath(parent, allFiles)}/${file.name}` : file.name;
  };

  // 2. Separate JS files and Assets
  // We ignore folders themselves, we only care about the files inside them
  const jsFiles = files.filter(f => f.type === 'javascript' && f.name !== 'sketch.js');
  const assets = files.filter(f => f.type === 'image' || f.type === 'video');

  // 3. Asset Replacement Logic
  // Replace "path/to/file.png" with blob:url
  let processedMainCode = mainCode;
  
  const replaceAssetsInCode = (code: string) => {
    let newCode = code;
    assets.forEach(asset => {
      const fullPath = getFullPath(asset, files);
      // Escape for regex
      const escapedPath = fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Match string literals containing the path
      // Note: This is a simple replacer. It might replace valid strings that aren't paths if they match exactly.
      const regex = new RegExp(`(['"])${escapedPath}(['"])`, 'g');
      newCode = newCode.replace(regex, `$1${asset.content}$2`);
      
      // Also try replacing just the filename if it's in the root or user didn't use full path (optional fallback)
      if (!asset.parentId) {
         const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
         const regexName = new RegExp(`(['"])${escapedName}(['"])`, 'g');
         newCode = newCode.replace(regexName, `$1${asset.content}$2`);
      }
    });
    return newCode;
  };

  processedMainCode = replaceAssetsInCode(mainCode);
  
  let processedExtraJs = "";
  jsFiles.forEach(file => {
    processedExtraJs += `\n/* File: ${getFullPath(file, files)} */\n${replaceAssetsInCode(file.content)}\n`;
  });

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <style>
      body { 
        margin: 0; 
        padding: 0; 
        overflow: hidden; 
        background-color: #18181b; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh;
        width: 100vw;
        /* CRITICAL: Disables browser handling of gestures so p5 can use them */
        touch-action: none; 
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      canvas { 
        display: block; 
        touch-action: none;
      }
    </style>
    <script>
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        function sendToParent(type, args) {
          try {
            window.parent.postMessage({
              source: 'p5-runner',
              type: type,
              message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
            }, '*');
          } catch (e) { }
        }

        console.log = function(...args) {
          sendToParent('log', args);
          originalLog.apply(console, args);
        };

        console.error = function(...args) {
          sendToParent('error', args);
          originalError.apply(console, args);
        };

        console.warn = function(...args) {
          sendToParent('warn', args);
          originalWarn.apply(console, args);
        };

        window.onerror = function(msg, url, lineNo, columnNo, error) {
          sendToParent('error', [msg + ' (Line: ' + lineNo + ')']);
          return false;
        };
      })();
    </script>
  </head>
  <body>
    <script>
      document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
      ${processedExtraJs}
      try {
        ${processedMainCode}
      } catch (e) {
        console.error(e);
      }
    </script>
  </body>
</html>
`;
};

