let jwt, appid, jsessionid, jwtCopy, appidCopy, jsessionIdCopy;

function init() {
    jwt = document.querySelector("#jwt");
    appid = document.querySelector("#appid");
    jsessionid = document.querySelector("#jsessionid");

    jwtCopy = document.querySelector("#jwt-copy");
    appidCopy = document.querySelector("#appid-copy");
    jsessionidCopy = document.querySelector("#jsessionid-copy");

    jwtCopy.onclick = () => {
        jwt.select();
        document.execCommand('copy');
    }
    appidCopy.onclick = () => {
        appid.select();
        document.execCommand('copy');
    }
    jsessionidCopy.onclick = () => {
        jsessionid.select();
        document.execCommand('copy');
    }

    getBearerToken();
}

async function getBearerToken() {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };
    const url = 'https://deledge.test.commerce.nikecloud.com/recommend/apollo_tokens/v1';

    const response = await fetch(url, {
        method: 'POST',
        headers
    })
    const json = await response.json();
    const { jwt: token, appId } = json;
    jwt.value = `Bearer ${token}`;
    appid.value = appId;

    chrome.cookies.getAll({ name: 'JSESSIONID', domain: 'adminops-int.test.commerce.nikecloud.com' }, (cookies) => {
        if (cookies.length > 0) {
            jsessionid.value = `JSESSIONID=${cookies[0].value}`;
        }
    })
}

function getActiveTab(cb) {
    chrome.tabs.query({ active: true, currentWindow: true }, cb);
}

window.onload = () => init()