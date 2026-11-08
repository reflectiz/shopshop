const activateGeolocation = () => {
    console.log('Geolocation hooks activated');
    if (navigator.geolocation) {
        function success(position) {
            console.log('Geolocation success', position.coords.latitude, position.coords.longitude);
        }
        
        function error(err) {
            console.log('Geolocation error', err.message);
        }
        
        navigator.geolocation.getCurrentPosition(success, error);
        const watchId = navigator.geolocation.watchPosition(success, error);
        
        setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            
            // Signal completion after watch is cleared
            if (window.hookScriptComplete) {
                window.hookScriptComplete['geolocationHooks/index.js'] = true;
            }
        }, 5000);
    } else {
        console.log('Geolocation is not supported by this browser.');
        
        // Signal completion if not supported
        if (window.hookScriptComplete) {
            window.hookScriptComplete['geolocationHooks/index.js'] = true;
        }
    }
    console.log('Geolocation hooks test completed');
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['geolocationHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateGeolocation);
} else {
    activateGeolocation();
}
