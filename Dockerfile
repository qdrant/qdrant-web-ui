# Declare the base image
FROM node:20-alpine3.18

# 1. copy package.json and package-lock.json to /app dir
RUN mkdir /app
COPY package*.json /app

# 2. Change working directory to newly created app dir
WORKDIR /app

# 3 . Install dependencies
RUN npm ci

# 4. Copy the source code to /app dir
COPY . .

# 5. Expose port 3000 on the container
EXPOSE 3000

# 6. Run the app
CMD ["npm", "run", "start"]
