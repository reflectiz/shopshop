function activateRangeHooks() {
    console.log('Range hooks activated');
    const container = document.getElementById('test-container');
    
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    // Create a Range object
    const range = document.createRange();
    
    // Set the range to contain the container
    range.selectNodeContents(container);
    
    // Call createContextualFragment
    const fragment = range.createContextualFragment('<p>New fragment content</p>');
    console.log('Range createContextualFragment called, fragment:', fragment);
    
    // Append the fragment to demonstrate it works
    // container.appendChild(fragment);
    // console.log('Range hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['rangeHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['rangeHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateRangeHooks);
} else {
    activateRangeHooks();
}

