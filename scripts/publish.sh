#!/usr/bin/env bash
set -euo pipefail
OWNER="${OWNER:-andydrewie}"
NAME="${NAME:-metron}"
DESCRIPTION="Open fitness homework: TDEE, sleep and training readiness. Headless JS + JSON CLI, inspectable assumptions, beautiful static app."
if ! command -v gh >/dev/null 2>&1; then
  echo "Install and authenticate the GitHub CLI first: https://cli.github.com/" >&2
  exit 1
fi
gh auth status >/dev/null || { echo 'Run gh auth login first.' >&2; exit 1; }
if gh repo view "$OWNER/$NAME" >/dev/null 2>&1; then
  echo "Repository $OWNER/$NAME already exists. Refusing to overwrite or push automatically." >&2
  exit 1
fi
if [ ! -d .git ]; then git init -b main; fi
if ! git diff --cached --quiet || ! git diff --quiet; then
  echo 'Working tree has existing changes; review before publishing.' >&2
fi
git add .
if ! git diff --cached --quiet; then git commit -m "chore: publish Metron exploratory instrument"; fi
gh repo create "$OWNER/$NAME" --public --source . --remote origin --push --description "$DESCRIPTION"
echo "Repository created. Next: Settings → Pages → Build and deployment → Source = GitHub Actions."
echo "Then verify https://$OWNER.github.io/$NAME/"
