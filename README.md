


This is a Twitterbot built with NodeJs that replies to mentions with a GIF.

It uses the Twitter Streaming API and the Giphy API.



(You will only need the Procfile if you want to deploy your bot to run by itself, e.g. using Heroku.)


-------------------------

To run the bot, you need to install node js and a few modules:



(1) First make sure you have node installed. In your terminal, run:

$ node -v


(2) You will also need the node package manager (npm). Check:

$ npm -v


(3) Once node and npm are installed, you can use npm to install the required modules! 
    Go into the directory of the Twitterbot and run:

$ npm install twit --save
$ npm install keyword-extractor --save
$ npm install gif-search --save
$ npm install download-file --save


(4) Lastly, you will need a Twitter developer account to use the Twitter API. Once you have this, 
    you will be able to create a new app (the bot!) and get:
	- consumer key
	- consumer secret
	- access token
	- access token secret

    Then just open the config.js file and edit these variables.



----------
Great! 
You should now be able to run the bot. 
From your command line, simply type:

$ node path-to-bot/bot.js







----
This code can be found on: https://github.com/AIessa/replying-twitterbot





