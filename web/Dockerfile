FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# regenerate lockfile to match package.json
RUN rm -rf node_modules package-lock.json && npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]