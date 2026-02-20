# SLPCH Retro SCU

Внутренний стилизованный портал SCU (Special Cases Unit) на Next.js с эффектами CRT/boot, ретро-интерфейсом, PostgreSQL и админ-панелью для разделов PSI, personnel, cases и partners.

## Стек

- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- CSS (без UI-фреймворков)

## Быстрый старт

Требования:
- Node.js 20+
- npm 10+
- PostgreSQL (должен быть запущен до старта Next.js)

## Порядок запуска `dev` на локальной Windows машине

1. Поднять PostgreSQL.

Вариант A (если установлен как Windows service):

```powershell
Get-Service *postgres*
Start-Service <postgres_service_name>
```

Вариант B (portable-установка, как в этом проекте):

```powershell
$PGROOT="$env:USERPROFILE\postgresql16-local\pgsql-16.12\pgsql"
$PGDATA="$env:USERPROFILE\postgresql16-local\data"
& "$PGROOT\bin\pg_ctl.exe" -D "$PGDATA" -l "$PGDATA\postgres-runtime.log" start
```

2. Проверить порт БД:

```powershell
Test-NetConnection -ComputerName localhost -Port 5432
```

Ожидается `TcpTestSucceeded: True`.

3. Запустить Prisma и dev:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Приложение поднимется на `http://localhost:3000`.

4. Остановка (при необходимости):

```powershell
# dev (пример: порт 3000)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess

# PostgreSQL portable
$PGROOT="$env:USERPROFILE\postgresql16-local\pgsql-16.12\pgsql"
$PGDATA="$env:USERPROFILE\postgresql16-local\data"
& "$PGROOT\bin\pg_ctl.exe" -D "$PGDATA" stop
```

Перед запуском заполните `.env` на основе `.env.example`.

## Команды

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Структура проекта

- `app/` - маршруты и layout (App Router)
- `components/` - UI-компоненты и оболочка ретро-терминала
- `components/admin/` - компоненты панели администратора
- `content/` - fallback/legacy данные для публичных разделов
- `context/` - глобальный FX-контекст (звук/переходы/safe mode)
- `lib/` - prisma/auth/rich-text/media утилиты
- `prisma/` - схема, миграции и seed
- `storage/media/psi` - хранилище фотографий PSI (вне `public`)
- `styles/` - основные стили ретро-темы
- `types/` - общие типы
- `constants/` - константы (например ключи localStorage)
- `public/` - статика

## Где менять контент

- Главное меню: `content/nav.ts`
- Runtime-контент всех карточек: PostgreSQL через Prisma-модели
  - `PersonnelCard`
  - `CaseCard` + `CaseCardBullet`
  - `PartnerCard` + `PartnerCardBullet`
  - `PsiCard` + `PsiCardBullet`
- Админские CRUD UI:
  - `components/admin/PersonnelAdminSection.tsx`
  - `components/admin/CasesAdminSection.tsx`
  - `components/admin/PartnersAdminSection.tsx`
  - `components/admin/PsiAdminPanel.tsx`
- Legacy/fallback контент (используется при недоступности БД):
  - `content/personnel.ts`
  - `content/cases.ts`
  - `content/partners.ts`
  - `content/psi.ts`

Публичные страницы `/personnel`, `/cases`, `/partners`, `/psi` рендерятся из БД и используют fallback на `content/*` при ошибке доступа к данным.

## FX и переходы

- Настройки (звук/safe mode) хранятся в `localStorage` по ключу `scu-retro-prefs-v1`
- Логика переходов и звука: `context/FxContext.tsx`
- Навигация с оверлеем перехода: `components/RetroLink.tsx` и `components/RouteFxOverlay.tsx`
- Вход админа открывается кликом по эмблеме `POLICE` в `TopHeader`
- Админ-панель: `/admin`

## API админки

- Аутентификация:
  - `POST /api/admin/login`
  - `POST /api/admin/logout`
  - `GET /api/admin/session`
- CRUD-контент:
  - `GET/POST /api/admin/personnel`
  - `PATCH/DELETE /api/admin/personnel/[id]`
  - `GET/POST /api/admin/cases`
  - `PATCH/DELETE /api/admin/cases/[id]`
  - `GET/POST /api/admin/partners`
  - `PATCH/DELETE /api/admin/partners/[id]`
  - `GET/POST /api/admin/psi`
  - `PATCH/DELETE /api/admin/psi/[id]`
- Медиа:
  - `POST /api/admin/upload/photo`
  - `GET /api/media/psi/[file]`

## Переменные окружения

См. `.env.example`:

- `DATABASE_URL`
- `ADMIN_LOGIN` (fallback: `admin`)
- `ADMIN_PASSWORD` (fallback: `12345`)
- `SESSION_SECRET` (в production обязателен)

## Проверка перед сдачей

```bash
npm run lint
npm run build
```

Обе команды должны завершаться без ошибок.
