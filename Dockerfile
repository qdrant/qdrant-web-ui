# Use node image as the base image
FROM node:20.2.0-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
# Utilize Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

# Install dependencies
RUN npm install && npm install -g serve

# Copy over remaining files 
COPY . .

# Build react app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build"]