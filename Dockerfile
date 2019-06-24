FROM node:12.4
EXPOSE 3000
WORKDIR /app
RUN mkdir -p /app/node_modules /app
COPY package.json /app/package.json
RUN yarn --ignore-scripts --production
COPY . /app
CMD yarn start
