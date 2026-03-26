#!/bin/zsh
set -euo pipefail

ROOT_DIR="/Users/hoya/workspace/JangMaNal"
SRC_DIR="$ROOT_DIR/infra/launchd"
DST_DIR="$HOME/Library/LaunchAgents"
MODE="${1:-all}" # all | split
mkdir -p "$DST_DIR"

if [[ "$MODE" != "all" && "$MODE" != "split" ]]; then
  echo "Usage: $0 [all|split]" >&2
  exit 1
fi

for plist in "$SRC_DIR"/com.hoya.jangmanal.crawler.*.plist; do
  base="$(basename "$plist")"
  label="${base%.plist}"
  cp "$plist" "$DST_DIR/$base"

  launchctl unload "$DST_DIR/$base" >/dev/null 2>&1 || true

  if [[ "$MODE" == "all" ]]; then
    if [[ "$label" == "com.hoya.jangmanal.crawler.all" ]]; then
      launchctl load "$DST_DIR/$base"
      echo "loaded: $base"
    else
      echo "skipped: $base (all mode)"
    fi
  else
    if [[ "$label" == "com.hoya.jangmanal.crawler.all" ]]; then
      echo "skipped: $base (split mode)"
    else
      launchctl load "$DST_DIR/$base"
      echo "loaded: $base"
    fi
  fi
done

echo "done (mode=$MODE)"
