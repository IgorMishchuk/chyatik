console.log('Loading event');
var AWS = require('aws-sdk');
var https = require('https');
var querystring = require('querystring');
var reply = '';
var message = '';

var botAPIKey = %YOUR_BOTAPIKEY%;

//Define phrase arrays for persons
var igoryan = ["Симпотный.", "ЭмЗи.", "В каком году Шар поставили?", "Сколько тебе лет?", "Тебе скоро 31 год!"];
var evgeniy = ["ГДЕ ФОТКИ???", "Приоритет поставь!", "Мааарииинаааа!", "Иди печеньки похавай.", "Обожаю бюджетников."];
var enot = ["Ощущения ™.", "Прага.", "Эчпочмаки.", "Мазда 3.", "Шоб с блестяшками."];
var roma = ["Вас понял.", "Два ремня.", "Толку от выборов?", "Светлейший лидер!", "Лучший фраг - тимкил!"];
var artur = ["Не нервничай!!!", "Саундбар.", "Лего за дохуя денег.", "Мне лень.", "Б-га нет."];
var vlad = ["Идём на бокс!", "Паляниця", "Ты плойку купил?", "Підстаркуваті", "Гарбузик."];
var youmu = ["ЧСВ", "Все шуруй в Нир", "Говноеды", "Вы все говно.", "А я д'Артаньян!"];
var alexei = ["Идём бухать.", "Шта?!", "Море? Какое море?", "Нет доказательств - нет дискуссии.", "Место под ещё одну фразу на которую у меня не хватило фантазии."];
var forbidden = ["Русня!", "Дядя выбрал сторону. Я на другой стороне.", "Земля стекловатой.", "Ракеты НАТО в Крыму!", "Мышебратья."];
var default_reply = ["Чё сказал?", "Вася", "Э, пасанчик", "Закройся", "Поговори мне тут", "Сыш!", "Слава роботам!", "Смерть человекам!", "Чё прицепился?", "Отвянь"];


exports.handler = function(event, context) {
    // Log the basics, just in case
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));
    message = event.message.text.toLowerCase();
    switch (message) {
        case '/igoryan':
        case '/igoryan@lolkek2_bot':
            reply = igoryan[Math.floor(Math.random() * igoryan.length)];
            break;
        case '/evgeniy':
        case '/evgeniy@lolkek2_bot':
            reply = evgeniy[Math.floor(Math.random() * evgeniy.length)];
            break;
        case '/enot':
        case '/enot@lolkek2_bot':
            reply = enot[Math.floor(Math.random() * enot.length)];
            break;
        case '/roma':
        case '/roma@lolkek2_bot':
            reply = roma[Math.floor(Math.random() * roma.length)];
            break;
        case '/artur':
        case '/artur@lolkek2_bot':
            reply = artur[Math.floor(Math.random() * artur.length)];
            break;
        case '/vlad':
        case '/vlad@lolkek2_bot':
            reply = vlad[Math.floor(Math.random() * vlad.length)];
            break;
        case '/youmu':
        case '/youmu@lolkek2_bot':
            reply = youmu[Math.floor(Math.random() * youmu.length)];
            break;
        case '/alexei':
        case '/alexei@lolkek2_bot':
            reply = alexei[Math.floor(Math.random() * alexei.length)];
            break;
        case '/forbidden':
        case '/forbidden@lolkek2_bot':
            reply = forbidden[Math.floor(Math.random() * forbidden.length)];
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