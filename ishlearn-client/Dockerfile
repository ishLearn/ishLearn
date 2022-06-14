# To be ignored, only for standalone backend
# Build stage, from https://github.com/tq-bit/chattergram/blob/main/frontend/fe.prod.dockerfile
FROM node:14-alpine as build-stage
WORKDIR /frontend-src
COPY package.json ./
RUN npm install -g @vue/cli
RUN npm install
COPY . .
RUN npm run build

# Production stage, not needed? 
FROM nginx as production-stage
COPY --from=build-stage /frontend/dist usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
