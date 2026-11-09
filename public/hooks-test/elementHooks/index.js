const activateElementHooks = () => {
    console.log('Element hooks activated');
    
    // Create test elements for DOM manipulation
    const testElement = document.createElement('div');
    testElement.id = 'test-element';
    document.body.appendChild(testElement);
    
    const childElement1 = document.createElement('span');
    const childElement2 = document.createElement('span');
    const childElement3 = document.createElement('span');
    const siblingElement = document.createElement('div');
    
    // onload - getter and setter
    const onload = testElement.onload;
    testElement.onload = function() { console.log('onload'); };
    
    // value - getter and setter
    const value = testElement.value;
    testElement.value = 'test-value';
    
    // getAttribute - method
    testElement.getAttribute('id');
    
    // setAttribute - method
    testElement.setAttribute('data-test', 'value');
    
    // focus - method
    if (testElement.focus) {
        testElement.focus();
    }
    
    // appendChild - method
    testElement.appendChild(childElement1);
    
    // replaceChild - method
    testElement.replaceChild(childElement2, childElement1);
    
    // insertBefore - method
    testElement.insertBefore(childElement3, childElement2);
    
    // removeChild - method
    testElement.removeChild(childElement2);
    
    // replaceChildren - method
    const newChild = document.createElement('span');
    testElement.replaceChildren(newChild);
    
    // replaceWith - method
    const replacementElement = document.createElement('div');
    newChild.replaceWith(replacementElement);
    
    // prepend - method
    const prependElement = document.createElement('span');
    testElement.prepend(prependElement);
    
    // append - method
    const appendElement = document.createElement('span');
    testElement.append(appendElement);
    
    // insertAdjacentElement - method
    const adjacentElement = document.createElement('span');
    testElement.insertAdjacentElement('beforeend', adjacentElement);
    
    // after - method
    const afterElement = document.createElement('div');
    testElement.after(afterElement);
    
    // before - method
    const beforeElement = document.createElement('div');
    testElement.before(beforeElement);
    
    // remove - method
    afterElement.remove();
    beforeElement.remove();
    
    // innerText - getter and setter
    const innerText = testElement.innerText;
    testElement.innerText = 'test innerText';
    
    // textContent - getter and setter
    const textContent = testElement.textContent;
    testElement.textContent = 'test textContent';
    
    // outerText - getter and setter
    const outerText = testElement.outerText;
    testElement.outerText = 'test outerText';
    
    // innerHTML - getter and setter
    const innerHTML = testElement.innerHTML;
    testElement.innerHTML = '<span>test</span>';
    
    // outerHTML - getter and setter (need a separate element that's in the DOM)
    const outerHTMLElement = document.createElement('div');
    outerHTMLElement.id = 'outer-html-test';
    document.body.appendChild(outerHTMLElement);
    const outerHTML = outerHTMLElement.outerHTML;
    outerHTMLElement.outerHTML = '<div id="outer-html-test">test</div>';
    
    console.log('Element hooks test completed');
    
    // Signal completion to the script loader
    if (window.hookScriptComplete) {
        window.hookScriptComplete['elementHooks/index.js'] = true;
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['elementHooks/index.js'] = false;

// Auto-activate when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateElementHooks);
} else {
    activateElementHooks();
}