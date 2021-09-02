FROM mhart/alpine-node:16 as build-deps
RUN apk add --no-cache git
RUN apk add --no-cache python2
RUN apk add --no-cache make

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

EXPOSE 3000 8001
CMD ["yarn","start"]