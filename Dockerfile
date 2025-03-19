FROM node:18-alpine AS builder

WORKDIR /cherryapp-frontend

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile


COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /cherryapp-frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx","-g","daemon off;"]