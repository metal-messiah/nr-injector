const bg = chrome.extension.getBackgroundPage();
const messageTypes = {
    localStorage: 'localStorage',
    localStorageKey: 'localStorageKey',
    setLocalStorage: 'setLocalStorage',
}
const storageKey = 'nr-inserter';

const canTrack = () => !!Number(bg.window.localStorage.getItem(`${storageKey}_canTrack`));

const getLocalStorage = (key) => {
    return window.localStorage.getItem(key);
}

const setLocalStorage = (key, val) => {
    window.localStorage.setItem(key, val);
}

chrome.runtime.onMessage.addListener(({type, data}, sender, sendResponse) => {
    switch(type){
        case messageTypes.localStorage:
            const val = getLocalStorage(data.key);
            sendResponse(val);
            break;
        case messageTypes.localStorageKey:
            sendResponse(storageKey);
            break;
        case messageTypes.setLocalStorage:
            setLocalStorage(data.key, data.val);
            break;
    }
})
