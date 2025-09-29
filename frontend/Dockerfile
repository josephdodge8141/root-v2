FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN rm -rf .next
RUN rm -rf node_modules/.cache

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--open", "false"]