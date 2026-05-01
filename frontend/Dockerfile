# Use Node 23
FROM node:23-slim

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]