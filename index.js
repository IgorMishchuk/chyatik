console.log('Loading event');
var AWS = require('aws-sdk');
var querystring = require('querystring');
var https = require('https');
var speech = require('./speech'); //Text to speech conversion part
var texting = require('./texting'); //Text handling other than speech conversion
var dynamo = require ('./dynamo'); //Time difference calculation between message time and DB entry
var body = '';

exports.handler = function(event, context) {
    // Log the basics, just in case
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));
    
    //Determine if incoming message is for speech conversion
    if (event.message.text.toLowerCase().startsWith('/voice')){ //If message starts with trigger phrase '/voice'
        if (event.message.chat.id == process.env.CHAT1 || event.message.chat.id == process.env.TEST_CHAT) { //List allowed chats for Polly processing
            console.log('Polly entered');
            speech.vocal(event, context); //Send message to Polly function for processing
        }
        else { //Message came from unauthorized chat
            var post_data = querystring.stringify({ //Build message for Telegram API
                'chat_id': event.message.chat.id,
            	'reply_to_message_id': event.message.message_id,
            	'text': 'This chat is not authorized for Polly usage. \
            	\nContact %Author% for authorization.'
            });
            var post_options = {    //Create Telegram post options
                hostname: 'api.telegram.org',
                port: 443,
                path: '/bot'+process.env.BOT_API_KEY+'/sendMessage',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length
                }
            };
            var post_req = https.request(post_options, function(res) {  //Create https request to Telegram API
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
            post_req.write(post_data);  //Post data to Telegram API
            post_req.end();
        
        }
    }
    else if (event.message.text.toLowerCase() == 'trigger phrase'){ //If message is a defined trigger phrase
        if (event.message.from.id == process.env.USER1 || event.message.from.id == process.env.USER2){  //If message came from specific user
            console.log('DynamoDB entered');
            dynamo.dynamodb(event, context); //Send message to Dynamo function for processing
        }
        else {  //If message came from non-authorized user
            var post_data = querystring.stringify({ //Build message for Telegram API
                'chat_id': event.message.chat.id,
        	    'reply_to_message_id': event.message.message_id,
        	    'text': 'You do not have permissions to interact with this function'
            });
            var post_options = {    //Create Telegram post options
                hostname: 'api.telegram.org',
                port: 443,
                path: '/bot'+process.env.BOT_API_KEY+'/sendMessage',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length
                }
            };
        
            var post_req = https.request(post_options, function(res) {  //Create https request to Telegram API
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
            post_req.write(post_data);  //Post data to Telegram API
            post_req.end();
        }
    }
    
    //Process text which was not for speech conversion or DynamoDB interaction
    else {
        console.log('Texting entered');
        texting.texting(event, context);
    }
};
