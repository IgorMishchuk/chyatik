module.exports = {
    texting: function(event, context){
        var AWS = require('aws-sdk');
        var https = require('https');
        var message = event.message.text.toLowerCase();
        var querystring = require('querystring');
		
	//Define triggers and possible replies
	var trigger1 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger2 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger3 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger4 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger5 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger6 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger7 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger8 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
	var trigger9 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
        var reply = '';

        switch (message) {
            case '/help':
            case 'help':
                reply = 'New bot feature - speech synthesis from text.\
                \nCommand syntax: "/voice *language* Text".\
                \nAccepted values for language:\
                \ngb-fe - English, female voice, British accent.\
                \ngb-ma - English, male voice, British accent.\
                \nus-fe - English, female voice, USA accent.\
                \nus-ma - English, male voice, USA accent.\
                \nru-fe - Russian, female voice.\
                \nru-ma - Russian, male voice.\
                \nExample:\
                \n/voice *gb-fe* This is a test\
                \n\
                \nNuances:\
                \nMaximum number of characters in text - 160.\
                \nText should not contain "*".\
                \nNo verification if language of entered text is the same as selected for Polly';
                break;
            case '/trigger1':
            case '/trigger1@YOUR_TELEGRAM_bot':
		reply = trigger1[Math.floor(Math.random() * trigger1.length)]; //Randomly select which reply wtill be given from available variants
		break;
            case '/trigger2':
            case '/trigger2@YOUR_TELEGRAM_bot':
		reply = trigger2[Math.floor(Math.random() * trigger2.length)];
		break;
            case '/trigger3':
            case '/trigger3@YOUR_TELEGRAM_bot':
		reply = trigger3[Math.floor(Math.random() * trigger3.length)];
		break;
            case '/trigger4':
            case '/trigger4@YOUR_TELEGRAM_bot':
		reply = trigger4[Math.floor(Math.random() * trigger4.length)];
		break;
            case '/trigger5':
            case '/trigger5@YOUR_TELEGRAM_bot':
		reply = trigger5[Math.floor(Math.random() * trigger5.length)];
		break;
            case '/trigger6':
            case '/trigger6@YOUR_TELEGRAM_bot':
		reply = trigger6[Math.floor(Math.random() * trigger6.length)];
		break;
            case '/trigger7':
            case '/trigger7@YOUR_TELEGRAM_bot':
		reply = trigger7[Math.floor(Math.random() * trigger7.length)];
		break;
            case '/trigger8':
            case '/trigger8@YOUR_TELEGRAM_bot':
		reply = trigger8[Math.floor(Math.random() * trigger8.length)];
		break;
            case '/trigger9':
            case '/trigger9@YOUR_TELEGRAM_bot':
		reply = trigger9[Math.floor(Math.random() * trigger9.length)];
		break;
            default:
		reply = '';
        }
        
        if (reply == ''){
            console.log('Nothing to reply with. Terminating script');
            process.exit();
        }
        else{
            
            // We're going to respond with the user's ID and text
            var post_data = querystring.stringify({
            	'chat_id': event.message.chat.id,
        	    'text': reply
            });

            // Build the post options
            var post_options = {
                  hostname: 'api.telegram.org',
                  port: 443,
                  path: '/bot'+process.env.BOT_API_KEY+'/sendMessage', //Bot API key specified in Lambda environment variables
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Content-Length': post_data.length
                  }
            };

            // Create the post request
            var body = '';
            var post_req = https.request(post_options, function(res) {
                res.setEncoding('utf8');

                // Save the returning data
                res.on('data', function (chunk) {
                    console.log('Response: ' + chunk);
                    body += chunk;
                });

                // Are we done yet?
                res.on('end', function() {
                    console.log('Successfully processed HTTPS response');
                    // If we know it's JSON, parse it
                    if (res.headers['content-type'] === 'application/json') {
                        body = JSON.parse(body);
                    }
                    // This tells Lambda that this script is done
                    context.succeed(body);
                });
            });

            // Post the data
            console.log("write the post");
            post_req.write(post_data);
            post_req.end();
        }
    }
};
