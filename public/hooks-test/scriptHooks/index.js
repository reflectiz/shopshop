function activateScriptHooks() {
    console.log('Script hooks activated');
    const script = document.getElementById('test-script');
    
    if (!script) {
        console.error('Script element not found');
        return;
    }
    
    // Get src (getter)
    console.log('Script src (getter):', script.src);
    
    // Set src (setter)
    script.src = 'https://example.com/script.js';
    console.log('Script src (setter) set to:', script.src);
    
    // Get integrity (getter)
    console.log('Script integrity (getter):', script.integrity);
    
    // Set integrity (setter)
    script.integrity = 'sha384-example-hash';
    console.log('Script integrity (setter) set to:', script.integrity);
    
    // Get innerHTML (getter)
    console.log('Script innerHTML (getter):', script.innerHTML);
    
    // Set innerHTML (setter)
    script.innerHTML = 'console.log("test");';
    console.log('Script innerHTML (setter) set to:', script.innerHTML);
    
    // Get outerHTML (getter)
    console.log('Script outerHTML (getter):', script.outerHTML);
    
    // Set outerHTML (setter)
    script.outerHTML = '<script id="test-script">console.log("new");</script>';
    console.log('Script outerHTML (setter) set');
    
    // Get innerText (getter)
    const newScript = document.getElementById('test-script');
    if (newScript) {
        console.log('Script innerText (getter):', newScript.innerText);
        
        // Set innerText (setter)
        newScript.innerText = 'console.log("innerText");';
        console.log('Script innerText (setter) set to:', newScript.innerText);
        
        // Get textContent (getter)
        console.log('Script textContent (getter):', newScript.textContent);
        
        // Set textContent (setter)
        newScript.textContent = 'console.log("textContent");';
        console.log('Script textContent (setter) set to:', newScript.textContent);
        
        // Get text (getter)
        console.log('Script text (getter):', newScript.text);
        
        // Set text (setter)
        newScript.text = 'console.log("text");';
        console.log('Script text (setter) set to:', newScript.text);
    }
    console.log('Script hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['scriptHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['scriptHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateScriptHooks);
} else {
    activateScriptHooks();
}

