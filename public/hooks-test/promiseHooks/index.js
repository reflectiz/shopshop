const handlePromise = (promise) => {
    promise.then((result) => {
        console.log('Promise resolved', result);
    })
    .catch((error) => {
        console.log('Promise rejected', error);
    })
    .finally(() => {
        console.log('Promise finally');
    });
};

const activatePromise = () => {
    console.log('Promise hooks activated');
    const promise1 = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Promise resolved');
        }, 1000);
    });

    handlePromise(promise1);

    const promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Promise rejected');
        }, 2000);
    });

    handlePromise(promise2);
    console.log('Promise hooks test completed');
    
    // Signal completion after promises are set up (they continue asynchronously)
    setTimeout(() => {
        if (window.hookScriptComplete) {
            window.hookScriptComplete['promiseHooks/index.js'] = true;
        }
    }, 2500); // Wait for both promises to complete (2000ms max + buffer)
};

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['promiseHooks/index.js'] = false;

activatePromise();