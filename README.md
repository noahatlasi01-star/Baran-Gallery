# Gallery Baran
A luxury personal art studio and digital art journal built with HTML, CSS, and vanilla JavaScript.

## Run locally
Open `index.html` in a modern browser. For best results, use a local static server (for example VS Code Live Server) because IndexedDB works more consistently over `localhost`.

## Default login
- Username: `Baran`
- Password: `baran`

Change the password from **Settings → Change Password**.

## Important storage notes
- Artwork images and records are stored in the browser using IndexedDB.
- Preferences and the local demo login password are stored in `localStorage`.
- Browser data is device/browser-specific. Use **Settings → Export Backup** regularly to keep a copy.
- The login is a convenience gate, not strong security. GitHub Pages is static hosting and its source files are downloadable. A localStorage password can be inspected or bypassed by someone with technical access to the browser or repository. Do not store highly sensitive information here.
- The app is designed as a personal tool for Baran, not as a secure multi-user service.

## GitHub Pages deployment
1. Create a GitHub repository for the website.
2. Upload the contents of this folder to the repository root.
3. In repository Settings → Pages, select the deployment branch and `/ (root)`.
4. Wait for GitHub Pages to publish the site.
5. Open the Pages URL and sign in.

Note: A private repository does not automatically make a GitHub Pages website private. Check GitHub's current Pages plan and repository visibility rules before publishing personal content.

## Optional remote image backup
The project includes `worker/index.js`, an optional Cloudflare Worker that stores uploaded images in a separate private GitHub repository. The current frontend keeps using IndexedDB unless you configure a Worker URL. The Worker source is provided as a starting point; it is not automatically deployed or connected.

Worker configuration:
- Secret `GITHUB_TOKEN`: fine-grained token with Contents read/write permission for the dedicated image repository only.
- Secret `BARAN_API_KEY`: optional extra key for Worker requests.
- Variables `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `ALLOWED_ORIGIN`.
- Set `ALLOWED_ORIGIN` to the exact deployed Pages origin.
- Deploy the Worker, then enter its URL in Settings.

Do not put GitHub tokens in frontend code or commit them to the repository. The included Worker endpoints are upload, image retrieval, and deletion. Review and test the Worker before using it with important files.

## Included demo artwork
Three illustrative SVG study cards are included to demonstrate the layout. They can be deleted from the gallery or replaced with Baran's own drawings.

## Backup and restore
From Settings:
- Export Backup downloads a JSON file containing records and image data.
- Restore Backup imports a previously exported JSON file.
Keep backup files somewhere safe.

## Project structure
- `index.html`: app shell and login.
- `assets/css/style.css`: complete visual system and responsive styling.
- `assets/js/app.js`: pages, UI, forms, navigation, and interactions.
- `assets/js/db.js`: IndexedDB storage layer.
- `assets/images/`: original SVG artwork and background assets.
- `worker/index.js`: optional GitHub image storage Worker.
