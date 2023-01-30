#!/bin/bash

# npm update (if necessary) 

# install Node.js dependency
npm install

# for websocket
npm install -s @nestjs/websockets @nestjs/platform-socket.io @types/socket.io

# for serving static assets
npm install --save hbs

# using the built-in validation pipe
npm i --save class-validator class-transformer

# database
npm install --save @nestjs/typeorm typeorm mysql2

# serve on localhost:3000
#npm run start
npm run start:dev

# to use the cli
#npm i -g @nestjs/cli
