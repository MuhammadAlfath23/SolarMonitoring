FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Expose the API port
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
