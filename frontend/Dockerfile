FROM node:22-slim
WORKDIR /app

# Cài thư viện trước (tận dụng cache của Docker)
COPY package*.json ./
RUN npm ci

# Chép mã nguồn
COPY . .

# Địa chỉ backend được "đóng" vào bản build (biến NEXT_PUBLIC_ chỉ có tác dụng lúc build)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
