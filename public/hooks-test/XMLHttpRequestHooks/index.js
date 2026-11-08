function activateXMLHttpRequest() {
    console.log('XMLHttpRequest hooks activated');
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        console.log('XMLHttpRequest onreadystatechange triggered', xhr.readyState);
    };
    
    xhr.onload = function() {
        console.log('XMLHttpRequest onload triggered', xhr.status);
    };
    
    xhr.onerror = function() {
        console.log('XMLHttpRequest onerror triggered');
    };
    
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1');
    xhr.send();
    console.log('XMLHttpRequest hooks test completed');
    
    // Signal completion after setup (XHR operations continue asynchronously)
    if (window.hookScriptComplete) {
        window.hookScriptComplete['XMLHttpRequestHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['XMLHttpRequestHooks/index.js'] = false;

// Activate on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateXMLHttpRequest);
} else {
    activateXMLHttpRequest();
}

