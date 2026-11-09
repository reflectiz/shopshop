const activateDocumentHooks = () => {
    console.log('Document hooks activated');
    
    const location = document.location;
    document.location = document.location; 
    
    const onload = document.onload;
    document.onload = function() { console.log('onload'); };
    
    const onreadystatechange = document.onreadystatechange;
    document.onreadystatechange = function() { console.log('onreadystatechange'); };
    
    const onkeydown = document.onkeydown;
    document.onkeydown = function() { console.log('onkeydown'); };
    
    const onkeypress = document.onkeypress;
    document.onkeypress = function() { console.log('onkeypress'); };
    
    const onkeyup = document.onkeyup;
    document.onkeyup = function() { console.log('onkeyup'); };
    
    document.getElementById('test-id');
    
    document.getElementsByClassName('test-class');
    
    document.getElementsByTagName('div');
    
    document.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'div');
    
    document.querySelector('body');
    
    document.querySelectorAll('div');
    
    const cookie = document.cookie;
    document.cookie = 'test=value; path=/; max-age=3600';
    

    
    document.createElement('div');
    document.createElement('span');
    
    document.open();
    document.write('<div>test</div>');
    document.writeln('<div>testln</div>');
    document.close();
    console.log('Document hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['documentHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['documentHooks/index.js'] = false;

// Auto-activate when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateDocumentHooks);
} else {
    activateDocumentHooks();
}