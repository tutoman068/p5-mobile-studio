export const generateP5HTML = (code: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <style>
      body { margin: 0; padding: 0; overflow: hidden; background-color: #18181b; display: flex; justify-content: center; align-items: center; height: 100vh; }
      canvas { display: block; }
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
            // circular reference or other error
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
      try {
        ${code}
      } catch (e) {
        console.error(e);
      }
    </script>
  </body>
</html>
`;