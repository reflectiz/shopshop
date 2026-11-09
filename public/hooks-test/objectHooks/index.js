function activateObjectHooks() {
    console.log('Object hooks activated');
    // Test Object.defineProperty
    const obj1 = {};
    Object.defineProperty(obj1, 'testProp', {
        value: 'test value',
        writable: true,
        enumerable: true,
        configurable: true
    });
    console.log('Object.defineProperty called, property:', obj1.testProp);
    
    // Test Object.defineProperties
    const obj2 = {};
    Object.defineProperties(obj2, {
        prop1: {
            value: 'value1',
            writable: true,
            enumerable: true,
            configurable: true
        },
        prop2: {
            value: 'value2',
            writable: true,
            enumerable: true,
            configurable: true
        }
    });
    console.log('Object.defineProperties called, properties:', Object.keys(obj2));
    console.log('Object hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['objectHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['objectHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateObjectHooks);
} else {
    activateObjectHooks();
}

