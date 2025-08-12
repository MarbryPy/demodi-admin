# Use Node 18 in a small image
FROM node:18-alpine

# Create app dir
WORKDIR /app

# Copy root package files (if present)
COPY package*.json ./

# Install root deps (if any). If none, this will just noop.
RUN if [ -f package.json ]; then npm ci; fi

# Copy source
COPY client ./client
COPY server ./server
COPY shared ./shared

# Install client deps + build static files
RUN npm --prefix client ci
RUN npm --prefix client run build

# Install tools to run TypeScript server at runtime
RUN npm i -D ts-node typescript

# Expose web port
EXPOSE 3000

# Start your server (TypeScript entry)
CMD ["node", "--loader", "ts-node/esm", "server/index.ts"]
