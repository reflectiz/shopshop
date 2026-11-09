function activateBluetoothHooks() {
    console.log('Bluetooth hooks activated');
    if (!navigator.bluetooth) {
        console.error('Bluetooth API is not supported in this browser');
        return;
    }
    
    // Call getAvailability
    navigator.bluetooth.getAvailability()
        .then((available) => {
            console.log('Bluetooth getAvailability called, available:', available);
        })
        .catch((error) => {
            console.log('Bluetooth getAvailability error:', error.message);
        });
    
    // Call requestDevice
    // Note: requestDevice requires user interaction, but we call it anyway to trigger the hook
    // The error is expected and the hook will still be intercepted
    console.log('Calling navigator.bluetooth.requestDevice...');
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true
    })
        .then((device) => {
            console.log('Bluetooth requestDevice called, device:', device);
        })
        .catch((error) => {
            console.log('Bluetooth requestDevice error (expected - requires user interaction):', error.message);
        });
    
    // Call getDevices
    navigator.bluetooth.getDevices()
        .then((devices) => {
            console.log('Bluetooth getDevices called, devices:', devices);
        })
        .catch((error) => {
            console.log('Bluetooth getDevices error:', error.message);
            
            // Signal completion after all async operations are initiated
            if (window.hookScriptComplete) {
                window.hookScriptComplete['bluetoothHooks/index.js'] = true;
            }
        });
    console.log('Bluetooth hooks test completed');
    
    // Signal completion after setup (Bluetooth operations continue asynchronously)
    // Also set it in the catch above as a fallback
    setTimeout(() => {
        if (window.hookScriptComplete && !window.hookScriptComplete['bluetoothHooks/index.js']) {
            window.hookScriptComplete['bluetoothHooks/index.js'] = true;
        }
    }, 1000);
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['bluetoothHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateBluetoothHooks);
} else {
    activateBluetoothHooks();
}

