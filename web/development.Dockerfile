FROM node:16-alpine3.15

RUN npm install -g @vue/cli

RUN mkdir -p /usr/src/web
WORKDIR /usr/src/web

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]
