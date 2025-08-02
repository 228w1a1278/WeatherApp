# Use Expo CLI base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install -g expo-cli && npm install

# Start the Expo project (development mode)
CMD ["npx", "expo", "start", "--tunnel"]
