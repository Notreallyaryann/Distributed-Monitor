FROM node:22-alpine

WORKDIR /app

# Install OpenSSL and necessary build tools for Prisma
RUN apk add --no-cache openssl python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies - use npm install to sync lock file with new Prisma v7
RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

# Copy remaining application code
COPY . .

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Clear npm cache to avoid binary issues
RUN npm cache clean --force

ENTRYPOINT ["/app/start.sh"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

