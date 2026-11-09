function activateFormHooks() {
    const form = document.getElementById('test-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submit intercepted via event listener');
        return false;
    });
    
    if (!form) {
        console.error('Form element not found');
        return;
    }
    
    console.log('Form action (getter):', form.action);
    
    // TODO: Test this
    form.action = '#';
    console.log('Form action (setter) set to:', form.action);
    
    form.setAttribute('method', 'get');
    form.setAttribute('action', '#');
    console.log('Form setAttribute called, method:', form.getAttribute('method'));
    
    const originalSubmit = form.submit;
    form.onsubmit = function(e) {
        e.preventDefault();
        console.log('Form submit intercepted via onsubmit');
        return false;
    };
    
    console.log('Calling form.submit()...');
    form.submit();
    console.log('Form submit called');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['formHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['formHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateFormHooks);
} else {
    activateFormHooks();
}

