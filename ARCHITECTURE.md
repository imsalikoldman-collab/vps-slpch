# Architecture

## 1) Общая модель

Приложение реализовано как контентный ретро-портал с гибридной моделью данных:

- слой представления: `app/*/page.tsx` + `components/*`
- runtime-данные: PostgreSQL через Prisma (`prisma/schema.prisma`, `lib/*-data.ts`)
- fallback-данные: `content/*.ts` (используются при недоступности БД)
- серверный слой: `app/api/admin/*` и `app/api/media/psi/[file]/route.ts`
- аутентификация админа: `lib/auth.ts` (signed `httpOnly` cookie)
- FX/переходы: `context/FxContext.tsx`
- стили: `app/globals.css` + `styles/retro.css`

## 2) Маршруты

Публичные:

- `/` - главное меню разделов
- `/personnel` - кадровый реестр
- `/cases` - архив материалов дел
- `/partners` - сотрудничающие организации
- `/psi` - лица особого интереса

Служебные:

- `/admin` - защищенная админ-панель (server-side проверка сессии)

API:

- auth: `/api/admin/login`, `/api/admin/logout`, `/api/admin/session`
- CRUD: `/api/admin/personnel`, `/api/admin/cases`, `/api/admin/partners`, `/api/admin/psi`
- media: `/api/admin/upload/photo`, `/api/media/psi/[file]`

## 3) Композиция приложения

Точка входа:

- `app/layout.tsx`
  - подключает глобальные стили
  - оборачивает приложение в `FxProvider`
  - рендерит `RetroShell`

Оболочка:

- `components/RetroShell.tsx`
  - `TopHeader` (клик по эмблеме открывает login overlay)
  - `AccessBar`
  - `PrefsPanel`
  - `main` с контентом страниц
  - `StatusFooter`
  - CRT-слои
  - `RouteFxOverlay`
  - `AdminLoginOverlay`

## 4) Поток данных (публичные страницы)

Для `/personnel`, `/cases`, `/partners`, `/psi` используется одна схема:

1. Страница получает данные из PostgreSQL через `lib/*-data.ts`.
2. Если запрос успешен, рендерится runtime-контент из БД.
3. Если БД недоступна/ошибка запроса, включается fallback на `content/*.ts`.

В результате фронт остается работоспособным даже при проблемах с БД.

## 5) Админка и CRUD

- Страница `/admin` проверяет сессию через `validateAdminSession()` (`lib/auth.ts`).
- При валидной сессии рендерится `components/admin/PsiAdminPanel.tsx`.
- Панель содержит вкладки для всех разделов: personnel, cases, partners, psi.
- Запись/редактирование/удаление выполняются через `app/api/admin/*`.
- Валидация входных payload вынесена в `lib/*-validators.ts`.

## 6) Аутентификация

- Cookie: `scu_admin_session` (`httpOnly`, `sameSite=lax`, срок 8 часов).
- Подпись токена: HMAC SHA-256 (`SESSION_SECRET`).
- В production `SESSION_SECRET` обязателен.
- Все admin API-роуты проверяют доступ через `validateAdminRequest()`.

## 7) Rich Text и classified-маскирование

- Карточки `psi/cases/partners` хранят rich text как JSON-документы.
- Рендер выполняется в `lib/psi-richtext.tsx`.
- Маркер `classified` маскируется в публичном режиме через `Redacted` (`██████`).
- Это часть UX-паттерна проекта и не должна удаляться без эквивалентной замены.

## 8) Медиа-слой PSI

- Загрузка изображений: `POST /api/admin/upload/photo`.
- Хранение файлов: `storage/media/psi`.
- Выдача файлов: `GET /api/media/psi/[file]`.
- Имя файла нормализуется/валидируется (`lib/media.ts`) для защиты от path traversal.

## 9) Навигация и FX

- Навигация выполняется через `components/RetroLink.tsx`.
- Переходы синхронизированы с overlay (`components/RouteFxOverlay.tsx`).
- Глобальные FX-настройки и звуки: `context/FxContext.tsx`.
- Настройки сохраняются в `localStorage` по ключу `scu-retro-prefs-v1`.
- `safe mode` сохраняется и снижает интенсивность визуальных/аудио-эффектов.

## 10) Типизация

Ключевые типы:

- `types/psi.ts`
- `types/personnel.ts`
- `types/cases.ts`
- `types/partners.ts`
- `types/nav.ts`
- `types/fx.ts`
- `types/site.ts`

При расширении доменной модели типы должны обновляться синхронно с Prisma-схемой, валидаторами и UI.

## 11) Ограничения текущей архитектуры

- Нет полноценного RBAC (single-admin модель).
- Нет audit trail изменений контента.
- Нет unit/e2e тестов.
- Нет i18n-слоя.
- Нет внешней CMS; управление контентом идет через встроенную админку и fallback TS-модули.

## 12) Рекомендации по расширению

При добавлении нового раздела с runtime-контентом:

1. Добавить Prisma-модели и миграцию.
2. Добавить DTO/input-типы в `types/*`.
3. Добавить data-слой (`lib/*-data.ts`) и валидатор (`lib/*-validators.ts`).
4. Добавить API-роуты в `app/api/admin/*`.
5. Добавить публичную страницу `app/<route>/page.tsx` с fallback на `content/*`.
6. Добавить/обновить админский UI в `components/admin/*`.
7. Добавить пункт в `content/nav.ts` и обновить `types/site.ts` при необходимости.
8. Проверить переходы через `RetroLink`.
9. Выполнить `npm run lint` и `npm run build`.

## 13) Локальный запуск на Windows

Подробный runbook:

- `docs/windows-dev-runbook.md`
