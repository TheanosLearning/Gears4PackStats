/**
* cards-recorder.js initializes authentication with Google Drive & Sheets
* and then listens for messages from content. Packs are recorded to the
* sheet with name `GoW4 Pack Stats`.
* See: https://developers.google.com/sheets/api/quickstart/js the JavsScript
* quickstart for more information on the google sheets api v4.
**/
const SHEET_NAME = "Gears4 Pack Stats";
var SHEET_ID;
var recording = false;
var sheetSet = false;
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4", "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets";

// Inject gapi script into the background page IIFE
// http://stackoverflow.com/questions/29433744/gapi-is-not-defined
(function gapiLoad() {
    var head = document.createElement('head');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://apis.google.com/js/api.js?onload=handleClientLoad";
    document.getElementsByTagName("head")[0].appendChild(script);
})();

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 * Initializes the API client library and sets up sign-in state
 * listeners. The initialization works but not with a client id.
 * Throws warning: 'client_id and scope must both be provided to initialize OAuth.'
 * This is because Chrome extensions are not supported environments.
 * See: `https://github.com/google/google-api-javascript-client/issues/64#issuecomment-269438382`
 * Because of this we provide our own authentication using the chrome.identity API.
 **/
function initClient() {
    gapi.client.init({
        // apiKey: API_KEY,
        // clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function(response) {
        setAuthToken();
        console.log("Successfully loaded gapi.");
    });
}

function setAuthToken() {
    chrome.identity.getAuthToken({
        'interactive': true
    }, function(token) {
        gapi.auth.setToken({
            access_token: token
        });
    });
}

function setActiveSheetId() {
        gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)"
        }).then(function(response) {
            if(response.status === 200) {
                var driveFiles = response.result.files;
                SHEET_ID = driveFiles.filter(f => f.name === SHEET_NAME).map(f => f.id).pop();
                sheetSet = true;
                console.log("Connected to sheet : " + SHEET_ID);
            }
        });
}

// click extension icon to toggle recording
chrome.browserAction.onClicked.addListener(() => {
    if(!sheetSet) {
        setActiveSheetId();
    }
    setTimeout(background.toggleOnOff, 250);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.isPack && recording) {
        sendResponse("Attempting to recording pack...");
        background.recordPack(request);
    } else {
        sendResponse("Pack not recorded.");
    }
});

var background = {

    recordPack: function(pack) {
        gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: pack.type + '!A:H',
            valueInputOption: "USER_ENTERED",
            values: [
                [null, ...pack.cards, pack.gamertag, pack.date]
            ]
        }).then(function(response) {
            background.sendMessage("Appended [" + pack.cards + "] to " + response.result.tableRange);
        }, function(response) {
            background.sendMessage('Error ' + response.result.error.message);
        });
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
        if (recording) {
            chrome.browserAction.setIcon({
                path: "images/cards.png"
            });
            background.sendMessage("Recording Off.");
            recording = !recording;
        } else if (!recording && sheetSet) {
            chrome.browserAction.setIcon({
                path: "images/cards-recording.png"
            });
            background.sendMessage("Recording On.");
            recording = !recording;
        }
    }

};