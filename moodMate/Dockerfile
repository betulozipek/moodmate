# Base image olarak Node.js kullan
FROM node:18

# Uygulamanın çalışacağı dizini belirt
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Node.js bağımlılıklarını yükle
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Projenin dinleyeceği portu belirt
EXPOSE 5000

# Uygulamayı başlat
CMD ["node", "server.js"]
