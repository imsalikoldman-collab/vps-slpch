# Реализованные эффекты отображения контента

Документ фиксирует текущие визуальные, аудио и поведенческие FX, влияющие на восприятие контента в ретро-портале SCU.

## 1) CRT-слои поверх контента

Слои накладываются на весь интерфейс через `RetroShell`:

- scanlines
- noise
- vignette

Код:

- `components/RetroShell.tsx`
- `styles/retro.css` (`.crt-layer`, `.scanlines`, `.noise`, `.vignette`)

Что дает:

- эффект старого ЭЛТ-монитора
- легкое мерцание и зернистость поверх текста/таблиц/карточек

## 2) Эффект сцены монитора

Фоновая мониторная подложка и пульсация яркости/контраста:

- `styles/retro.css` (`.monitor-stage::before`, `@keyframes monitorGlow`)

Что дает:

- ощущение просмотра контента через физический экран/терминал

## 3) Анимированное меню и состояние ссылок

Навигационные пункты главного меню имеют микродрожание:

- `styles/retro.css` (`.menu-item`, `@keyframes menuJitter`)

Hover/focus:

- инверсия цвета фона/текста

Что дает:

- “живой” терминальный интерфейс вместо статичных ссылок

## 4) FX-оверлей при переходах между страницами

При смене маршрута включается boot/transition overlay:

- системные строки (`BOOT SECTOR VERIFIED`, `LOADING SCU GRID` и т.д.)
- прогресс-бар
- flicker/scan/sweep эффекты

Код:

- `components/RouteFxOverlay.tsx`
- `components/RetroLink.tsx`
- `styles/retro.css` (`.route-overlay*`, `@keyframes overlayFlicker`, `@keyframes textPulse`, `@keyframes sweep`)

Что дает:

- единый визуальный ритуал “переключения узла сети” между разделами

## 5) Управляемая интенсивность FX: `SAFE MODE`

В `SAFE MODE` эффекты смягчаются:

- меньше интенсивность `noise`
- отключается shake окна
- замедляются/ослабляются отдельные анимации
- отключается flicker у части overlay-слоев

Код:

- `components/PrefsPanel.tsx`
- `components/RetroShell.tsx` (`fx-safe` / `fx-max`)
- `styles/retro.css` (`.fx-safe ...`, `.fx-max .retro-window`)

Что дает:

- снижение визуальной агрессивности без потери общей эстетики

## 6) Аудио-FX интерфейса

Web Audio эффекты:

- клик по ссылкам/переключателям
- boot-шум
- transition-шум

Код:

- `context/FxContext.tsx` (`playClick`, `playBoot`, `playTransition`, `playNoiseBurst`, `playTone`)

Что дает:

- синхронизацию звука с действиями пользователя и переходами

## 7) Маскирование засекреченных фрагментов (`Redacted`)

Для публичного режима classified-текст заменяется маской (`██████`):

- `lib/psi-richtext.tsx`
- `components/Redacted.tsx`
- `styles/retro.css` (`.redacted`, `.classified-visible`, `.classified-token`)

Что дает:

- нативный для дизайна паттерн “частично скрытых данных”
- сохранение стилистики внутренних документов SCU

## 8) Сохранение пользовательских FX-настроек

Сохраняются в `localStorage`:

- звук (`soundEnabled`)
- safe mode (`safeMode`)
- уровень FX (`fxLevel`)

Код:

- `context/FxContext.tsx`
- `constants/storage.ts` (`scu-retro-prefs-v1`)

Что дает:

- стабильное UX-поведение между перезапусками/сессиями

## 9) Ключевые анимации в проекте

- `monitorGlow`
- `noiseShift`
- `lineDrift`
- `overlayFlicker`
- `frameShake`
- `textPulse`
- `menuJitter`
- `sweep`

Определены в `styles/retro.css`.
