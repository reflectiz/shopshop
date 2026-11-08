function activateSelectHooks() {
    console.log('Select hooks activated');
    const select = document.getElementById('test-select');
    
    if (!select) {
        console.error('Select element not found');
        return;
    }
    
    // Get value (getter)
    const currentValue = select.value;
    console.log('Select value (getter):', currentValue);
    
    // Set value (setter)
    select.value = 'option2';
    console.log('Select value (setter) set to:', select.value);
    
    // Get nodeValue (getter)
    const nodeValue = select.nodeValue;
    console.log('Select nodeValue (getter):', nodeValue);
    
    // Set nodeValue (setter)
    select.nodeValue = 'Test nodeValue';
    console.log('Select nodeValue (setter) set to:', select.nodeValue);
    
    // Set onkeydown handler
    select.onkeydown = function(event) {
        console.log('Select onkeydown triggered', event.key);
    };
    
    // Set onkeypress handler
    select.onkeypress = function(event) {
        console.log('Select onkeypress triggered', event.key);
    };
    
    // Set onkeyup handler
    select.onkeyup = function(event) {
        console.log('Select onkeyup triggered', event.key);
    };
    
    // Set onchange handler
    select.onchange = function(event) {
        console.log('Select onchange triggered', event.target.value);
    };
    
    // Trigger events programmatically
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
        select.dispatchEvent(keyEvent);
    }, 100);
    
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
        select.dispatchEvent(keyEvent);
    }, 200);
    
    setTimeout(() => {
        const keyEvent = new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true });
        select.dispatchEvent(keyEvent);
    }, 300);
    
    setTimeout(() => {
        select.value = 'option3';
        const changeEvent = new Event('change', { bubbles: true });
        select.dispatchEvent(changeEvent);
    }, 400);
    
    // Test option properties
    setTimeout(() => {
        const options = select.options;
        if (options.length > 0) {
            const firstOption = options[0];
            
            // Get value (getter)
            const optionValue = firstOption.value;
            console.log('Option value (getter):', optionValue);
            
            // Set value (setter)
            firstOption.value = 'new-option-value';
            console.log('Option value (setter) set to:', firstOption.value);
            
            // Get selected (getter)
            const isSelected = firstOption.selected;
            console.log('Option selected (getter):', isSelected);
            
            // Set selected (setter)
            firstOption.selected = true;
            console.log('Option selected (setter) set to:', firstOption.selected);
            
            // Call getAttribute
            const valueAttr = firstOption.getAttribute('value');
            console.log('Option getAttribute("value"):', valueAttr);
        }
        
        // Signal completion after last setTimeout
        if (window.hookScriptComplete) {
            window.hookScriptComplete['selectHooks/index.js'] = true;
        }
    }, 500);
    console.log('Select hooks test completed');
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['selectHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateSelectHooks);
} else {
    activateSelectHooks();
}

