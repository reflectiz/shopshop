const activateWindowHooks = () => {
    console.log('Window hooks activated');
    
    // Existing property getters
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const outerWidth = window.outerWidth;
    const outerHeight = window.outerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const pageXOffset = window.pageXOffset;
    const pageYOffset = window.pageYOffset;
    const screenX = window.screenX;
    const screenY = window.screenY;
    const screenLeft = window.screenLeft;
    const screenTop = window.screenTop;
    
    window.atob('SGVsbG8=');
    window.atob('aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20=');
    
    window.btoa('Hello');
    window.btoa('https://www.example.com');
    
    const onload = window.onload;
    window.onload = function() { console.log('onload'); };
    
    const onerror = window.onerror;
    window.onerror = function() { console.log('onerror'); };
    
    const onmessage = window.onmessage;
    window.onmessage = function() { console.log('onmessage'); };
    
    window.setTimeout(() => {}, 100);
    
    const intervalId = window.setInterval(() => {}, 1000);
    clearInterval(intervalId);
    
    const rafId = window.requestAnimationFrame(() => {});
    cancelAnimationFrame(rafId);
    
    if (window.requestIdleCallback) {
        const idleId = window.requestIdleCallback(() => {});
        cancelIdleCallback(idleId);
    }
    
    window.queueMicrotask(() => {});
    
    window.fetch('about:blank').catch(() => {});
    
    try {
        const ws = new window.WebSocket('wss://echo.websocket.org');
        ws.close();
    } catch (e) {
    }
    
    try {
        const worker = new window.Worker('data:text/javascript,console.log("test")');
        worker.terminate();
    } catch (e) {
    }
    
    const onkeydown = window.onkeydown;
    window.onkeydown = function() { console.log('onkeydown'); };
    
    const onkeypress = window.onkeypress;
    window.onkeypress = function() { console.log('onkeypress'); };
    
    const onkeyup = window.onkeyup;
    window.onkeyup = function() { console.log('onkeyup'); };
    
    window.scrollTo(0, 0);
    
    const fn = new window.Function('return 1+1');
    fn();
    
    const formData = new window.FormData();
    
    console.log('Window hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['windowHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['windowHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateWindowHooks);
} else {
    activateWindowHooks();
}