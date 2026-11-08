function activateIframeHooks() {
    console.log('Iframe hooks activated');
    const iframe = document.getElementById('test-iframe');
    
    if (!iframe) {
        console.error('Iframe element not found');
        return;
    }

    console.log('Iframe src:', iframe.src);
    
    // Set src URL
    iframe.src = 'https://example.com';
    console.log('Iframe src set to:', iframe.src);
    console.log('Iframe hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['iframeHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['iframeHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateIframeHooks);
} else {
    activateIframeHooks();
}

