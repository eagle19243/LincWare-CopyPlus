init();

function init() {
    chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
    chrome.tabs.onActivated.addListener(onTabActivated);
    chrome.tabs.onUpdated.addListener(onTabUpdated);
    chrome.windows.onFocusChanged.addListener(onFocusChanged);
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // setValueToStorage({'map': {}});
    // setValueToStorage({'sources': []});
    // setValueToStorage({'destinations': []});
    reloadAllTabs();
    clearCache();
    setPopup();
}

async function setPopup() {
    const activeTab                         = await getActiveTab();

    if (activeTab === null) {
        return;
    }

    const items                             = await getValueFromStroage(['cache']);
    const isRegisteredAsSource              = await isURLRegisteredAsSource(activeTab.url);
    const isRegisteredAsDestination         = await isURLRegisteredAsDestination(activeTab.url);
    const isRegisteredAsSourceInMap         = await isURLRegisteredAsSourceInMap(activeTab.url);
    const isRegisteredAsDestinationInMap    = await isURLRegisteredAsDestinationInMap(activeTab.url);
    const isCopied                          = items.cache ? items.cache.is_copied: false;
    const copiedURL                         = items.cache ? items.cache.url: "";
    
    let sourceURL = "";
    if (isRegisteredAsDestination && isRegisteredAsDestinationInMap) {
        sourceURL = await getSourceURLByDestinationURLInMap(activeTab.url);
    }

    if (isRegisteredAsDestination && 
        isRegisteredAsDestinationInMap && 
        isCopied && 
        copiedURL.indexOf(sourceURL) > -1) {

        chrome.browserAction.setPopup({popup: "html/paste.html"});
    } else if (isRegisteredAsSource && isRegisteredAsSourceInMap) {
        chrome.browserAction.setPopup({popup: "html/copy.html"});
    } else {
        chrome.browserAction.setPopup({popup: "html/settings.html"});
    }
}

/**
 * Event when click extension icon
 */
function onBrowserActionClicked(tab) {
}

/**
 * Event when tab activated/focused
 */
function onTabActivated(activeInfo) {
    // enableExtension(false);
    setPopup();
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        // determineExtensionAvailability(tab);
    });

    
}

/**
 * Event when tab updated
 */
function onTabUpdated(tabId, changeInfo, tab) {
    // enableExtension(false);
    setPopup();
    // determineExtensionAvailability(tab);
}

/**
 * Event when currently focused window changes
 */
function onFocusChanged() {
    setPopup();
}

/**
 * Handle messages from content.js
 */
function handleMessage(request, sender, sendResponse) {
    if (request.action === 'Resetup_Popup') {
        setPopup();
    }
}

/**
 * Reload all open tabs
 */
function reloadAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            chrome.tabs.reload(tab.id);
        }
    });
}

/**
 * Determine Extension availability
 * @param {object} tab 
 */
function determineExtensionAvailability(tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'Get_Extension_Availability'}, (response) => {
        if (!response) {
            enableExtension(false);
        } else {
            enableExtension(response.enable);
        }
    });
}

/**
 * Enable extension and change extension icon according to param value
 * @param {boolean} shouldEnable 
 */
function enableExtension(shouldEnable) {
    if (shouldEnable) {
        chrome.browserAction.setIcon({path: 'images/icon-48.png'});
        chrome.browserAction.enable();
    } else {
        chrome.browserAction.setIcon({path: 'images/icon-gray-48.png'});
        chrome.browserAction.disable();
    }
}