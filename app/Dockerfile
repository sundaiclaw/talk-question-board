FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY public ./public
COPY server ./server
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "start"]
