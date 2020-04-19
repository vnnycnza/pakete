# https://jdlm.info/articles/2019/09/06/lessons-building-node-app-docker.html
FROM node:latest
RUN mkdir /pakete && chown node:node /pakete
USER node
WORKDIR /pakete
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# TODO: Can remove once we have some dependencies in package.json.
RUN mkdir -p node_modules