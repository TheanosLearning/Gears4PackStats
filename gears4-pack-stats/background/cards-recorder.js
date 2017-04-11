/**
 * cards-recorder.js initializes authentication with Google Sheets
 * and then listens for messages from content. Packs are recorded to the
 * sheet with the specified sheet id.
 **/

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

chrome.browserAction.onClicked.addListener(() => openInNewTab(" https://gearsofwar.com/cards"));

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Received pack:");
        console.table(request);
        background.recordPack(request);
    }
);

// function executeContent() {
//     chrome.tabs.query({
//         url: "https://gearsofwar.com/*/cards/my-packs/*"
//     }, function(tabs) {
//         if (tabs.length > 0) {
//             chrome.tabs.sendMessage(tabs[0].id, {
//                 status: 100,
//                 message: "continue"
//             }, function(response) {
//                 if (response) {
//                     // do nothing, content script is already loaded
//                     console.debug("Content script already loaded.");
//                 } else {
//                     console.debug("Loading content script.");
//                     chrome.tabs.executeScript(tabs[0].id, {
//                         file: "content/cards-collector.js"
//                     });
//                 }
//             });
//         } else {
//             console.warn("https://gearsofwar.com/*/cards/my-packs/* tab not found.");
//         }
//     });
// }


var redirectFilter = {urls: ["https://gearsofwar.com/auth*"]};
var signingOut = false;
chrome.webRequest.onBeforeRedirect.addListener(function(details) {
    signingOut = details.url.includes("/auth/sign-out") ? true : false;
}, redirectFilter);

// execute the content script whenever user navigates to packs page
// http://www.toptip.ca/2010/01/google-chrome-content-script.html
// http://stackoverflow.com/questions/20865581/chrome-extension-content-script-not-loaded-until-page-is-refreshed
var navFilter = {urls: ["https://gearsofwar.com/*/cards/my-packs/*"]};
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        if (/https:\/\/gearsofwar.com\/.*\/cards\/my-packs\/.*/.test(tabs[0].url) && !signingOut) {
            // chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
            chrome.tabs.reload(tabs[0].id);
            // executeContent();
        }
    });
}, navFilter);

/**
 * There are some cases, such as when the user changes their password, when non-expired access tokens will stop working.
 * API calls using the token will start returning with an HTTP status code 401. If you detect that this has happened,
 * you can remove the invalid token from Chrome's cache.
 *
 * You can see the current state of the token cache on chrome://identity-internals.
 * See: https://developer.chrome.com/apps/app_identity#getAuthToken-caching for more information.
 **/
var post = {

     oAuthRetry: true,
     errorRetry: true,

    // callback = function (error, httpStatus, responseText);
    xhrWithAuth(url, rowData, callback) {
        var access_token;
        getToken();

        function getToken() {
            chrome.identity.getAuthToken({
                interactive: false
            }, function(token) {
                if (chrome.runtime.lastError) {
                    callback(chrome.runtime.lastError);
                    return;
                }
                access_token = token;
                requestStart();
            });
        }

        function requestStart() {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            xhr.onload = requestComplete;
            xhr.send(JSON.stringify(rowData));
        }

        function requestComplete() {
            if (this.status == 401) {
                chrome.identity.removeCachedAuthToken({
                        token: access_token
                    },
                    getToken);
            } else {
                callback(null, this.status, this.response);
            }
        }
    },

    getTokenInteractive() {
        chrome.identity.getAuthToken({
            interactive: true
        }, function(token) {
            if (post.errorRetry) {
                post.errorRetry = false;
                access_token = token;
                return;
            }
        });
    },

    onResponse(error, status, response) {
        let message;
        if(!error && status == 200) {
            message = JSON.parse(response).updates.updatedRange;
        } else if(!error) {// 401 Unauthenticated or 403 Unauthorized
            message = JSON.parse(response).error.message;
        } else {// runtime error
            message = error.message;
            // try authenticating in interactive mode if we error
            post.getTokenInteractive();
        }
        background.sendMessage({
            status, message
        });
    }
};

/**
 * See: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
 * for more details on the sheets rest api v4.
 **/
var sheet = {

    baseUrl: "https://sheets.googleapis.com/v4/spreadsheets/",
    id: "1JMSBn2s6GQxhn9ylj2INB0kQFF0G7tqMLT4y0p31upk",
    queryParams: "valueInputOption=USER_ENTERED",

    url(range) {
        return sheet.baseUrl + sheet.id + "/values/" + range + ":append?" + sheet.queryParams;
    },

    value(row) {
        return {
            "values": [row]
        };
    }

};

var background = {

    recordPack(pack) {
        post.xhrWithAuth(sheet.url(pack.type + "!A:H"),
            sheet.value([null, pack.date, pack.gamertag, ...pack.cards]),
                post.onResponse);
    },

    sendMessage(message) {
        chrome.tabs.query({
            url: "https://gearsofwar.com/*/cards/my-packs/*"
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                console.log("Recording summary:");
                console.table([message]);
            });
        });
    }

};

// executeContent();
console.debug("Background loaded.");