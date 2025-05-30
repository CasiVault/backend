FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn
COPY . .
