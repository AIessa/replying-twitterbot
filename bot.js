//start message to console
console.log('Twitbot is starting');

//IMPORTS >> index.js
var Twit = require('twit');
var config = require('./config');
var keyword_extractor = require('keyword-extractor');
var giphy = require('giphy-api')();
var download_file = require('download-file');
var fs = require('fs');
var gif = require('gif-search');



//TWITTER OAUTH -------------------------------------------------------
var T = new Twit(config);



//FUNCTION: SEARCH AND DOWNLOAD GIF TO LOCAL --------------------------
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
    gif.query(searchstring)
        .then((response) => {
            console.log(response);
            response && (
                downloadgif(response))})
        .then(response2 => console.log(response2))
        .catch(() => console.error('ERROR'))
        .then(errorgif)
    
    function errorgif() {
        gif.query('error').then(response => downloadgif(response)).then(response2 => console.log(response2)).catch(() => {console.error('ERROR')})
    }
    
    //download gif
    function downloadgif(url) {
        download_file(url, {filename: "tweetreply.gif"},function(error){
        if (error) throw error;
        else {console.log("gif downloaded!")}
        })
    }
        
//    if (keywords.length == 0) { //exit strategy, question has no content!!!
//        giphy.search({q:'what', rating: 'g'},function(error,gif){
//            if (error) throw error;
//            //get url
//            var url = gif.data[0].images.preview_gif.url
//            //download the gif
//            download_file(url, {filename: "tweetreply.gif"}, function(error){
//                if (error) throw error;
//                else {console.log("exit gif downloaded!")}
//            })
//        })
//    
//    }
//    else {
//        giphy.translate({s:searchstring, rating:'g'}, function (error, gif) {
//            if (error) throw error;
//            //get url
//            var url = gif.data.images.preview_gif.url
//            //download the gif
//            download_file(url, {filename: "tweetreply.gif"}, function(err){
//                if (err) throw err;
//                console.log("fitting gif downloaded!")
//            })
//        })
//    }
}

//getGif('@person dhdhjoadjadsoöj');
//getGif('@person dog');

//FUNCTION: UPLOAD GIF TO TWITTER -------------------------------------
//multi-step chunked upload process, because single-step isn't supported for GIFs..
function postTweetWithMedia(additional_tweet_text) {

    var b64content = fs.readFileSync("./tweetreply.png", { encoding: 'base64' })
 
    //post gif on Twitter
    var filePath = './tweetreply.gif'
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        console.log(data)
        var mediaIdStr = data.media_id_string
        var altText = "A stupid gif"
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
        
    console.log('Chunked media posted.')
    
//    // first we must post the media to Twitter
//    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
//        // now we can assign alt text to the media, for use by screen readers and
//        // other text-based presentations and interpreters
//        var mediaIdStr = data.media_id_string
//        var altText = "A stupid gif"
//        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
 
    T.post('media/metadata/create', meta_params, function (err, data, response) {
        console.log('posting tweet..')
        if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            var params = { status: additional_tweet_text , media_ids: [mediaIdStr] }
 
          T.post('statuses/update', params, function (err, data, response) {
            console.log(data)
          })
        }
      })
    })
  
}

    

//Stream, tweet back whenever someone mentions me ---------------------

// Set up a user stream tracking mentions to username
var stream = T.stream('statuses/filter', { track: '@ByDecided' });

// Now looking for tweet events
stream.on('tweet', tweetEvent); //only replies if tweetEvent is a mention!

function tweetEvent(tweet) {
    
    //Check tweet is replying to us/mentions us
    var reply_to = tweet.in_reply_to_screen_name;
    if (reply_to === 'ByDecided') {
        console.log('Someone mentioned me in a tweet!')
        
        //--------create answer:
        var tweet_txt = tweet.text; //for analysis & answering
        var screen_name = tweet.user.screen_name; //to reply to user
        var tweet_id = tweet.id_str;
        var quote_tweet = 'https://twitter.com/'+screen_name+'/status/'+tweet_id; //url for quotation
        var reply_txt = '@' + screen_name + ' ' + quote_tweet;
        //download appropriate gif
        getGif(tweet_txt)
        
        console.log('setting timeout')
        //wait for gif download
        //setTimeout(postTweetWithMedia(reply_txt), 5000)
        
        postTweetWithMedia(reply_txt)
        
        //--------post answer
        //T.post('statuses/update', { status: reply_txt}, tweeted);
        
        //function to catch errors
        function tweeted(err, reply) {
            if (err) {
              console.log(err.message);
            } else {
              console.log('Reply sent to: ' + screen_name);
            }
        }
            
    }
}