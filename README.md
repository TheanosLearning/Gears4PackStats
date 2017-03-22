# Gears4 Pack Stats

![demo](https://github.com/TheanosLearning/Gears4PackStats/raw/authxhr/images/authxhr-demo.png)

This branch only needs access to Google sheets.
It uses an XMLHttpRequest along with an access token from the [chrome.identity](https://developer.chrome.com/apps/identity) api.
* Requires a client Id for authentication and the sheet Id for where the data should be written to.

This branch does not offer a toggle feature. Once it is installed it will actively run unless disabled from the
chrome extension settings.

__Warning: After opening the pack, you must allow all of the cards to load in before clicking 'REVEAL ALL'. Otherwise, only a partial pack will be recorded.__
