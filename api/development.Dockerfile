FROM node:16-alpine3.15

RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]
