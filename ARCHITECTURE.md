# Architecture

## 1) Общая модель

Приложение построено как статический контентный портал:

- слой данных: `content/*.ts`
- слой представления: `app/*/page.tsx` + `components/*`
- слой состояния FX: `context/FxContext.tsx`
- слой стилей: `app/globals.css` + `styles/retro.css`

Серверной бизнес-логики и API-роутов нет. Все страницы рендерятся из локальных TS-модулей.

## 2) Маршруты

- `/` - меню разделов
- `/personnel` - кадровый реестр
- `/cases` - архив материалов дел
- `/partners` - сотрудничающие организации
- `/psi` - лица особого интереса

Маршруты описаны физически через `app/<route>/page.tsx`.

## 3) Композиция приложения

Точка входа:

- `app/layout.tsx`
  - подключает глобальные стили
  - оборачивает приложение в `FxProvider`
  - рендерит `RetroShell`

Оболочка:

- `components/RetroShell.tsx`
  - `TopHeader`
  - `AccessBar`
  - `PrefsPanel`
  - `main` с контентом страницы
  - `StatusFooter`
  - CRT-слои и `RouteFxOverlay`

## 4) Поток данных

Источник данных:

- `content/nav.ts`
- `content/personnel.ts`
- `content/cases.ts`
- `content/partners.ts`
- `content/psi.ts`

Поток:

1. Страница импортирует контент из `content/*.ts`.
2. Страница мапит структуры данных в JSX.
3. Вспомогательные компоненты (`Redacted`, `RetroLink`) отвечают за визуальное/поведенческое оформление.

Поскольку данные локальные и неизменяемые во время выполнения, большая часть приложения является детерминированной и кэшируемой.

## 5) Навигация и переходы

- Пользователь кликает на `RetroLink`.
- `RetroLink` перехватывает переход, запускает:
  - `playClick()`
  - `playTransition()`
- После завершения transition вызывается `router.push(href)`.
- `RouteFxOverlay` реагирует на смену pathname и проигрывает boot-последовательность.

Это обеспечивает единый визуальный стиль переходов между страницами.

## 6) FX-подсистема

Контекст:

- `context/FxContext.tsx`

Содержит:

- `preferences`:
  - `soundEnabled`
  - `safeMode`
  - `fxLevel` (`max | safe`)
- `transitionActive`
- API:
  - `toggleSound`
  - `toggleSafeMode`
  - `playClick`
  - `playBoot`
  - `playTransition`

Хранилище:

- настройки сохраняются в `localStorage` (`constants/storage.ts`).

Аудио:

- Web Audio API (`AudioContext`, oscillator + noise burst).
- в `safeMode` снижается интенсивность эффектов.

## 7) Типизация

- `types/site.ts` - ключи маршрутов
- `types/nav.ts` - типы навигации
- `types/fx.ts` - типы FX-контекста

Важно поддерживать типы синхронно с `content` и компонентами, особенно при добавлении новых разделов.

## 8) Стиль и визуальный слой

- `app/globals.css` - базовый reset/глобальные правила
- `styles/retro.css` - тема, лэйаут, CRT-эффекты, адаптив

Ключевые эффекты:

- scanlines/noise/vignette
- route overlay с progress bar
- shake/jitter анимации

## 9) Ограничения текущей архитектуры

- Отсутствует CMS и внешний источник данных.
- Нет i18n-слоя (тексты зашиты в TS).
- Нет unit/e2e тестов.
- Нет API-контракта, так как приложение контентно-статическое.

## 10) Рекомендации по расширению

При добавлении раздела:

1. добавить route в `app/<new>/page.tsx`
2. добавить пункт в `content/nav.ts`
3. при необходимости обновить `types/site.ts`
4. проверить переходы через `RetroLink`
5. прогнать `npm run lint` и `npm run build`
