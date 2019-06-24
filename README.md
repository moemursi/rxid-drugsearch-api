# Drug Search Service
[![Build Status](https://travis-ci.org/EdyVision/drug-search-service.png)](https://travis-ci.org/EdyVision/drug-search-service)
[![Known Vulnerabilities](https://snyk.io/test/github/EdyVision/drug-search-service/badge.svg)](https://snyk.io/test/github/EdyVision/drug-search-service)

A simple drug search api written in NodeJS and built on the Serverless framework.

## What Can I Do With This?
Clone the project and spin it up. This project was used as an example on a Medium series on how to create a serverless app and set it up with CI/CD.

## Setup
Have serverless installed locally and on your CI/CD pipeline:

```
npm install -g serverless
```

Make sure that you have your AWS Key and Secret in your env vars or bash profile:

```
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
```


## Deployment
To deploy to AWS locally, make sure you have your AWS key and secret in your bash profile and execute the following:

```
sls deploy -v
```

## Usage

To execute locally, run the following command (<strong>npm install serverless -g</strong> is required):

```
sls offline --noAuth
```

or

```
npm start
```

If running locally, the beginning of your url will be http://localhost:3000

Then you can send the following JSON body to "http://<url>/drug/search/getDrugIdentifiers":
```

Successful Email Submission Response: <a href="https://github.com/EdyVision/drug-search-service/blob/master/misc/postman/sampleResponse_lipitor.json">Sample Response</a>

Unverified Email Error Response

```
{
    "statusCode": 500,
    "body": {
        "message": "Email address is not verified. The following identities failed the check in region US-EAST-1: test@test.com",
        "code": "MessageRejected",
        "time": "2019-06-01T21:24:10.080Z",
        "requestId": "6eacc776-84b3-11e9-b4ea-17b8cd3bf01c",
        "statusCode": 400,
        "retryable": false,
        "retryDelay": 80.13833346952002
    }
}
```

## CI/CD

Please find the travisci settings in the project root. Alternatively, if you would like to use Codeship, the following setup is currently used:

Setup Commands

```
npm install
npm i serverless -g
```

Test Commands

```
npm test
```

Deploy Commands (set for master)
In the environment variables, the AWS creds are setup along with the INFO_EMAIL that is grabbed via env.yml.

```
sls deploy -v
```