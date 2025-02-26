# 1. Node.js 기반으로 Vite 프로젝트 빌드
FROM node:18-alpine AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json & package-lock.json 복사 후 종속성 설치
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# 4. 프로젝트 코드 복사 및 빌드 실행
COPY . .
RUN npm run build

# 5. Nginx를 이용해 정적 파일 서빙
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 6. Nginx 설정 추가 (프록시 설정)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 7. Nginx 실행
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
