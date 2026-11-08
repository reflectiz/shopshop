function activateWorker() {
    console.log('Worker hooks activated');
    const workerCode = `
        self.onmessage = function(event) {
            self.postMessage('Worker received: ' + event.data);
        };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    const worker = new Worker(workerUrl);
    
    worker.onmessage = function(event) {
        console.log('Worker onmessage triggered', event.data);
    };
    
    worker.onerror = function(event) {
        console.log('Worker onerror triggered', event.message);
    };
    
    worker.postMessage('Hello Worker');
    
    setTimeout(() => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        console.log('Worker terminated');
        
        // Signal completion after worker is terminated
        if (window.hookScriptComplete) {
            window.hookScriptComplete['workerHooks/index.js'] = true;
        }
    }, 1000);
    console.log('Worker hooks test completed');
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['workerHooks/index.js'] = false;

// Activate on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateWorker);
} else {
    activateWorker();
}

