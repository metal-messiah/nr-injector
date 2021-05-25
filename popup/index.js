const messageTypes = {
    localStorage: 'localStorage',
    localStorageKey: 'localStorageKey',
    setLocalStorage: 'setLocalStorage',
}

const canTrack = async () => {
    return !!Number(await getLocalStorage('canTrack'))
}

const getLocalStorage = (key) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: messageTypes.localStorageKey}, storageKey => {
            chrome.runtime.sendMessage({type: messageTypes.localStorage, data: {key: `${storageKey}_${key}`}}, data => {
                resolve(data);
            })
        })
    })
}

const setInputValue = (selector, value) => {
    document.querySelector(selector).value = value || "";
}

const setLabel = canTrack => {
    document.querySelector("#canTrack").innerHTML = canTrack ? 'On' : 'Off';
}

const setLocalStorage = (data) => {
    chrome.runtime.sendMessage({type: messageTypes.localStorageKey}, storageKey => {
        chrome.runtime.sendMessage({type: messageTypes.setLocalStorage, data: {...data, key: `${storageKey}_${data.key}`}})
    })
}

window.addEventListener('load', async () => {
    setLabel(await canTrack());

    setInputValue("#accountID", await getLocalStorage('accountID'))
    setInputValue("#agentID", await getLocalStorage('agentID'))
    setInputValue("#licenseKey", await getLocalStorage('licenseKey'))
    setInputValue("#applicationID", await getLocalStorage('applicationID'))

    // TODO -- get other versions of agent, link to select elem

    document.querySelector("#btn").addEventListener("click", async () => {
        const ct = await canTrack();
        const newCanTrack = !ct;
        setLabel(newCanTrack);
        setLocalStorage({key: `canTrack`, val: Number(newCanTrack)})

        if (!!newCanTrack){
            document.querySelector("#helper-text").innerText = "Reload the page to START tracking"
        } else {
            document.querySelector("#helper-text").innerText = "Reload the page to STOP tracking"
        }
    })

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (val) => {
            const newValue = val.target.value;
            const elemID = val.target.id;
            setLocalStorage({key: elemID, val: newValue})
            
            document.querySelector("#helper-text").innerText = "Reload the page to see changes"
        })
    })
})
