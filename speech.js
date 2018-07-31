module.exports = {
    vocal: function(event, context) {
        
        var AWS = require('aws-sdk');
        var https = require('https');
        var querystring = require('querystring');
        var polly = new AWS.Polly();
        var s3 = new AWS.S3();
        var body = '';
        var message_raw = event.message.text.toLowerCase();
        
        //Incoming message parsing
        var LangStart = message_raw.indexOf('*'); //Get index of first '*'
        var LangEnd = message_raw.lastIndexOf('*'); //Get index of last '*'
        var BodyStart = message_raw.slice(LangEnd+1); //Get message body
        var Lang = message_raw.slice(LangStart+1, LangEnd); //Get language
        
        //Incoming message is limited to 160 characters. Can be changed or removed.
        if (BodyStart.length > 160 ){
            var post_data = querystring.stringify({
        	    'chat_id': event.message.chat.id,
        	    'reply_to_message_id': event.message.message_id,
        	    'text': 'Message is too long. Maximum number of characters is 160.'
            });
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
        
        //If number of characters is less than 160
        else{
            var message = decodeURI(BodyStart);
            
            //Hash Text+Chat ID for a filename
            var hash = require('crypto').createHash('md5').update(message + event.message.chat.id + Lang).digest('hex');
        
            //Build post data for Telegram API
            var post_data = 'chat_id=' + event.message.chat.id + '&reply_to_message_id=' + event.message.message_id + '&audio=https://' + process.env.BUCKET_NAME + '.s3.amazonaws.com/' + event.message.chat.id + '/' + hash + '.mp3';
            
            //Post options for audio sending
            var post_options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: '/bot'+process.env.BOT_API_KEY+'/sendAudio', //Bot API key specified in Lambda environment variables
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            //Full path to file for uplaod to Telegram
            var params = {
                Bucket: process.env.BUCKET_NAME, //Bucket name specified in Lambda environment variables
                Key: event.message.chat.id +'/'+ hash + '.mp3' //"Folder" and filename
            };
            
            //Check if file already exists in S3
            s3.headObject(params, function(err, data) {
                
                // File already existed, so no need to have Polly synthesize the speech
                if (data){
                    console.log("Retreiving old file");
                    
                    // Create the post request
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
                
                // If the file did not already exist, then let's have Polly synthesize it.
                else {
                    var Voice_Id = '';
                    
                    //Determine which Polly language to use
                    switch (Lang) {
                        case 'gb-fe':
                        Voice_Id = 'Amy';
                        break;
                    case 'gb-ma':
                        Voice_Id = 'Brian';
                        break;
                    case 'us-fe':
                        Voice_Id = 'Joanna';
                        break;
                    case 'us-ma':
                        Voice_Id = 'Matthew';
                        break;
                    case 'ru-fe':
                        Voice_Id = 'Tatyana';
                        break;
                    case 'ru-ma':
                        Voice_Id = 'Maxim';
                    }
                    console.log(Voice_Id);
                    console.log("Making new file");
                    
                    //Specify Polly parameters
                    var params_polly = {
                        OutputFormat: 'mp3', /* required */
                        Text: message, /* required */
                        VoiceId: Voice_Id, /* required */
                        TextType: 'text'
                    };
                    
                    //Synthesize speech from text
                    polly.synthesizeSpeech(params_polly, function(err, data) {
                        if (err){
                            console.log(err, err.stack); // an error occurred
                        }
                        else {
                            
                            //Specify upload parameters for file created by Polly
                            var params_upload = {
                                ACL: 'public-read', 
                                Bucket: process.env.BUCKET_NAME, //Bucket name specified in Lambda environment variables
                                Key: event.message.chat.id + '/' + hash + '.mp3', //"Folder" and filename
                                Body: data.AudioStream
                            };
                            
                            //Upload file to S3
                            s3.upload(params_upload, function(err, data1) {
                                if (err){
                                    console.log(err, data1);
                                }
                                else{
                                    console.log('File is ready');
                                    
                                    // Create the post request
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
                
                            });
                        }
                    });
                }
            });
        } 
    }
};
