# ISH/Learn

[![Docker Image CI](https://github.com/ishLearn/ishLearn/actions/workflows/docker-image.yml/badge.svg)](https://github.com/ishLearn/ishLearn/actions/workflows/docker-image.yml)

## Abstract

ISHLearn is the new platform for teachers and students to coordinate projects and related submissions. Apart from the possibility to submit various file formats and choose from different visibilities to allow flexibility and privacy, ISHLearn enables teachers to give individual feedback. Lastly, projects can be published to other students in order to enable faster and more agile learning with projects from other students, which allows those projects not to be forgotten, but to have a reason.

## DB

### SQL

- MySQL (connector is the official [mysql](https://www.npmjs.com/package/mysql) package)

### File Storage

- S3 (connector is the AWS-SDK for Node.js version 3, docs: [`@aws-sdk/client-s3`@npmjs.com](https://www.npmjs.com/package/%40aws-sdk/client-s3) and [Amazon AWS Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html))

## Backend

- Logging with `chalk@4.1.2` and a custom logger class

### Scripts

- start: start script for Docker container
- startExt: run the result of `tsc`
- dev: run the development server (with `nodemon`, requires `npm i -D`)
- build: Build the app with `tsc` according to the configuration in `tsconfig.json`, requires `npm i -D`
- test: Run tests with `jest`, requires `npm i -D`

### Requirements

- Since the [`node-ffmpeg`-package](https://www.npmjs.com/package/ffmpeg) is used, it is required that `ffmpeg` (cl utility) is installed on the system.
- A `redis-server` must be running (preferrably on the same machine) for enabling of fast caching
  - Best to use is the preview image from [`RedisLabs`](https://hub.docker.com/r/redislabs/redismod) (`docker run -p 6379:6379 redislabs/redismod:preview`)
  - The redis server is _optional_, but decreases latency when products have recently already been pulled from the DB. This is because the `redislabs/redismod:preview`-package does not work with `arm64`-architecture.
- An S3-server (e.g., the docker image from [scality/s3server](https://hub.docker.com/r/scality/s3server/) (e.g., on `linux/amd64`-machines) or [minio/minio](https://hub.docker.com/r/minio/minio) (e.g., on `linux/arm64`-machines, that do not run `scality/s3server`))

### Additional information

Chalk version `5.0.0` introduced ECMAScript modules with chalk and ended support of CommonJS-modules. Since TS with `type: module` in the `package.json` did not work and fixes are very hard, and there is no compiler for node modules in use, the older version (compatible to `4.1.2`) is required. (More information on [StackOverflow](https://stackoverflow.com/questions/70309135/chalk-error-err-require-esm-require-of-es-module))

## Frontend
