# Use the official Node.js 20.12.2 image as the base
FROM node:20.12.2

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Expose the port your app runs on (default: 3000)
EXPOSE 3000

# Command to start the application
CMD ["node", "backend.js"]
