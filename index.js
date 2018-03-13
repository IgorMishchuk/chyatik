console.log('Loading event');
var AWS = require('aws-sdk');
var https = require('https');
var querystring = require('querystring');
var reply = '';
var message = '';

var botAPIKey = %YOUR_BOTAPIKEY%;

//Define phrase arrays for persons
var trigger1 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger2 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger3 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger4 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger5 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger6 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger7 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger8 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger9 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var default_reply = ["Text1", "Text2", "Text3", "Text4", "Text5"];


exports.handler = function(event, context) {
    // Log the basics, just in case
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));
    message = event.message.text.toLowerCase();
    switch (message) {
        case '/trigger1':
        case '/trigger1@YOUR_TELEGRAM_bot':
            reply = trigger1[Math.floor(Math.random() * trigger1.length)];
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
            reply = default_reply[Math.floor(Math.random() * default_reply.length)];
    }
    // We're going to respond to their message
    // and some text of our own.
    var post_data = querystring.stringify({
    	'chat_id': event.message.chat.id,
    	//'reply_to_message_id': event.message.message_id,
    	'text': reply
    });

    // Build the post options
    var post_options = {
          hostname: 'api.telegram.org',
          port: 443,
          path: '/bot'+botAPIKey+'/sendMessage',
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
    console.log("ID=" + event.message.from.id);
    console.log("Chat ID=" + event.message.chat.id);
    post_req.write(post_data);
    post_req.end();
};
