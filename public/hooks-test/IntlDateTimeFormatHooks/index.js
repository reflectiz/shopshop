function activateIntlDateTimeFormatHooks() {
    console.log('Intl.DateTimeFormat hooks activated');
    // Create an Intl.DateTimeFormat object
    const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Call resolvedOptions
    const options = dateTimeFormat.resolvedOptions();
    console.log('Intl.DateTimeFormat resolvedOptions called, options:', options);
    console.log('Intl.DateTimeFormat hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['IntlDateTimeFormatHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['IntlDateTimeFormatHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateIntlDateTimeFormatHooks);
} else {
    activateIntlDateTimeFormatHooks();
}

