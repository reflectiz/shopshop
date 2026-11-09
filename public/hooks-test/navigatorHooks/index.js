const activateNavigatorHooks = () => {
    console.log('Navigator hooks activated');
    
    // getUserMedia - method
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: false, audio: false }).catch(() => {});
    }
    
    // doNotTrack - property (getter)
    const doNotTrack = navigator.doNotTrack;
    
    // getBattery - method
    if (navigator.getBattery) {
        navigator.getBattery().catch(() => {});
    }
    
    // language - property (getter)
    const language = navigator.language;
    
    // deviceMemory - property (getter)
    const deviceMemory = navigator.deviceMemory;
    
    // cookieEnabled - property (getter)
    const cookieEnabled = navigator.cookieEnabled;
    
    // hardwareConcurrency - property (getter)
    const hardwareConcurrency = navigator.hardwareConcurrency;
    
    // appVersion - property (getter)
    const appVersion = navigator.appVersion;
    
    // appCodeName - property (getter)
    const appCodeName = navigator.appCodeName;
    
    // appName - property (getter)
    const appName = navigator.appName;
    
    // mediaDevices - property (getter)
    const mediaDevices = navigator.mediaDevices;
    
    // platform - property (getter)
    const platform = navigator.platform;
    
    // vendor - property (getter)
    const vendor = navigator.vendor;
    
    // connection - property (getter)
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    // userAgent - property (getter)
    const userAgent = navigator.userAgent;
    
    // languages - property (getter)
    const languages = navigator.languages;
    
    // sendBeacon - method
    navigator.sendBeacon('/test', 'test');
    
    // getGamepads - method
    navigator.getGamepads();
    
    // vibrate - method
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
    
    // javaEnabled - method
    const javaEnabled = navigator.javaEnabled();
    
    console.log('Navigator hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['navigatorHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['navigatorHooks/index.js'] = false;

// Auto-activate when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateNavigatorHooks);
} else {
    activateNavigatorHooks();
}

