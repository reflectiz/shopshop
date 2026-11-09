function activateInputHooks() {
    console.log('Input hooks activated');
    const input = document.getElementById('test-input');
    
    if (!input) {
        console.error('Input element not found');
        return;
    }
    
    // Get value (getter)
    const currentValue = input.value;
    console.log('Input value (getter):', currentValue);
    
    // Set value (setter)
    input.value = 'Test value';
    console.log('Input value (setter) set to:', input.value);
    
    // Get nodeValue (getter)
    const nodeValue = input.nodeValue;
    console.log('Input nodeValue (getter):', nodeValue);
    
    // Set nodeValue (setter)
    input.nodeValue = 'Test nodeValue';
    console.log('Input nodeValue (setter) set to:', input.nodeValue);
    
    // Set onkeydown handler
    input.onkeydown = function(event) {
        console.log('Input onkeydown triggered', event.key);
    };
    
    // Set onkeypress handler
    input.onkeypress = function(event) {
        console.log('Input onkeypress triggered', event.key);
    };
    
    // Set onkeyup handler
    input.onkeyup = function(event) {
        console.log('Input onkeyup triggered', event.key);
    };
    
    // Set oninput handler
    input.oninput = function(event) {
        console.log('Input oninput triggered', event.target.value);
    };
    
    // Set onchange handler
    input.onchange = function(event) {
        console.log('Input onchange triggered', event.target.value);
    };
    
    // Trigger events programmatically
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
        input.dispatchEvent(keyEvent);
    }, 100);
    
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'a', bubbles: true });
        input.dispatchEvent(keyEvent);
    }, 200);
    
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keyup', { key: 'a', bubbles: true });
        input.dispatchEvent(keyEvent);
    }, 300);
    
    setTimeout(() => {
        input.value = 'Changed value';
        const inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);
    }, 400);
    
    setTimeout(() => {
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
        
        // Signal completion after last setTimeout
        if (window.hookScriptComplete) {
            window.hookScriptComplete['inputHooks/index.js'] = true;
        }
    }, 500);
    console.log('Input hooks test completed');
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['inputHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateInputHooks);
} else {
    activateInputHooks();
}

