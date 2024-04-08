# Используем образ линукс Alpine с версией node 14
FROM node:20-alpine

# Указываем нашу рабочую деректорию
WORKDIR /app

# Скапировать package.json & package-lock.json внутрь контейнера
COPY package*.json ./

#Установка зависимостей
RUN npm install

# Капируем все остальное приложение в контейнер
COPY . .

# Установка PRISMA
RUN npm install -g prisma

# Генерируем prisma client
RUN prisma generate

# Капируем prisma schema
COPY prisma/schema.prisma ./prisma/

# Открыть порт в нашем контейнере
EXPOSE 3000

# Запускаем наш сервер
CMD [ "npm", "start" ]