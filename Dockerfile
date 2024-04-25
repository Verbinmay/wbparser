FROM node:latest

WORKDIR /telegram-api
EXPOSE 3333
COPY package*.json ./
RUN yarn install
COPY . .
CMD ["yarn", "start"]