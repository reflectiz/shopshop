const activateLocationHooks = () => {
    console.log('Location hooks activated');
    
    // Define all storage keys that need to be set
    const allStorageKeys = [
        'locationHrefExecuted',
        'locationSearchExecuted',
        'locationProtocolExecuted',
        'locationHostExecuted',
        'locationHostnameExecuted',
        'locationPortExecuted',
        'locationPathnameExecuted',
        'locationHashExecuted',
        'locationAssignExecuted',
        'locationReplaceExecuted',
        'locationReloadExecuted'
    ];
    
    // Check if all keys are present
    const allKeysPresent = allStorageKeys.every(key => sessionStorage.getItem(key) === 'true');
    
    // If all keys are present, we're done - signal completion
    if (allKeysPresent) {
        console.log('Location hooks test completed - all operations executed');
        // Signal completion to the script loader
        if (window.hookScriptComplete) {
            window.hookScriptComplete['locationHooks/index.js'] = true;
        }
        return true;
    }
    
    // Get current values
    const href = location.href;
    const pathname = location.pathname;
    const search = location.search;
    const hash = location.hash;
    const hostname = location.hostname;
    const protocol = location.protocol;
    const port = location.port;
    const host = location.host;
    
    // Define operations in order of execution
    const operations = [
        {
            key: 'locationHrefExecuted',
            name: 'Location.href setter',
            execute: () => {
                sessionStorage.setItem('locationHrefExecuted', 'true');
                setTimeout(() => {
                    location.href = href;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationSearchExecuted',
            name: 'Location.search setter',
            execute: () => {
                sessionStorage.setItem('locationSearchExecuted', 'true');
                setTimeout(() => {
                    location.search = search;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationProtocolExecuted',
            name: 'Location.protocol setter',
            execute: () => {
                sessionStorage.setItem('locationProtocolExecuted', 'true');
                setTimeout(() => {
                    location.protocol = protocol;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationHostExecuted',
            name: 'Location.host setter',
            execute: () => {
                sessionStorage.setItem('locationHostExecuted', 'true');
                setTimeout(() => {
                    location.host = host;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationHostnameExecuted',
            name: 'Location.hostname setter',
            execute: () => {
                sessionStorage.setItem('locationHostnameExecuted', 'true');
                setTimeout(() => {
                    location.hostname = hostname;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationPortExecuted',
            name: 'Location.port setter',
            execute: () => {
                sessionStorage.setItem('locationPortExecuted', 'true');
                setTimeout(() => {
                    location.port = port;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationPathnameExecuted',
            name: 'Location.pathname setter',
            execute: () => {
                sessionStorage.setItem('locationPathnameExecuted', 'true');
                setTimeout(() => {
                    location.pathname = pathname;
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationHashExecuted',
            name: 'Location.hash setter',
            execute: () => {
                sessionStorage.setItem('locationHashExecuted', 'true');
                location.hash = hash;
                // Recursively call after a short delay
                setTimeout(() => activateLocationHooks(), 100);
            }
        },
        {
            key: 'locationAssignExecuted',
            name: 'Location.assign() method',
            execute: () => {
                sessionStorage.setItem('locationAssignExecuted', 'true');
                setTimeout(() => {
                    location.assign(location.href);
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationReplaceExecuted',
            name: 'Location.replace() method',
            execute: () => {
                sessionStorage.setItem('locationReplaceExecuted', 'true');
                setTimeout(() => {
                    location.replace(location.href);
                    // Recursively call after navigation
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        },
        {
            key: 'locationReloadExecuted',
            name: 'Location.reload() method',
            execute: () => {
                sessionStorage.setItem('locationReloadExecuted', 'true');
                setTimeout(() => {
                    location.reload();
                    // Recursively call after reload
                    setTimeout(() => activateLocationHooks(), 100);
                }, 0);
            }
        }
    ];
    
    // Find the first operation that hasn't been executed
    const nextOperation = operations.find(op => !sessionStorage.getItem(op.key));
    
    if (nextOperation) {
        console.log(`${nextOperation.name} executed`);
        nextOperation.execute();
    } else {
        // All operations should be executed, but double-check
        console.log('All operations executed, verifying...');
        setTimeout(() => activateLocationHooks(), 100);
    }
}

// Initialize completion tracking
if (!window.hookScriptComplete) {
    window.hookScriptComplete = {};
}
window.hookScriptComplete['locationHooks/index.js'] = false;

// Start the recursive function
activateLocationHooks()