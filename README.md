# Amazon API Gateway, AWS Step Functions, to Amazon DynamoDB CRUD API

This stack creates a fully functioning CRUD API powered by Amazon API Gateway direct integration to AWS Step Functions and backed by Amazon DynamoDB.

This was adapted from an existing serverless pattern at Serverless Land Patterns: https://serverlessland.com/patterns/apigw-sfn-crud

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Deployment Instructions

1. Install the project dependencies for this monorepo:
    ```bash
    npm install -ws
    ```
1. Run the following command to deploy to your configured AWS environment. This will build the project and deploy it.
    ```bash
    npm run deploy
    ```
1. If you are making changes during development run the following command:

```bash
npm run dev
```

This will deploy changes as you save them. You will also see log messages from your Lambdas in your CLI.

## How it works

Amazon API Gateway creates a direct integration with AWS Step Functions utilizing a synchronous call. Step functions evaluates the path and method to choose the proper action. The action steps can be modified to meet your needs.

## Testing

*CRUD = Create, Read, Update, Delete*

Once the application is deployed, use a tool like Postman or Curl to call the different CRUD endpoints. If you would like to import the Postman package, update the endpoint and import into Postman.

## Cleanup
 
Delete the stack
```bash
npm run remove
```
----
Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
