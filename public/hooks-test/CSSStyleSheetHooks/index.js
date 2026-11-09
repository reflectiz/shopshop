function activateCSSStyleSheetHooks() {
    console.log('CSSStyleSheet hooks activated');
    // Create a new CSSStyleSheet object
    const stylesheet = new CSSStyleSheet();
    
    // Get href (getter)
    console.log('CSSStyleSheet href (getter):', stylesheet.href);
    
    // Set href (setter)
    stylesheet.href = 'https://example.com/style.css';
    console.log('CSSStyleSheet href (setter) set to:', stylesheet.href);
    console.log('CSSStyleSheet hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['CSSStyleSheetHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['CSSStyleSheetHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateCSSStyleSheetHooks);
} else {
    activateCSSStyleSheetHooks();
}

