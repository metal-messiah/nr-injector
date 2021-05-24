const NREUM = {loader_config: {trustKey: "1"}, info: {beacon:"staging-bam-cell.nr-data.net",errorBeacon:"staging-bam-cell.nr-data.net",sa:1}}

chrome.runtime.sendMessage({type: 'localStorageKey'}, storageKey => {
    chrome.runtime.sendMessage({type: 'localStorage', data: {key: `${storageKey}_canTrack`}}, response => {
        const canTrack = !!Number(response);
        if (canTrack){
            const promises = [
                getLocalConfig('accountID', storageKey),
                getLocalConfig('agentID', storageKey),
                getLocalConfig('licenseKey', storageKey, true),
                getLocalConfig('applicationID', storageKey, true)
            ];
            
            Promise.all(promises).then(() => {
                const configString = `window.NREUM=window.NREUM||{};NREUM.loader_config=${JSON.stringify(NREUM.loader_config)};NREUM.info=${JSON.stringify(NREUM.info)}`
                prepend(configString, null)
                prepend(null, 'scripts/nr-loader-spa-1208.min.js')
            }).catch(err => {
                console.error(err);
            })
        } else {
            console.log("CANT TRACK! DONT INSERT SCRIPT")
        }
    })
})

const getLocalConfig = (key, storageKey, info = false) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: 'localStorage', data: {key: `${storageKey}_${key}`}}, data => { 
            if (!data) reject(`Can't inject NR... Empty Param... ${key}`)
            NREUM.loader_config[key] = data;
            if (info) NREUM.info[key] = data;
            resolve();
        })
    })
}

const prepend = (content, src, head=true) => {
    const injection = document.createElement('script');
    if (src) injection.src = chrome.extension.getURL(src);
    if (content) injection.innerHTML = content;
    injection.onload = function(){this.remove();};
    (head ? (document.head || document.documentElement) : document.documentElement).prepend(injection);
}