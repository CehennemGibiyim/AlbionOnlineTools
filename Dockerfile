# Multi-stage Dockerfile for Albion Tools

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (omit dev dependencies)
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy application files (excluding node_modules per .dockerignore)
COPY . .

# Build database
RUN npm run build-db || true

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S albion -u 1001

# Copy from builder
COPY --from=builder --chown=albion:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=albion:nodejs /app . .

# Switch to non-root user
USER albion

# Health check using node (no external dependencies)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start web server with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
