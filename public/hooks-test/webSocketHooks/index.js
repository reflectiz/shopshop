function activateWebSocket() {
    console.log('WebSocket hooks activated');
    const ws = new WebSocket('wss://echo.websocket.org');
    
    ws.onerror = function(event) {
        console.log('WebSocket onerror triggered', event);
    };
    
    ws.onmessage = function(event) {
        console.log('WebSocket onmessage triggered', event.data);
    };
    
    ws.onopen = function(event) {
        console.log('WebSocket onopen triggered');
        ws.send('Hello WebSocket');
    };
    
    ws.onclose = function(event) {
        console.log('WebSocket onclose triggered', event.code, event.reason);
    };
    console.log('WebSocket hooks test completed');
    
    // Signal completion after setup (WebSocket operations continue asynchronously)
    if (window.hookScriptComplete) {
        window.hookScriptComplete['webSocketHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['webSocketHooks/index.js'] = false;

// Activate on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateWebSocket);
} else {
    activateWebSocket();
}

