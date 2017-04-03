/**
 * cards-collector.js scrapes card UIDs from
 * https://gearsofwar.com/{locale}/cards/my-packs/{pack-type}
 * and sends data to the background script cards-recorder.js
 **/

var content = {
    sendPackData() {
        // sends a message to background
        chrome.runtime.sendMessage({
            type: pack.getType(),
            cards: pack.getCardUids(),
            gamertag: pack.getGamerTag(),
            date: pack.getDate()
        }, function(response) {
            console.info("Pack sent to background process.");
        });
    }
};

var pack = {

    getCardUids() {
        var cardUids = Array.from(document.querySelectorAll('img.assembleContent')).map(img => img.currentSrc).map(url => url.split("/")).map(path => path[6])
        return cardUids;
    },

    getCardTitles() {
        var cardTitles = Array.from(document.querySelectorAll('p.cardAssembleTitle')).map(card => card.textContent);
        return cardTitles;

    },

    getCardRarities() {
        var cardRarities = Array.from(document.querySelectorAll('.cardListImage')).map(card => card.alt).map(rarity => rarity.split(" ")[0]);
        return cardRarities;
    },

    // used by injectMessage to generate inner HTML
    getCards() {
        var cards = [];
        var cardTitles = pack.getCardTitles();
        var cardRarities = pack.getCardRarities();
        cardTitles.forEach((value, index) => cards.push({
            title: value,
            rarity: cardRarities[index]
        }));
        return cards;
    },

    getType() {
        var packType = document.querySelector('.packOpenHeader .text-nowrap').innerText.trim();
        return packType
    },

    getGamerTag() {
        var gamertag = JSON.parse(document.getElementById('initialState').textContent).user.gamertag;
        return gamertag;
    },

    getDate() {
        var date = new Date().toISOString();
        return date.slice(0,10) + " " + date.slice(11,19);// YYYY-MM-DD hh:mm:ss
    }

};

function readyToReveal(event) {
    var element = event.target;
    if(element.id === "reveal-all-desktop"){
        element.disabled = true;
        content.sendPackData();
    }
}

// add event listeners if we are on the correct page
// https://triangle717.wordpress.com/2015/12/14/js-avoid-duplicate-listeners/
if (/https:\/\/gearsofwar.com\/.*\/cards\/my-packs\/.*/.test(window.location.href)) {

    // send pack data when 'Reveal All' button is clicked
    document.body.addEventListener("click", readyToReveal);

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.status === 100) {
                sendResponse("OK");
            } else {
                injectMessage(request);
            }
        }
    );

}

// rarity => color mapping
var colors = new Map();
colors.set("common",    "#089F08");
colors.set("rare",      "#48A0A9");
colors.set("epic",      "#9745A5");
colors.set("legendary", "#C2B75A");

// injects a message above the toolbar div
function injectMessage(request) {
    let dashboardUrl = "https://docs.google.com/spreadsheets/d/1JMSBn2s6GQxhn9ylj2INB0kQFF0G7tqMLT4y0p31upk/view#gid=1614938261";
    let {status, message} = request;// es6 destructuring
    let toolbar = document.querySelector('[role="toolbar"]');
    let h4 = document.createElement('h4');
    h4.align = "center";
    if(status === 200) {
        let cards = pack.getCards();
        h4.style.color = "#FFFFFF";
        h4.innerHTML = `${cards.map(card => `<span style="color:${colors.get(card.rarity)}">${card.title}</span>`).join(', ')} 
                            saved to <a href=${dashboardUrl} target="_blank">${message}</a>`;// link to dashboard
        console.info("Pack saved to sheet.");
    } else {
        h4.style.color = "#FF0033";
        h4.innerHTML = message;
    }
    toolbar.parentElement.insertBefore(h4, toolbar);
}

function displayVersion() {
    if (document.getElementById('pack-stats-version') == null) {
        let manifest = chrome.runtime.getManifest();
        let backToTop = document.getElementById('back-to-top');
        let h4 = document.createElement('h4');
        h4.id = "pack-stats-version";
        h4.align = "center";
        h4.style.color = "#777780";
        h4.innerHTML = `Using ${manifest.name} version ${manifest.version}`;
        backToTop.parentElement.insertBefore(h4, backToTop);
    }
}

function waitForCards() {
    let cardsLoaded = false;
    let cards = document.querySelector('.revealPack .card-flex');
    if(cards) {
        let revealAllBtn = document.getElementById('reveal-all-desktop');
        revealAllBtn.disabled = true;
        if (Array.from(cards.children, child => child.childElementCount).reduce((a, b) => a + b, 0) === cards.childElementCount) {
            revealAllBtn.disabled = false;
            cardsLoaded = true;
        }
    }
    if(!cardsLoaded) {
        setTimeout(waitForCards, 0);
    }
}

var mainObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        let item = mutation.addedNodes.item(0);
        if (item != null && item.id === "main") {
            let packOpen = document.getElementById('pack-open');
            if (packOpen) {
                packOpen.addEventListener("click", waitForCards);
            }
        }
    });
});
 
// mutation notification level & configuration
var observerConfig = {
    //attributes: true, 
    childList: true, 
    //characterData: true 
};
 
// listen to changes on app-panel and child nodes
var appPanel = document.getElementById('app-panel');
mainObserver.observe(appPanel, observerConfig);

displayVersion();
console.debug("Gears4 Pack Stats: content script loaded.");