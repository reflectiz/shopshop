const activateStorageHooks = () => {
    console.log('Storage hooks activated');
    const localStorage = window.localStorage;
    const sessionStorage = window.sessionStorage;

    console.log('Local Storage:', localStorage);
    console.log('Session Storage:', sessionStorage);

    localStorage.setItem('test', 'test');
    sessionStorage.setItem('test', 'test');

    console.log('Local Storage (setter):', localStorage.getItem('test'));
    console.log('Session Storage (setter):', sessionStorage.getItem('test'));

    localStorage.removeItem('test');
    sessionStorage.removeItem('test');

    console.log('Storage hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['storageHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['storageHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateStorageHooks);
} else {
    activateStorageHooks();
}
