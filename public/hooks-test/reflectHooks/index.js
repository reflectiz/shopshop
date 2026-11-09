function activateReflectHooks() {
    console.log('Reflect hooks activated');
    // Test Reflect.defineProperty
    const success = Reflect.defineProperty(window, 'fetch', {
        value: function(...args) {
            console.log('Custom fetch called', args);
            return window.fetch.apply(this, args);
        },
        writable: true,
        enumerable: true,
        configurable: true
    });
    console.log('Reflect.defineProperty called, success:', success, 'property:', window.fetch);
    console.log('Reflect hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['reflectHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['reflectHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateReflectHooks);
} else {
    activateReflectHooks();
}

