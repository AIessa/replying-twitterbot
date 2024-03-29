/*
This is a replying twitter-bot!
BEFORE running this, you must set the constant 'self_username' to your bot's username, but leave out the '@'!
Then you can run this via: node bot.js
*/

//PLEASE SET THIS VARIABLE BEFORE STARTING. It's your bot's username (minus the @)!
const self_username = '';



//IMPORTS >> index.js--------------------------------------------------------
var Twit = require('twit');
var config = require('./config');
var keyword_extractor = require('keyword-extractor');
var download_file = require('download-file');
var gif = require('gif-search');

//TWITTER OAUTH -------------------------------------------------------------
var T = new Twit(config);



//start message to console---------------------------------------------------
console.log('Twitbot is starting');




//FUNCTION: SEARCH AND DOWNLOAD GIF TO LOCAL --------------------------------
//(FYI: some cases might throw an error)
function getGif(tweet_txt) {
    //get keywords
    var keywords = keyword_extractor.extract(tweet_txt,{language:"english", remove_digits: false, return_changed_case:true, remove_duplicates: true});
    //remove first element, which is just the mention '@'
    var keywords = keywords.slice(1)
    //shuffle keywords to make it more interesting
    var shuffled = keywords.sort(() => Math.random() - 0.5);
    //create search string
    var searchstring = shuffled.join(' ');
    console.log('I found these keywords:')
    console.log(searchstring);
    
    //get url of gif for searchstring
    gif.random(searchstring)
        .then((response) => {
            if(response !== undefined) {
                console.log('defined gif');
                downloadgif(response)
                
            } else {
                console.log('undefined gif')
                errorgif()
            }
        })
        .then(response2 => console.log(response2))
        .catch((e) => {
        console.log('im here')
            if(e !== undefined){
                errorgif()
            }
        })
    
    function errorgif() {
        gif.random('error').then(response => downloadgif(response)).then(response2 => console.log(response2)).catch(() => {console.error('ERROR')})
    }
    
    //download gif
    function downloadgif(url) {
        download_file(url, {filename: "tweetreply.gif"},function(error){
        if (error) throw error;
        else {console.log("gif downloaded!")}
        })
    }
        
}


//FUNCTION: UPLOAD GIF TO TWITTER -------------------------------------------
//multi-step chunked upload process, because single-step isn't supported for GIFs..
function postTweetWithMedia(additional_tweet_text) {
 
    //post gif on Twitter
    var filePath = './tweetreply.gif'
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        console.log(data)
        var mediaIdStr = data.media_id_string
        var altText = "A stupid gif"
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
        
    console.log('Chunked media posted.')
 
    T.post('media/metadata/create', meta_params, function (err, data, response) {
        console.log('posting tweet..')
        if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            var params = { status: additional_tweet_text , media_ids: [mediaIdStr] }
 
          T.post('statuses/update', params, function (err, data, response) {
            console.log(data)
          })
        }
        else {
            console.log('something went wrong!')
            T.post('statuses/update',{status:'Something went wrongggg ' + additional_tweet_text}, tweeted);
            //function to catch errors
            function tweeted(err, reply) {
                if (err) {
                  console.log(err.message);
                } else {
                  console.log('Reply sent!');
                }
            }
            
        }
      })
    })
  
}    



//Stream, tweet back whenever someone mentions me ---------------------------

// Set up a user stream tracking mentions to username
var stream = T.stream('statuses/filter', { track: '@'+self_username });

// Now looking for tweet events
stream.on('tweet', tweetEvent); //only replies if tweetEvent is a mention!


function tweetEvent(tweet) {
    
    //Check tweet is replying to us/mentions us
    var reply_to = tweet.in_reply_to_screen_name;
    if (reply_to === self_username) {
        console.log('Someone mentioned me in a tweet!')
        
        //--------create answer:
        var tweet_txt = tweet.text; //for analysis & answering
        var screen_name = tweet.user.screen_name; //to reply to user
        var tweet_id = tweet.id_str;
        var quote_tweet = 'https://twitter.com/'+screen_name+'/status/'+tweet_id; //url for quotation
        var reply_txt = '@' + screen_name + ' ' + quote_tweet;
        
        //download appropriate gif
        getGif(tweet_txt)
        
        //wait for gif download & post Tweet with media:
        console.log('setting timeout')
        setTimeout(postTweetWithMedia, 5000, reply_txt)
            
    }
}