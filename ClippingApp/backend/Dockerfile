FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Create required directories
RUN mkdir -p uploads exports

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]