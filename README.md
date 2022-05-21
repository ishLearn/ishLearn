# studybook

This contains the code to the web-DB project.

## DB

### SQL

- MySQL (connector is the official [mysql](https://www.npmjs.com/package/mysql) package)

### File Storage

- S3 (connector is the AWS-SDK for Node.js version 3, docs: [`@aws-sdk/client-s3`@npmjs.com](https://www.npmjs.com/package/%40aws-sdk/client-s3) and [Amazon AWS Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html))

## Backend

- Logging with `chalk@4.1.2` and a custom logger class

### Requirements

Since the [`node-ffmpeg`-package](https://www.npmjs.com/package/ffmpeg) is used, it is required that `ffmpeg` (cl utility) is installed on the system.

### Additional information

Chalk version `5.0.0` introduced ECMAScript modules with chalk and ended support of CommonJS-modules. Since TS with `type: module` in the `package.json` did not work and fixes are very hard, and there is no compiler for node modules in use, the older version (compatible to `4.1.2`) is required. (More information on [StackOverflow](https://stackoverflow.com/questions/70309135/chalk-error-err-require-esm-require-of-es-module))

## Frontend
