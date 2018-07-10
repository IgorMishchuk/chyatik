console.log('Loading event');
var AWS = require('aws-sdk');
var speech = require('./speech'); // Text to speech conversion part
var texting = require('./texting'); //Text handling other than speech conversion

exports.handler = function(event, context) {
    // Log the basics, just in case
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));
    
    //Determine if incoming message is for speech conversion
    if (event.message.text.toLowerCase().startsWith('/voice')){
        console.log('Polly entered');
        speech.vocal(event, context);
    }
    
    //Process text which was not for speech conversion
    else {
        console.log('Texting entered');
        texting.texting(event, context);
    }
};