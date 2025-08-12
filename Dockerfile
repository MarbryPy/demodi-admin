FROM node:18-alpine

WORKDIR /app

# copy root manifests (this brings package-lock.json too)
COPY package*.json ./

# install deps (root has the lockfile)
RUN npm ci

# copy the rest of the repo
COPY . .

# build (uses your root package.json scripts)
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
