FROM node:17.8-alpine3.15

COPY . .

RUN yarn build
RUN npm prune --production

FROM node:17.8-alpine3.15

ENV NODE_ENV=production

COPY --from=0 dist .
COPY --from=0 node_modules node_modules


CMD ["node", "index"]