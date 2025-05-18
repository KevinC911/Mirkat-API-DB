# This dockerfile is only for local usages in production, don't push it to connect externally
# If you want to connect externally anyways, you should use Nginx or something similar

FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir /app/images
RUN mkdir /app/images-news
EXPOSE 3000
CMD ["node", "index.js"]