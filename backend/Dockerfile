FROM node:22-slim
WORKDIR /app

# Cài thư viện trước (tận dụng cache của Docker)
COPY package*.json ./
RUN npm ci

# Chép mã nguồn rồi build
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/main"]
