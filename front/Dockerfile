FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app ./
RUN mv node_modules /node_modules && ln -s /node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
