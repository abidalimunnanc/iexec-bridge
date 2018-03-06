FROM node:9.7.1-alpine

RUN mkdir -p /app
WORKDIR /app

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python2 python2-dev py-setuptools dumb-init musl linux-headers build-base ca-certificates

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

CMD ["npm", "start"]
