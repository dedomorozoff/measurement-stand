# МЕТРОСТЕНД

Интерактивный учебный стенд: погрешности измерений и их классификация, средства измерений и их свойства.

Стек: React 19 + Vite 7 + Tailwind CSS 4 + TypeScript. Сборка склеивается в один `index.html` (`vite-plugin-singlefile`).

## Локальная разработка

```bash
npm ci
npm run dev
```

## Публикация на GitHub Pages

Деплой автоматический: пуш в `main` → workflow `.github/workflows/deploy.yml` собирает проект и выкладывает его в GitHub Pages.

```bash
npm run build   # tsc --noEmit + vite build -> dist/
npm run preview # локальный просмотр собранного dist/
```

Адрес сайта: https://domemorozoff.github.io/measurement-stand/

Если это первый запуск, в репозитории включи **Settings → Pages → Source: GitHub Actions** — один раз, дальше деплоит workflow.