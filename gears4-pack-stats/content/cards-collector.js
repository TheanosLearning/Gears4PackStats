/**
 * cards-collector.js scrapes card UIDs from
 * https://gearsofwar.com/{locale}/cards/my-packs/{pack-type}
 * and sends data to the background script cards-recorder.js
 **/
var content = {
    sendPackData: function() {
        // sends a message to background
        chrome.runtime.sendMessage({
            type: pack.getType(),
            cards: pack.getCardUids(),
            gamertag: pack.getGamerTag(),
            date: pack.getDate()
        }, function(response) {
            console.log(response);
        });
    }
};

/**
 * var cardCategories = Array.from(document.querySelectorAll('.cardAssembleCategory')).map(card => card.textContent);// ["Skin", "Engineer Skill", "Scout Skill"]
 * var cardRarity = Array.from(document.querySelectorAll('.cardListImage')).map(card => card.alt).map(rarity => rarity.split(" ")[0]);// ["common", "common", "rare"]
 **/
var pack = {

    getCardUids: function() {
        var cardUids = Array.from(document.querySelectorAll('img.assembleContent')).map(img => img.currentSrc).map(url => url.split("/")).map(path => path[6])
        return cardUids;
    },

    getCardTitles: function() {
        var cardTitles = Array.from(document.querySelectorAll('p.cardAssembleTitle')).map(card => card.textContent);
        return cardTitles;

    },

    getType: function() {
        var packType = document.querySelector('.packOpenHeader .text-nowrap').innerText.trim();
        return packType
    },

    getGamerTag: function() {
        var gamertag = JSON.parse(document.getElementById('initialState').textContent).user.gamertag;
        return gamertag;
    },

    getDate: function() {
        var date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        return date;
    }

};

function readyToReveal(event){
    var element = event.target;
    if(element.id === "reveal-all-desktop"){
        content.sendPackData();
    }
}

// send pack data when 'Reveal All' button is clicked
document.addEventListener("click", readyToReveal);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // user feedback
        if(request.status === 200) {
            injectMessage(pack.getCardTitles().join(', ') + " saved to " + request.message);
        } else {
            injectMessage(request.message);
        }
    }
);

function injectMessage(msg) {
    var toolbar = document.querySelector('[role="toolbar"]');
    var h4 = document.createElement('h4');
    h4.style.color = "#FFFFFF"; h4.align = "center";
    h4.innerText = msg;
    toolbar.parentElement.insertBefore(h4, toolbar);
}