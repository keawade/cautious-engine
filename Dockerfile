FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm clean-install

COPY tsconfig.json .
COPY src src

RUN npm run build

FROM node:20-alpine as runtime

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
RUN npm prune --production

CMD ["node", "dist/node.js"]
