# https://www.linux.com/topic/cloud/create-open-source-aws-s3-server/
# Detached mode, exit with CTRL-P CTRL-Q
docker start -d -ti --name s3server -p 8000:8000 -e SCALITY_ACCESS_KEY_ID=accessKey1 -e SCALITY_SECRET_ACCESS_KEY=verySecretKey1 scality/s3server
