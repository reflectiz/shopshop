function activateMutationObserver() {
    console.log('MutationObserver hooks activated');
    const targetNode = document.body;
    
    const observer = new MutationObserver((mutations) => {
        console.log('MutationObserver callback triggered', mutations.length);
    });
    
    const config = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
    };
    
    observer.observe(targetNode, config);
    
    setTimeout(() => {
        const div = document.createElement('div');
        div.textContent = 'Test mutation';
        targetNode.appendChild(div);
    }, 100);
    
    setTimeout(() => {
        observer.disconnect();
        console.log('MutationObserver disconnected');
        
        // Signal completion after observer is disconnected
        if (window.hookScriptComplete) {
            window.hookScriptComplete['MutationObserverHooks/index.js'] = true;
        }
    }, 1000);
    
    console.log('MutationObserver hooks test completed');
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['MutationObserverHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateMutationObserver);
} else {
    activateMutationObserver();
}

