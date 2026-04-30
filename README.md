# DroidLab // Insights

Interactive Android engineering essays built with React and Vite.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output is written to `dist/`.

## Project Structure

```text
src/
  components/          Shared UI and page sections
  widgets/             Interactive Android learning sandboxes
  posts/
    index.jsx          Central post registry and category list
    category/          Posts grouped by topic
      architecture/
      coroutines/
      performance/
```

To add a post, create a new file under `src/posts/category/<topic>/`, export its post object, then register it in `src/posts/index.jsx`.

## Deploy To GitHub Pages

Set the repository URL in `package.json` if needed, then run:

```bash
npm run deploy
```

The Vite config uses `base: './'`, so the static build works from a GitHub Pages project path such as `https://username.github.io/repo-name/`.
