function activateLinkHooks() {
    console.log('Link hooks activated');
    const link = document.getElementById('test-link');
    
    if (!link) {
        console.error('Link element not found');
        return;
    }

    console.log('Link href:', link.href);
    
    // Get integrity (getter)
    console.log('Link integrity (getter):', link.integrity);
    
    // Set href URL
    link.href = 'https://example.com/style.css';
    console.log('Link href set to:', link.href);
        
    // Set integrity (setter)
    link.integrity = 'sha384-example-hash';
    console.log('Link integrity (setter) set to:', link.integrity);
    
    console.log('Link hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['linkHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['linkHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateLinkHooks);
} else {
    activateLinkHooks();
}

