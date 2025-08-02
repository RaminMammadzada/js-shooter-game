# GitHub Pages Deployment Automation

This repository now includes automated deployment to GitHub Pages through GitHub Actions.

## How it works

The deployment workflow (`.github/workflows/deploy-to-gh-pages.yml`) automatically:

1. **Triggers** on pushes to the `feature/build-artifacts` branch or manually via workflow dispatch
2. **Builds** the project using `npm run build`, generating static files in the `dist/` folder
3. **Deploys** the contents of `dist/` to the root of the `gh-page` branch
4. **Cleans** the `gh-page` branch to ensure only necessary build artifacts are present
5. **Commits and pushes** changes to make the site ready for GitHub Pages

## Build Output

The build process generates the following files in `dist/`:
- `index.html` - Main HTML file
- `index.js` - Bundled JavaScript (minified)
- `index.css` - Bundled CSS
- `*.js.map`, `*.css.map` - Source maps
- `_.._/images/` - Game images and UI assets
- `_.._/audio/` - Game audio files

## Manual Deployment

To manually trigger deployment:
1. Go to the Actions tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Choose the `feature/build-artifacts` branch

## Development Workflow

1. Make changes on feature branches
2. Merge to `feature/build-artifacts` when ready to deploy
3. Deployment happens automatically
4. Site is available at `https://[username].github.io/js-shooter-game/`

## Files Structure

- **Source branch** (`feature/build-artifacts`): Contains full source code, build tools, dependencies
- **Deployment branch** (`gh-page`): Contains only static build artifacts for GitHub Pages

The workflow ensures the `gh-page` branch stays clean with only the necessary files for the web deployment.