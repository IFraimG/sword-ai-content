FROM node:20-alpine

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Expose server port
EXPOSE 3001

# Start Fastify server
CMD ["node", "index.js"]
