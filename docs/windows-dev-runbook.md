# Локальный запуск `dev` на Windows (с нуля)

Этот runbook описывает полный порядок запуска проекта на новой Windows-машине после `git clone`.

## 1) Предусловия

- Установлен Git.
- Установлен Node.js 20+.
- Установлен npm 10+.
- Доступен PostgreSQL (service или portable).

Проверка:

```powershell
git --version
node -v
npm -v
```

## 2) Клонирование и вход в проект

```powershell
git clone <repo-url> slpch
Set-Location -LiteralPath .\slpch
```

## 3) Подготовка `.env`

```powershell
Copy-Item .env.example .env -Force
```

Минимальные значения в `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slpch?schema=public"
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="12345"
SESSION_SECRET="replace-with-long-random-secret"
```

## 4) Установка зависимостей проекта

```powershell
npm.cmd ci
```

Если `ci` не подходит, используйте:

```powershell
npm.cmd install
```

Примечание: в PowerShell используйте `npm.cmd`, а не `npm`, чтобы избежать проблем с execution policy.

## 5) Поднять PostgreSQL

Вариант A: PostgreSQL как Windows service

```powershell
Get-Service *postgres*
Start-Service <postgres_service_name>
```

Вариант B: portable PostgreSQL (через `wget`)

Одноразовая установка:

```powershell
$PG_BASE="$env:USERPROFILE\postgresql16-local"
New-Item -ItemType Directory -Force -Path $PG_BASE | Out-Null
Set-Location $PG_BASE
wget "https://get.enterprisedb.com/postgresql/postgresql-16.12-1-windows-x64-binaries.zip" -OutFile "postgresql-16.12-1-windows-x64-binaries.zip"
Expand-Archive ".\postgresql-16.12-1-windows-x64-binaries.zip" -DestinationPath ".\pgsql-16.12" -Force
$PGROOT="$PG_BASE\pgsql-16.12\pgsql"
$PGDATA="$PG_BASE\data"
New-Item -ItemType Directory -Force -Path $PGDATA | Out-Null
& "$PGROOT\bin\initdb.exe" -D $PGDATA -U postgres -A scram-sha-256 -W
& "$PGROOT\bin\pg_ctl.exe" -D $PGDATA -l "$PGDATA\postgres-runtime.log" start
& "$PGROOT\bin\createdb.exe" -h localhost -p 5432 -U postgres slpch
```

Ежедневный запуск portable PostgreSQL:

```powershell
$PGROOT="$env:USERPROFILE\postgresql16-local\pgsql-16.12\pgsql"
$PGDATA="$env:USERPROFILE\postgresql16-local\data"
& "$PGROOT\bin\pg_ctl.exe" -D "$PGDATA" -l "$PGDATA\postgres-runtime.log" start
```

## 6) Проверить доступность PostgreSQL

```powershell
Test-NetConnection -ComputerName localhost -Port 5432
```

Ожидается `TcpTestSucceeded : True`.

## 7) Prisma перед запуском приложения

```powershell
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
```

Для первичного наполнения контентом:

```powershell
npm.cmd run prisma:seed
```

## 8) Проверка проекта и запуск `dev`

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Приложение будет доступно на `http://localhost:3000`.

## 9) Частые проблемы

1. `DATABASE_URL` ошибка:
Проверьте, что PostgreSQL действительно запущен и порт `5432` открыт.

2. PowerShell блокирует `npm`:
Используйте `npm.cmd`, а не `npm`.

3. Порт `3000` занят:

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess
```

## 10) Остановка

Остановить `dev`:

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess
```

Остановить portable PostgreSQL:

```powershell
$PGROOT="$env:USERPROFILE\postgresql16-local\pgsql-16.12\pgsql"
$PGDATA="$env:USERPROFILE\postgresql16-local\data"
& "$PGROOT\bin\pg_ctl.exe" -D "$PGDATA" stop
```
