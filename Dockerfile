FROM node:16-slim AS base
LABEL maintainer="https://github.com/chrismeller"

ENV BOARDS=
ENV NATS_URL=
ENV SQLITE_LOCATION=

EXPOSE 3000

WORKDIR /home/node/app

FROM base AS build

# install our temporary dependencies
ARG TEMP_INSTALL="curl tar python3 make g++"
RUN apt-get update && apt-get install -y ${TEMP_INSTALL} && apt-get clean -y && apt-get autoclean -y && apt-get autoremove -y

# update yarn to the latest of the 1.x series
ENV YARN_VERSION 1.22.10
RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz

# copy both npm and yarn package files
COPY package*.json ./
# wildcard in case it doesn't exist
COPY yarn*.lock ./

# also our typescript and nest configs
COPY tsconfig*.json ./
COPY nest-cli.json ./

# install all dependencies, ensuring that we're installing dev as well
RUN yarn install --production=false

# copy all the app source
COPY ./src ./src

# also copy our custom build scripts
COPY ./build ./build

RUN yarn run build

# remove all node modules and reinstall only the prod ones
RUN rm -rf node_modules && yarn install --frozen-lockfile --production=true

FROM base AS release

ENV NODE_ENV=production

# copy our built assets from our build layer
COPY --from=build /home/node/app/dist ./dist

# copy our package json files from the build layer
COPY --from=build /home/node/app/package*.json ./
COPY --from=build /home/node/app/yarn*.lock ./

#RUN yarn install --frozen-lockfile --production=true
# copy over all node modules from build
COPY --from=build /home/node/app/node_modules ./node_modules

# ensure that an empty db directory exists
RUN mkdir ./db

# make sure everything is owned by the node user
RUN chown -R node:node .

# now that we're done installing, run the app as the node user, not root
USER node

CMD ["node", "dist/main"]

