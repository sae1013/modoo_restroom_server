# ------------------------------------------------------------
# 1. Build 스테이지: TypeScript 컴파일과 의존성 설치
# ------------------------------------------------------------
FROM node:20-alpine AS builder

# 작업 디렉터리 설정
WORKDIR /usr/src/app

# 1-1. package*.json 복사 후 의존성 전체 설치
COPY package*.json ./
RUN npm install

# 1-2. 소스 코드 전체 복사
COPY . .

# 1-3. NestJS 빌드 (dist 폴더 생성)
RUN npm run build


# ------------------------------------------------------------
# 2. Runtime 스테이지: Production 모드 전용
# ------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# 2-1. package*.json만 복사
COPY package*.json ./

# 2-2. Production 전용 의존성만 설치
RUN npm install --only=production

# 2-3. 빌드된 결과물(dist) 복사
COPY --from=builder /usr/src/app/dist ./dist

# 2-4. .env 파일도 복사 (필요 시)
#      ※ 주의: 환경변수를 Docker Compose에서 주입해주므로,
#         컨테이너 내부에서도 NODE_ENV 등에 접근 가능합니다.
COPY .env ./

# 2-5. 기본 환경변수 설정 (fallback 용)
ENV NODE_ENV=production
ENV PORT=8000

# 2-6. 컨테이너가 외부에 노출할 포트
EXPOSE 8000

# 2-7. NestJS 프로덕션 모드 실행
CMD ["npm", "run", "start:prod"]
