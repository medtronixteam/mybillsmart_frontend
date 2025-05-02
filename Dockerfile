FROM node:18-alpine

# Working directory set karna
WORKDIR /app

# Dependencies copy karna
COPY package.json package-lock.json ./

# ✅ Fix: Use --legacy-peer-deps to resolve dependency issues
RUN npm install --legacy-peer-deps

# Baaki files copy karna
COPY . .

# Build command
RUN npm run build

# Production server start karna
CMD ["npm", "start"]

# Port expose karna
EXPOSE 3000

