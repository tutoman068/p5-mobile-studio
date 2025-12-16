
import { AppFile } from '../types';

export const generateP5HTML = (mainCode: string, files: AppFile[]) => {
  // 1. Separate JS files and Assets
  const jsFiles = files.filter(f => f.type === 'javascript' && f.name !== 'sketch.js');
  const assets = files.filter(f => f.type === 'image' || f.type === 'video');

  // 2. Prepare Asset Replacement Logic
  // We need to replace string literals in the code that match asset filenames with their blob URLs
  let processedMainCode = mainCode;
  let processedExtraJs = "";

  // Helper to replace filenames in code
  const replaceAssetsInCode = (code: string) => {
    let newCode = code;
    assets.forEach(asset => {
      // Regex looks for "filename.ext" or 'filename.ext'
      // We escape the filename to be regex safe
      const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(['"])${escapedName}(['"])`, 'g');
      newCode = newCode.replace(regex, `$1${asset.content}$2`);
    });
    return newCode;
  };

  processedMainCode = replaceAssetsInCode(mainCode);
  
  // 3. Concatenate extra JS files (Classes, etc.) BEFORE the main script
  jsFiles.forEach(file => {
    processedExtraJs += `\n/* File: ${file.name} */\n${replaceAssetsInCode(file.content)}\n`;
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
      // Capture console logs and errors to send back to parent
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
          } catch (e) {
            // circular reference
          }
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
      // Prevent default touch behaviors in the iframe
      document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
      
      // Inject Extra JS Files (Classes, Utilities)
      ${processedExtraJs}

      // Main Sketch
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
