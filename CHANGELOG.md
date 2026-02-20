# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Added
- PostgreSQL integration via Prisma for runtime cards (`PersonnelCard`, `CaseCard`, `CaseCardBullet`, `PartnerCard`, `PartnerCardBullet`, `PsiCard`, `PsiCardBullet`) with migrations and seed.
- Admin panel route `/admin` with CRUD for personnel/cases/partners/psi, TipTap rich-text editing, and inline classified marks.
- Custom admin auth with signed `httpOnly` session cookie (`scu_admin_session`).
- Login overlay triggered by click on `POLICE` emblem in header.
- Local photo upload API (`/api/admin/upload/photo`) and media streaming route (`/api/media/psi/[file]`).

### Changed
- Public `/psi` now reads cards from DB and masks classified text server-side for non-admin users.
- Public `/personnel`, `/cases`, `/partners` now read cards from DB with fallback to `content/*` if DB access fails.
- Added env template and updated README for DB/auth setup.

## [0.1.0] - 2026-02-17

### Added
- Initial Next.js 15 + React 19 + TypeScript project structure.
- Static App Router pages: `/`, `/personnel`, `/cases`, `/partners`, `/psi`.
- Retro shell UI with CRT visual layers, boot overlay, and transition effects.
- FX context with `safe mode`, sound toggles, and persisted preferences in `localStorage`.
- Content modules under `content/` for navigation, personnel, cases, partners, and PSI records.

### Documentation
- Added `README.md` with setup, commands, project layout, and editing guide.
- Added `ARCHITECTURE.md` with component/data-flow and extension rules.
- Added `AGENTS.md` with repo-specific instructions for coding agents.
