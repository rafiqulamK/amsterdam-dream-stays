Deploying `dist/` to cPanel (quick guide)

This guide explains how to deploy the `dist/` build produced by `npm run build` to a cPanel-hosted site. The repo includes a helper script at `scripts/deploy_to_cpanel.sh` for automated uploads.

Pre-requirements
- Make sure you ran `npm run build` and that the `dist/` folder exists.
- The frontend is static; ensure any backend services (Supabase, APIs) remain available.

Option A — Automatic (recommended if you have FTP credentials)

1. Install `lftp` and `zip` if needed (Debian/Ubuntu):

    sudo apt update && sudo apt install -y lftp zip

2. Run the provided script with environment variables:

    CPANEL_HOST=ftp.example.com CPANEL_USER=username CPANEL_PASS=password REMOTE_PATH=public_html ./scripts/deploy_to_cpanel.sh

- `REMOTE_PATH` defaults to `public_html`.
- The script zips `dist/` to `dist.zip` and uses `lftp` to mirror `dist/` contents to the remote folder. It preserves generated asset names and removes remote files not present locally (mirror + --delete).

Option B — rsync over SSH (if host provides SSH)

    SSH_HOST=example.com SSH_USER=youruser REMOTE_PATH=public_html ./scripts/deploy_to_cpanel.sh

This uses `rsync` if `SSH_HOST` is set and `rsync` is available.

Option C — Manual (cPanel File Manager)

1. Compress the `dist/` folder to `dist.zip`:

    zip -r dist.zip dist

2. Login to cPanel → File Manager → open `public_html` (or your domain folder).
3. Click `Upload` and select `dist.zip`.
4. After upload finishes, select `dist.zip` and choose `Extract` to unpack files. Ensure `index.html`, `assets/`, and `.htaccess` are in the site root.
5. In File Manager settings enable “Show Hidden Files (dotfiles)” to make sure `.htaccess` is present.

Post-deploy checks
- Visit `https://your-domain` and confirm the homepage loads.
- Test a client-side route (e.g., `https://your-domain/properties`) and refresh the page; it should still load (no 404).
- Inspect browser console/network for missing assets (404) or mixed-content warnings.

Notes & safety
- The included `.htaccess` enforces SPA routing and caching headers — do not remove it.
- `lftp mirror -R --delete` will remove remote files not present locally. If you want to keep remote uploads, remove `--delete` from the mirror command in the script.
- If you host under a subpath (example.com/sub/), rebuild with Vite `base` configured and upload contents to that subfolder.

If you'd like, I can rebuild with a different `base` and produce a fresh `dist/` and `dist.zip` or attempt the upload here if you provide credentials.
