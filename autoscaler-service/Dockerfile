FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy application code
COPY . .

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run autoscaler
CMD ["node", "src/autoscaler.js"]
