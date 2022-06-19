FROM node as vue-build
WORKDIR /frontend-src
COPY ishlearn-client/ .
RUN npm install && npm run build

FROM node as server-build
WORKDIR /backend-src
COPY . .
RUN npm install -D && npm run build

FROM node as ishlearn-server
RUN apt-get -y update
RUN apt-get install -y ffmpeg
# Arguments
ARG NODE_ENV=production

ENV NODE_ENV $NODE_ENV
ENV PORT $PORT
WORKDIR /app

COPY --from=vue-build /frontend-src/dist ./frontend-dist
COPY ["package.json", "package-lock.json*", "./"]
# Final setup and installation of node
RUN npm install
EXPOSE $PORT
# Copy files to container
COPY --from=server-build /backend-src/server/dist . 

USER node
CMD ["npm", "start"]
