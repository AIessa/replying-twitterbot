//start message to console
console.log('Twitbot is starting');

//imports
var Twit = require('twit');
var config = require('./config');


//Twitter oAuth -------------------------------------------------------
var T = new Twit(config);



// Stream, tweet back whenever someone mentions me --------------------

// Set up a user stream tracking mentions to username
var stream = T.stream('statuses/filter', { track: '@ByDecided' });

// Now looking for tweet events
stream.on('tweet', tweetEvent); //only replies if tweetEvent is a mention!

function tweetEvent(tweet) {
    
    //Check tweet is replying to us/mentions us
    var reply_to = tweet.in_reply_to_screen_name;
    if (reply_to === 'ByDecided') {
        
        //formulate answer text:
        var tweet_txt = tweet.text; //for analysis & answering
        var screen_name = tweet.user.screen_name; //to reply to user
        var tweet_id = tweet.id_str;
        var quote_tweet = 'https://twitter.com/'+screen_name+'/status/'+tweet_id; //url for quotation
        var generated_content = ' ' //this could be more imaginative
        var reply_txt = '@' + screen_name + generated_content + quote_tweet;
        
        //post answer
        T.post('statuses/update', { status: reply_txt}, tweeted);
        
        //function to catch errors
        function tweeted(err, reply) {
            if (err) {
              console.log(err.message);
            } else {
              console.log('Reply sent to: '+screen_name);
            }
        }
            
    }
}



// Stream, tweet welcome message to new followers ---------------------

//function followEvent(follow) {}




