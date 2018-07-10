Serverless Telegram bot
=======================

Intro
-----
This serverless telegram bot was written as a part of self education during AWS Solutions Architect Assoiciate training courses. 

It uses next AWS services:
1. [API Gateway](https://aws.amazon.com/api-gateway);
2. [Lambda](https://aws.amazon.com/lambda/) (node.js 6.10);
3. [S3](https://aws.amazon.com/s3/);
4. [Polly](https://aws.amazon.com/polly/);
5. [Cloudwatch](https://aws.amazon.com/cloudwatch/).

At the moment, it has two functions:  
1. Send received text to Polly and have it converted to speech. (speech.js)
2. Process text not meant for conversion to speech. (texting.js)

Prerequisites
-------------
What you need for this to work:
1. Telegram bot. [How to create Telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot).
2. [AWS account](https://aws.amazon.com/). Free tier is OK, but make sure that your AWS usage stays in Free tier [limits](https://aws.amazon.com/free/).

Deployment
-----------
1. Create S3 bucket which will be used by your Lambda function. Example uses eu-west-3 availability zone. Change line **72** of *speech.js* to fit your config;
2. Create Lambda function:
	- Runtime: Node.js 6.10;
	- Roles should allow:
		- Read\Write permissions to S3;
		- Access to Polly;
		- Access to Cloudwatch logs;
	- Defite API Gateway as trigger;
	- Import three files to Lambda:
		- index.js
		- speech.js
		- texting.js
	- Specify Environment variables for BOT_API_KEY and BUCKET_NAME;
	- Save created Lambda function.
3. Deploy API gateway:
	- Method "Post";
	- Integration type "Lambda Function";
	- Specify your Lambda name in "Lambda fucntion" field;
	- Actions -> Deploy API; Invoke URL will be used for webhook from Telegram bot.
4. Create a webhook from Telegram URL to **Invoke URL** of API gateway. [Webhook how-to](https://core.telegram.org/bots/api#setwebhook).
5. [Configure](https://core.telegram.org/bots/inline) Bot to inline mode.

That's it, you're ready.
*********
To clarify - I'm not a developer and code you're going to see might violate some (or many) best practices for code writing. If you do notice mistakes, please, suggest your correction with brief explanation.

Thanks.