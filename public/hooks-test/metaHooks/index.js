function activateMetaHooks() {
    console.log('Meta hooks activated');
    const meta = document.getElementById('test-meta');
    
    if (!meta) {
        console.error('Meta element not found');
        return;
    }
    
    // Get httpEquiv (getter)
    const currentHttpEquiv = meta.httpEquiv;
    console.log('Meta httpEquiv (getter):', currentHttpEquiv);
    
    // Set httpEquiv (setter)
    meta.httpEquiv = 'refresh';
    console.log('Meta httpEquiv (setter) set to:', meta.httpEquiv);
    console.log('Meta hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['metaHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['metaHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateMetaHooks);
} else {
    activateMetaHooks();
}

