# Stage 1: Build the Next.js app
FROM node:18 AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Build the Next.js project
RUN npm run build

# Stage 2: Run the app
FROM node:18
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/components ./components
COPY --from=builder /app/context ./context
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/models ./models
COPY --from=builder /app/store ./store
COPY --from=builder /app/types ./types
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3000

# Run the app in production mode
CMD ["npm", "run", "start"]
