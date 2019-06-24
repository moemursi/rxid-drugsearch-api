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

Then you can send the request to "http://<url>/drug/search/getDrugIdentifiers" using query string parameters like below:

```
drugName=<drugName>
```

The sample postman for local server testing has been added to the <strong>/misc/postman</strong> directory as a <a href="https://github.com/EdyVision/drug-search-service/blob/master/misc/postman/Drug%20Search%20Service.postman_collection.json">Postman Collection</a>.

Successful Email Submission Response: <a href="https://github.com/EdyVision/drug-search-service/blob/master/misc/postman/sampleResponse_lipitor.json">Sample Response</a>

Error Response where query string parameters are null:

```
{
    "error": "Query is empty!"
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