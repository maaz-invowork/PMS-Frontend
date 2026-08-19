FROM node:20-alpine

WORKDIR /app

# Copy dependency files first for optimal Docker layer caching
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

# Start Vite dev server exposing port 5173 to external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]