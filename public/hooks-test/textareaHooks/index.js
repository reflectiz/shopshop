function activateTextareaHooks() {
    console.log('Textarea hooks activated');
    const textarea = document.getElementById('test-textarea');
    
    if (!textarea) {
        console.error('Textarea element not found');
        return;
    }
    
    // Get value (getter)
    const currentValue = textarea.value;
    console.log('Textarea value (getter):', currentValue);
    
    // Set value (setter)
    textarea.value = 'Test value';
    console.log('Textarea value (setter) set to:', textarea.value);
    
    // Get nodeValue (getter)
    const nodeValue = textarea.nodeValue;
    console.log('Textarea nodeValue (getter):', nodeValue);
    
    // Set nodeValue (setter)
    textarea.nodeValue = 'Test nodeValue';
    console.log('Textarea nodeValue (setter) set to:', textarea.nodeValue);
    
    // Set onkeydown handler
    textarea.onkeydown = function(event) {
        console.log('Textarea onkeydown triggered', event.key);
    };
    
    // Set onkeypress handler
    textarea.onkeypress = function(event) {
        console.log('Textarea onkeypress triggered', event.key);
    };
    
    // Set onkeyup handler
    textarea.onkeyup = function(event) {
        console.log('Textarea onkeyup triggered', event.key);
    };
    
    // Set onchange handler
    textarea.onchange = function(event) {
        console.log('Textarea onchange triggered', event.target.value);
    };
    
    // Trigger events programmatically
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
        textarea.dispatchEvent(keyEvent);
    }, 100);
    
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'a', bubbles: true });
        textarea.dispatchEvent(keyEvent);
    }, 200);
    
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keyup', { key: 'a', bubbles: true });
        textarea.dispatchEvent(keyEvent);
    }, 300);
    
    setTimeout(() => {
        textarea.value = 'Changed value';
        const changeEvent = new Event('change', { bubbles: true });
        textarea.dispatchEvent(changeEvent);
        
        // Signal completion after last setTimeout
        if (window.hookScriptComplete) {
            window.hookScriptComplete['textareaHooks/index.js'] = true;
        }
    }, 400);
    console.log('Textarea hooks test completed');
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['textareaHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateTextareaHooks);
} else {
    activateTextareaHooks();
}

