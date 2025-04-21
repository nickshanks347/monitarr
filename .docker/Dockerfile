# Use a smaller base image
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json, yarn.lock, and .yarn files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn /app/.yarn

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the application code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN yarn build

# Stage 2: Create a minimal runtime image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only the standalone build and required files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]