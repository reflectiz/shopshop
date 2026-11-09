function activateImageHooks() {
    console.log('Image hooks activated');
    const img = document.getElementById('test-image');
    
    if (!img) {
        console.error('Image element not found');
        return;
    }

    console.log('Image src:', img.src);

    // Set src URL
    img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
    console.log('Image src set to:', img.src);
    console.log('Image hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['imageHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['imageHooks/index.js'] = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateImageHooks);
} else {
    activateImageHooks();
}

