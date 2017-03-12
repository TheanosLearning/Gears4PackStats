/**
* cards-collector.js scrapes card titles from
* https://gearsofwar.com/{locale}/cards/my-packs/{pack}
* and sends data to the background script cards-recorder.js
**/
var content = {
    sendPackData: function() {
        // sends a message to background
        chrome.runtime.sendMessage({
            isPack: true,
            type: pack.getType(),
            cards: pack.getCards(),
            gamertag: pack.getGamerTag(),
            date: pack.getDate()
        }, function(response) {
            console.log(response);
        });
    }
};

var pack = {
    // var cardCategories = Array.from(document.querySelectorAll('.cardAssembleCategory')).map(card => card.textContent);// ["Skin", "Engineer Skill", "Scout Skill"]
    // var cardRarity = Array.from(document.querySelectorAll('.cardListImage')).map(card => card.alt).map(rarity => rarity.split(" ")[0]);// ["common", "common", "rare"]
    // var cards = Array.from(document.querySelectorAll('p.cardAssembleTitle')).map(card => card.textContent);// ["Snow Leopard Gnasher", "Turret Health", "Shotgun Capacity"]
    getCards: function() {
        var cards = Array.from(document.querySelectorAll('img.assembleContent')).map(img => img.currentSrc).map(url => url.split("/")).map(path => path[6])
        // var cards = ["DECOY COST", "TURRET HEALTH", "SHOTGUN CAPACITY", "PICKUP DISTANCE", "MARK BOOST"];
        return cards;
    },

    getType: function() {
        var packType = document.querySelector('.packOpenHeader .text-nowrap').innerText.trim();
        // var packType = "Horde Booster";
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
    console.log(request);
});

/**
* NOTES:
* https://cdn.gearsofwar.com/gearpacks/cards/WeaponSkinCards/{WeaponUID}/content.png
* https://cdn.gearsofwar.com/gearpacks/cards/CharacterCards/{CharacterUID}/content.png
* https://cdn.gearsofwar.com/gearpacks/cards/DeployableCards/{SkillUID}/content.png
**/