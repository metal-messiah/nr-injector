let jwt, appid, jsessionid, lastRefreshed, goesStale, jwtCopy, appidCopy, jsessionIdCopy;

const RELOAD_PAGE = 1200000;

const localStorageKey = 'apolloCredentials';

async function init() {
  jwt = document.querySelector('#jwt');
  appid = document.querySelector('#appid');
  jsessionid = document.querySelector('#jsessionid');
  lastRefreshed = document.querySelector('#last-refreshed');
  goesStale = document.querySelector('#goes-stale');

  jwtCopy = document.querySelector('#jwt-copy');
  appidCopy = document.querySelector('#appid-copy');
  jsessionidCopy = document.querySelector('#jsessionid-copy');

  jwtCopy.onclick = () => {
    jwt.select();
    document.execCommand('copy');
  };
  appidCopy.onclick = () => {
    appid.select();
    document.execCommand('copy');
  };
  jsessionidCopy.onclick = () => {
    jsessionid.select();
    document.execCommand('copy');
  };
  setPageTimestamps();
  getApolloPage();
}

async function getApolloPage() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ url: 'https://adminops-int.test.commerce.nikecloud.com/*' }, tabs => {
      if (isStale()) {
        if (tabs.length && tabs[0].id) {
          // page exists, return first page it finds
          chrome.tabs.reload(tabs[0].id);
          resolve(tabs[0]);
        } else {
          chrome.tabs.create({ active: false, url: 'https://adminops-int.test.commerce.nikecloud.com/apollov1' }, tab => {
            resolve(tab);
          });
        }
      } else {
        console.log('not stale, just reload it');
        setPage();
      }
    });
  });
}

async function getData() {
  console.log('REFETCH THE PAGE STUFF');
  setTimestamps();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const url = 'https://deledge.test.commerce.nikecloud.com/recommend/apollo_tokens/v1';

  const response = await fetch(url, {
    method: 'POST',
    headers,
  });
  const json = await response.json();
  const { jwt: token, appId } = json;
  setToken('jwt', `Bearer ${token}`);
  setToken('appid', appId);
  setPage();

  chrome.cookies.getAll({ name: 'JSESSIONID', domain: 'adminops-int.test.commerce.nikecloud.com' }, cookies => {
    if (cookies.length > 0) {
      console.log(cookies[0]);
      setToken('jsessionid', `JSESSIONID=${cookies[0].value}`);
      setPage();
    }
  });
}

function isStale() {
  const lastUpdated = new Date(getToken('refreshed'));
  const now = new Date();
  return now - lastUpdated > RELOAD_PAGE;
}

function setPage() {
  jwt.value = getToken('jwt');
  appid.value = getToken('appid');
  jsessionid.value = getToken('jsessionid');

  setPageTimestamps();
}

function setPageTimestamps(){
  const refreshed = new Date(getToken('refreshed'));
  const stale = new Date(refreshed);
  stale.setMilliseconds(stale.getMilliseconds() + RELOAD_PAGE);
  lastRefreshed.innerHTML = `<b>Last Refreshed:</b> ${refreshed.toLocaleString()}`;
  goesStale.innerHTML = `<span><b>Tokens Go Stale:</b> ${stale.toLocaleString()}</span><br/><span>(will fetch new tokens if needed)</span>`;
}

function setToken(name, value) {
  localStorage.setItem(`${localStorageKey}_${name}`, value);
}

function getToken(name) {
  return localStorage.getItem(`${localStorageKey}_${name}`);
}

function setTimestamps() {
  setToken('refreshed', new Date().toISOString());
}

function getActiveTab(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, cb);
}

window.onload = () => init();

chrome.webNavigation.onCompleted.addListener(details => {
  const { url } = details;
  if (url.includes('commerce.nikecloud.com')) {
    getData();
  }
});
