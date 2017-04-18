# Gears of War 4 Pack Stats `v1.4.8`

![logo](https://github.com/TheanosLearning/Gears4PackStats/raw/authxhr/images/cards-red-svg.png)

### Now on the [Chrome Web Store](https://chrome.google.com/webstore/detail/gears-of-war-4-pack-stats/mlnjmcoibfinbdillhmmnpodpfgihlgg)!

> Join the Gears Project Development channel on Discord <br> [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/9yhnD)

<br>![gif demo](https://media.giphy.com/media/gpy8DXmK7qF68/giphy.gif)

#### About
* This branch makes an authenticated XMLHttpRequest using the [Google Sheets API v4](https://developers.google.com/sheets/api/reference/rest/)
* An access token is created using the [Chrome Identity API](https://developer.chrome.com/apps/identity)

#### Requirements
* Google Chrome

#### Notes
* This branch does not offer a toggle feature. Once it is installed it will actively run unless disabled from the extension setting (chrome://extensions)
* You can check the token status in the _Identity API Token Cache_ (chrome://identity-internals)
* To run this extension with your own Google sheet, simply update the sheet Id in `[cards-recorder.js](https://github.com/TheanosLearning/Gears4PackStats/blob/authxhr/gears4-pack-stats/background/cards-recorder.js#L158)`


> <br>...and a pack tax :)
![demo](https://github.com/TheanosLearning/Gears4PackStats/raw/authxhr/images/authxhr-demo.png)
