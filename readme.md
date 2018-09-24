Serverless Telegram bot
=======================

Intro
-----
This serverless telegram bot was written as a part of self education during AWS Solutions Architect Assoiciate and AWS Developer Associate training courses. 

It uses next AWS services:
1. [API Gateway](https://aws.amazon.com/api-gateway);
2. [Lambda](https://aws.amazon.com/lambda/) (node.js 6.10);
3. [S3](https://aws.amazon.com/s3/);
4. [Polly](https://aws.amazon.com/polly/);
5. [Cloudwatch](https://aws.amazon.com/cloudwatch/);
6. [DynamoDB](https://aws.amazon.com/dynamodb/).

At the moment, it has three functions:  
1. Send received text to Polly and have it converted to speech. (speech.js)
2. Calculate time difference between specific message and latest entry in DB (dynamo.js)
3. Process text not meant for conversion to speech. (texting.js)

Prerequisites
-------------
What you need for this to work:
1. Telegram bot. [How to create Telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot).
2. [AWS account](https://aws.amazon.com/). Free tier is OK, but make sure that your AWS usage stays in Free tier [limits](https://aws.amazon.com/free/).

Deployment
-----------
1. Create S3 bucket which will be used by your Lambda function. Bucket name will be specified as Value for BUCKET_NAME environmental variable.
2. Create DynamoDB table:
	- Table name will be specified as Value for DB environmental variable;
	- Primary key will contain name of person for whom we are calculating time difference. Key name will be used in Query and Put operations. In this example key name is "Dname". Set type to String;
	- Sort key will contain date of message from target person. In this example key name is "Date". Set type to String;
	- Untick "Use default settings";
	- Untick Autoscaling for Read and Write capacity units;
	- Set provisioned capacity to 5 for Read and Write capacity units. If you need more, please, check this [guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html) for provisioned throughput calculation. Remember that DynamoDB is subject to [free tier](https://aws.amazon.com/dynamodb/pricing/) for 25 RCU/WCU.
3. Create Lambda function:
	- Runtime: Node.js 6.10;
	- Role should allow:
		- Read\Write permissions to S3;
		- Full access to Polly;
		- Access to Cloudwatch logs;
		- Permissions for Query and PutItem for DynamoDB;
	- Import four files\ZIP archive to Lambda:
		- index.js
		- speech.js
		- texting.js
		- dynamo.js
	- Specify Environment variables for BOT_API_KEY, BUCKET_NAME, DB and optionally CHAT1, TEST_CHAT, USER1 and USER2. Last 4 are used in index.js to filter which chats\users are allowed to interact with specific function parts;
	- Save created Lambda function.
4. Create API Gateway:
	- Actions -> Create method POST;
	- Integration type "Lambda Function";
	- Specify your Lambda name in "Lambda fucntion" field;
	- Actions -> Deploy API:
		- Deployment stage [New stage];
		- Stage name "main", for example.
	- **Invoke URL** of the stage will be used for Webhook creation to Telegram bot API. It looks like https://<API_NUMBER>.execute-api.<AWS_REGION>.amazonaws.com/<STAGE_NAME>.
5. Create a webhook from Telegram URL to **Invoke URL** of API gateway. [Webhook how-to](https://core.telegram.org/bots/api#setwebhook). Command will look like this "curl --data url=https://<INVOKE_URL> https://api.telegram.org/bot<BOT_API_KEY>/setWebhook"
6. [Configure](https://core.telegram.org/bots/inline) Bot to inline mode.

That's it, you're ready.
*********
To clarify - I'm not a developer and code you're going to see might violate some (or many) best practices for code writing. If you do notice mistakes, please, suggest your correction with brief explanation.

Thanks.
