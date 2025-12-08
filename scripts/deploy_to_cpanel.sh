#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper for uploading the contents of `dist/` to a cPanel-hosted site.
# Supports: lftp (FTPS/FTP) mirror, rsync over SSH (if available), or manual upload fallback.
#
# Usage (example):
#  CPANEL_HOST=ftp.example.com CPANEL_USER=you CPANEL_PASS=secret REMOTE_PATH=public_html ./scripts/deploy_to_cpanel.sh
#
# Environment variables:
#  CPANEL_HOST  - FTP/FTPS/SFTP host (required)
#  CPANEL_USER  - Username (required)
#  CPANEL_PASS  - Password (required for FTP/FTPS)
#  REMOTE_PATH  - Remote path to upload into (default: public_html)
#  USE_SSL      - Set to 1 to force FTPS options for lftp (default: 1)
#  SSH_HOST     - Optional: SSH host for rsync fallback
#  SSH_USER     - Optional: SSH user for rsync fallback

CPANEL_HOST="${CPANEL_HOST:-}"
CPANEL_USER="${CPANEL_USER:-}"
CPANEL_PASS="${CPANEL_PASS:-}"
REMOTE_PATH="${REMOTE_PATH:-public_html}"
USE_SSL="${USE_SSL:-1}"

usage() {
  echo "Usage: CPANEL_HOST=... CPANEL_USER=... CPANEL_PASS=... REMOTE_PATH=public_html ./scripts/deploy_to_cpanel.sh"
  exit 1
}

if [ -z "$CPANEL_HOST" ] || [ -z "$CPANEL_USER" ] || [ -z "$CPANEL_PASS" ]; then
  echo "Missing required environment variables."
  usage
fi

if [ ! -d "dist" ]; then
  echo "Error: dist/ folder not found. Run the build first (npm run build)."
  exit 1
fi

echo "Creating dist.zip..."
if command -v zip >/dev/null 2>&1; then
  rm -f dist.zip
  zip -r dist.zip dist
else
  echo "zip not found, using Python fallback to create dist.zip"
  python3 - <<PY
import shutil
shutil.make_archive('dist','zip','dist')
PY
fi

echo "Preparing to upload dist/ contents to '$CPANEL_HOST' -> '$REMOTE_PATH'"

if command -v lftp >/dev/null 2>&1; then
  echo "Using lftp mirror (recommended)"
  # Configure some safe defaults and attempt FTPS if requested
  if [ "$USE_SSL" = "1" ]; then
    lftp -u "$CPANEL_USER","$CPANEL_PASS" "$CPANEL_HOST" -e "set ssl:verify-certificate no; set ftp:ssl-force true; set ftp:ssl-protect-data true; mirror -R --verbose --delete dist/ $REMOTE_PATH; bye"
  else
    lftp -u "$CPANEL_USER","$CPANEL_PASS" "$CPANEL_HOST" -e "set ssl:verify-certificate no; mirror -R --verbose --delete dist/ $REMOTE_PATH; bye"
  fi
  echo "Upload finished via lftp."

elif command -v rsync >/dev/null 2>&1 && [ -n "${SSH_HOST:-}" ]; then
  echo "Using rsync over SSH (SSH_HOST/SSH_USER must be set)"
  SSH_USER="${SSH_USER:-$CPANEL_USER}"
  SSH_HOST="${SSH_HOST}"
  rsync -avz --delete dist/ "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
  echo "Upload finished via rsync."

else
  echo "No automatic upload tool found (lftp or rsync+SSH)."
  echo "Please upload 'dist.zip' using the cPanel File Manager and extract it into '$REMOTE_PATH'."
  echo "Command to list the zip locally: ls -lh dist.zip"
  exit 1
fi

echo "Deployment complete. Verify on your site and remove dist.zip if not needed."
