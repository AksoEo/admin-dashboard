var msEdgeVersion = navigator.userAgent.match(/(Edge)\/(\d+)(?:\.(\d+))?/);
var chromiumVersion = navigator.userAgent.match(/(Chromium|Chrome)\/(\d+)\.(\d+)(?:\.(\d+))?/);
var firefoxVersion = navigator.userAgent.match(/(Firefox)\/(\d+)\.(\d+)/);
var safariVersion = navigator.userAgent.match(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//);

var firefoxLink = '<a href="https://www.mozilla.org/eo/firefox/">Mozilla Firefox</a>';
var googleLink = '<a href="https://www.google.com/chrome/">Google Chrome</a>';

var isSupported = false;
var updateLink = '';
var browserName = 'Nekonata retumilo';
var extraMessage = '';

if (msEdgeVersion) {
    isSupported = +msEdgeVersion[2] >= 18;
    browserName = 'Microsoft Edge ' + msEdgeVersion[2];
} else if (chromiumVersion) {
    isSupported = +chromiumVersion[2] >= 49;
    browserName = chromiumVersion[1] + ' ' + chromiumVersion[2];
    updateLink = googleLink;
} else if (firefoxVersion) {
    isSupported = +firefoxVersion[2] >= 63;
    browserName = firefoxVersion[1] + ' ' + firefoxVersion[2];
    updateLink = firefoxLink;
} else if (safariVersion) {
    isSupported = +safariVersion[2] >= 10;
    browserName = 'Safari ' + safariVersion[2];
}

// minor feature detection so we can show something more than “unknown browser” if that happens
if (
    !window.fetch // we don’t use a fetch polyfill
    || !window.Worker || !window.Worker.prototype.postMessage // web workers
    || !window.WeakSet // we compile to ES6
) {
    isSupported = false;
    extraMessage = 'Via retumilo ne subtenas ĉiujn la funkciojn, kiujn AKSO bezonas.';
}

if (!isSupported) {
    var c = document.createElement('div');
    c.id = 'unsupported';
    c.style.zIndex = 100;
    c.style.background = '#fff';
    c.style.color = '#000';
    c.style.overflow = 'auto';
    c.style.padding = '16px';
    c.style.margin = '0';
    c.style.boxSizing = 'border-box';
    c.innerHTML = '<img src="/assets/logo.svg" /><img src="/assets/logo-label.svg" />';
    c.innerHTML += '<h1>Via retumilo ne estas subtenata</h1>';
    c.innerHTML += '<p>Ŝajnas, ke vi uzas: ' + browserName + '</p>';
    if (extraMessage) c.innerHTML += '<p>' + extraMessage + '</p>';
    if (updateLink) {
        c.innerHTML += '<p>Bonvolu ĝisdatigi vian retumilon al pli nova versio aŭ elŝuti de tie ĉi: ' + updateLink + '</p>';
    } else {
        c.innerHTML += '<p>Bonvolu ĝisdatigi al pli nova retumilo kiel ekz. ' + firefoxLink + ' aŭ ' + googleLink + '.</p>';
    }
    document.body.appendChild(c);
}
