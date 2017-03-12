/**
 * cards-recorder.js initializes authentication with Google Sheets
 * and then listens for messages from content. Packs are recorded to the
 * sheet with the specified sheet id.
 **/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.isPack && background.recording) {
            sendResponse("Attempting to recording pack...");

            background.recordPack(request);
        } else {
            sendResponse("Not a pack or not recording");
        }
    });

// click extension icon to toggle recording
chrome.browserAction.onClicked.addListener(() => {
    background.toggleOnOff();
});

function onResponse(error, status, response) {
    if (!error && status == 200) {
        background.sendMessage("Pack recorded to " + JSON.parse(response).updates.updatedRange);
    } else {
        background.sendMessage("Unable to record pack : " + error);
    }
}

/**
 * There are some cases, such as when the user changes their password, when non-expired access tokens will stop working.
 * API calls using the token will start returning with an HTTP status code 401. If you detect that this has happened,
 * you can remove the invalid token from Chrome's cache.
 *
 * You can see the current state of the token cache on chrome://identity-internals.
 * See: https://developer.chrome.com/apps/app_identity#getAuthToken-caching for more information.
 **/
// callback = function (error, httpStatus, responseText);
function xhrWithAuth(method, url, rowData, callback) {
    var access_token;
    var retry = true;
    getToken();

    function getToken() {
        chrome.identity.getAuthToken({
            interactive: true
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
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.onload = requestComplete;
        xhr.send(JSON.stringify(rowData));
    }

    function requestComplete() {
        if (this.status == 401 && retry) {
            retry = false;
            chrome.identity.removeCachedAuthToken({
                    token: access_token
                },
                getToken);
        } else {
            callback(null, this.status, this.response);
        }
    }
}

/**
 * See: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
 * for more details on the sheets rest api v4.
 **/

var sheet = {
    baseUrl: "https://sheets.googleapis.com/v4/spreadsheets/",
    id: "1X5XrgoPE4Kbv4gl66lJCqUpfABsFxXWoMxuKV0fshLw",
    queryParams: "valueInputOption=USER_ENTERED",
    url: function(range) {
        return sheet.baseUrl + sheet.id + "/values/" + range + ":append?" + sheet.queryParams;
    },
    value: function(row) {
        return {"values": [row]};
    }
}

var background = {
    recording: false,

    recordPack: function(pack) {
        xhrWithAuth("POST", sheet.url(pack.type + "!A:H"),
            sheet.value([null, pack.date, pack.gamertag, ...pack.cards]),
            onResponse);
    },

    sendMessage: function(message) {
        chrome.tabs.query({
            url: "https://gearsofwar.com/*/cards/my-packs*"
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                console.log("Sent message : " + message);
            });
        });
    },

    toggleOnOff: function() {
        background.sendMessage("Toggle");
        background.recording ? chrome.browserAction.setIcon({path: "images/cards.png"})
            : chrome.browserAction.setIcon({path: "images/cards-recording.png"});
        background.recording = !background.recording;
    }
};