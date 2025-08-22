# Admin Panel Starter (React Vite + AntD / NestJS + Prisma + PostgreSQL)

Стек:
- Frontend: React + Vite + TypeScript + Ant Design
- Backend: NestJS + Prisma + PostgreSQL + JWT (роль ADMIN)
- Docker Compose под PostgreSQL

## Быстрый старт

1) Установите зависимости:
```bash
cd backend && npm i
cd ../frontend && npm i
```

2) Поднимите БД:
```bash
cd ..
docker compose up -d
```

3) Настройте переменные окружения:
- Скопируйте `backend/.env.example` -> `backend/.env` (или задайте свои значения).
- (Опционально) создайте `frontend/.env` с `VITE_API_URL=http://localhost:3000`.

4) Примените миграции и сиды (создаст admin пользователя):
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

5) Запустите backend и frontend в двух терминалах:
```bash
cd backend && npm run start:dev
cd ../frontend && npm run dev
```

6) Вход в админку:
- Email: `admin@admin.com`
- Password: `admin123`

## API
- `POST /auth/login` — вход (получение JWT)
- `POST /auth/register` — регистрация
- `/drugs` — CRUD (GET/POST/PUT/DELETE). Для POST/PUT/DELETE требуется роль `ADMIN`.
