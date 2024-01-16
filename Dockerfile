# Use an official Node runtime as a parent image
FROM node:21.4.0

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
# npm ERR! Could not resolve dependency:
# npm ERR! peer vitest@">=0.32.0 <1" from @vitest/coverage-v8@0.34.6
# npm ERR! node_modules/@vitest/coverage-v8
# npm ERR!   dev @vitest/coverage-v8@"^0.34.6" from the root project
# RUN npm install --legacy-peer-deps

# Install project dependencies using pnpm
RUN pnpm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["pnpm", "run", "dev"]