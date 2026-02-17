# SLPCH Retro SCU

Внутренний стилизованный портал SCU (Special Cases Unit) на Next.js с эффектами CRT/boot, ретро-интерфейсом, PostgreSQL и админ-панелью для раздела PSI.

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

Установка и запуск:

```bash
npm install
npm run prisma:generate
npm run dev
```

Приложение поднимется на `http://localhost:3000`.

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
- `content/` - статические данные legacy-разделов
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
- Кадры: `content/personnel.ts`
- Архив дел: `content/cases.ts`
- Партнеры: `content/partners.ts`
- Лица особого интереса (runtime): PostgreSQL (`PsiCard`, `PsiCardBullet`)
- Лица особого интереса (legacy reference): `content/psi.ts`

Публичная страница PSI (`app/psi/page.tsx`) рендерится из БД.

## FX и переходы

- Настройки (звук/safe mode) хранятся в `localStorage` по ключу `scu-retro-prefs-v1`
- Логика переходов и звука: `context/FxContext.tsx`
- Навигация с оверлеем перехода: `components/RetroLink.tsx` и `components/RouteFxOverlay.tsx`
- Вход админа открывается кликом по эмблеме `POLICE` в `TopHeader`
- Админ-панель: `/admin`

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
