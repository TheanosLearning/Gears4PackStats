# Gears of War 4 Pack Stats `v1.4.8`

![logo](https://github.com/TheanosLearning/Gears4PackStats/raw/authxhr/images/cards-red-svg.png)

### Now on the [Chrome Web Store](https://chrome.google.com/webstore/detail/gears-of-war-4-pack-stats/mlnjmcoibfinbdillhmmnpodpfgihlgg)!

> Join the Gears Project Development channel on Discord <br> [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/9yhnD)

![gif demo](https://media.giphy.com/media/gpy8DXmK7qF68/giphy.gif)

![demo](https://github.com/TheanosLearning/Gears4PackStats/raw/authxhr/images/authxhr-demo.png)

#### About
* This branch makes an authenticated XMLHttpRequest using the [Google Sheets API v4](https://developers.google.com/sheets/api/reference/rest/)
* An access token is created from the [chrome.identity](https://developer.chrome.com/apps/identity) API.

#### Requirements
* Google Chrome
* A client Id for authentication and a sheet Id for where the data should be written to

#### Notes
* This branch does not offer a toggle feature. Once it is installed it will actively run unless disabled from the extension setting (chrome://extensions)
* You can check the token status in the _Identity API Token Cache_ (chrome://identity-internals)
