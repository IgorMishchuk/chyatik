module.exports = {
    dynamodb: function(event, context){
        var AWS = require('aws-sdk');
        var https = require('https');
        var querystring = require('querystring');
        var dynamo = new AWS.DynamoDB();
        var dynamo_params = {
            ExpressionAttributeNames : {    //Alias for partition key name
                "#i" : "Dname"
            },
            ExpressionAttributeValues : {
                ":name" : { "S" : "Enot"}   //Alias for partition key value
            },
            TableName : process.env.DB,
            KeyConditionExpression : "#i = :name",
            ScanIndexForward : false,       //Descending sort order
            Limit : 1,                      //Show only first result, thus returning only latest entry in DN for specified partition key.
        };
        dynamo.query(dynamo_params, function(err, data) {
            if (err || data.Count == 0) {   //If DB does not have any entry for specified partition key
                if (data.Count == 0) {
                    var new_date_entry = new Date(event.message.date*1000).toISOString(); //Telegram gives date in epoch seconds, AWS processes in epoch milliseconds, thus multiplication by 1000
                    var put_params = {
                        TableName: process.env.DB,
                        Item: {
                            'Dname': {S: 'Enot'},
                            'Date': {S: new_date_entry},
                        }
                    };
                    dynamo.putItem(put_params, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log('Item put to DB');
                        }
                    });
                    var post_data = querystring.stringify({
            	        'chat_id': event.message.chat.id,
        	            'text': 'Поздравляю, Енотик, это первая твоя запись в увлекательном отслеживании периодичности твоих набегов на керамического друга.'
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
                else {
                    console.log(err);
                }
            }
            else {
                ///////////////
                var day_quantity = '';
                var hour_quantity = '';
                var minute_quantity = '';
                var second_quantity = '';
                var hour_zero = '';
                var minute_zero = '';
                var second_zero = '';
                var tz = 10800000; //Hardcoded timezone GMT+3 in milliseconds
                ///////////////
                var time = new Date(data.LastEvaluatedKey.Date.S); //Date in ISO format from DB
                //Get current date
                var now_epoch = event.message.date*1000 + tz; //Correction of telegram epoch time for GMT+3
                //Get date from DB
                var db_epoch = time.getTime() + tz; //Conversion of ISO to epoch format. Correction for GMT+3
                var db_time = new Date(db_epoch); //Conversion from epoch to ISO
                //Calculate time diff
                var diff = now_epoch - db_epoch; //Calculate time difference between message and latest entry n DB, in milliseconds
                ////////////////////
                var d_names = new Array("Воскресенье", "Понедельник", "Вторник", "Среду", "Четверг", "Пятницу", "Субботу"); //Array of week days
                var curr_day = db_time.getDay(); //Get day number in a week
                var day_separator = curr_day == 2 ? 'во' : 'в'; //Tuesday requires different prepending word
                ///////////////////
                var curr_date = db_time.getDate(); //Get day number in month
                var m_names = new Array("Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"); //Array of months
                var curr_month = db_time.getMonth(); //Get month number
                var db_hours = db_time.getHours(); //Get hours
                hour_zero = db_hours < 10 ? '0' : ''; //If hour is <10, prepend 0
                var db_minutes = db_time.getMinutes(); //Get minutes
                minute_zero = db_minutes < 10 ? '0' : ''; //If minute is <10, prepend 0
                var db_seconds = db_time.getSeconds(); //Get seconds
                second_zero = db_seconds < 10 ? '0' : ''; //If second is <10, prepend 0
                ///////////////////
                //Display time diff
                var total_seconds = diff / 1000; //Calculate difference in seconds
                var days = Math.floor(total_seconds / (60*60*24)); //Calculate number of whole days in difference
                switch (days) {
                    case 1:
                    case 21:
                    case 31:
                      day_quantity = 'день';
                      break;
                    case 2:
                    case 3:
                    case 4:
                    case 22:
                    case 23:
                    case 24:
                      day_quantity = 'дня';
                      break;
                    default:
                      day_quantity = 'дней';
                  }
                var hours_leftover = total_seconds % (60*60*24); //Calculate remaining hours
                var hours = Math.floor(hours_leftover / (60*60)); //Calculate number of whole hours in difference
                switch (hours) {
                    case 1:
                    case 21:
                      hour_quantity = 'час';
                      break;
                    case 2:
                    case 3:
                    case 4:
                    case 22:
                    case 23:
                      hour_quantity = 'часа';
                      break;
                    default: 
                      hour_quantity = 'часов';
                  }
                var minutes_leftover = hours_leftover % (60*60); //Calculate remaining minutes
                var minutes = Math.floor(minutes_leftover / 60); //Calculate number of whole minutes in difference
                switch (minutes) {
                    case 1:
                    case 21:
                    case 31:
                    case 41:
                    case 51:
                      minute_quantity = 'минуту';
                      break;
                    case 2:
                    case 3:
                    case 4:
                    case 22:
                    case 23:
                    case 24:
                    case 32:
                    case 33:
                    case 34:
                    case 42:
                    case 43:
                    case 44:
                    case 52:
                    case 53:
                    case 54:
                      minute_quantity = 'минуты';
                      break;
                    default:
                      minute_quantity = 'минут';
                  }
                var seconds = Math.floor(minutes_leftover % 60); //Calculate number of whole seconds in difference
                switch (seconds) {
                    case 1:
                    case 21:
                    case 31:
                    case 41:
                    case 51:
                      second_quantity = 'секунду';
                      break;
                    case 2:
                    case 3:
                    case 4:
                    case 22:
                    case 23:
                    case 24:
                    case 32:
                    case 33:
                    case 34:
                    case 42:
                    case 43:
                    case 44:
                    case 52:
                    case 53:
                    case 54:
                      second_quantity = 'секунды';
                      break;
                    default:
                      second_quantity = 'секунд';
                  }
                var phrase = 'Последнее событие было ' + days + ' ' + day_quantity + ' ' + hours + ' ' + hour_quantity + ' ' + minutes + ' ' + minute_quantity + ' ' + seconds + ' ' + second_quantity + ' тому назад, ' + day_separator + ' ' + d_names[curr_day] + ', ' + curr_date + ' ' + m_names[curr_month] + ' в ' + hour_zero + db_hours + ':' + minute_zero + db_minutes + ':' + second_zero + db_seconds;
                console.log(phrase);
                var post_data = querystring.stringify({
            	    'chat_id': event.message.chat.id,
        	        'text': phrase
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
            ////////
                var new_date_entry = new Date(event.message.date*1000).toISOString(); //Convert telegram epoch time *1000 to ISO format
                var put_params = {
                    TableName: process.env.DB,
                    Item: {
                        'Dname': {S: 'Enot'},
                        'Date': {S: new_date_entry},
                    }
                };
                dynamo.putItem(put_params, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('New date has been addded to DB: ' + new_date_entry);
                    }
                });
            }
        });

    }
};