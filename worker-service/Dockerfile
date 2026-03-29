FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run worker
CMD ["node", "src/worker.js"]
