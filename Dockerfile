FROM node as vue-build
WORKDIR /frontend-src
COPY ishlearn/ ./ishlearn
RUN cd frontend-src && npm install && npm run build

FROM node as server-build
ENV NODE_ENV=production
WORKDIR /app
COPY --from=vue-build /frontend-src/dist ./ishlearn/dist
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
EXPOSE 80
# Change COPY to server/
COPY . . 
CMD ["npm", "start"]
