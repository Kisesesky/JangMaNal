#!/bin/zsh
set -euo pipefail

MART="${1:-all}"
WORKDIR="/Users/hoya/workspace/JangMaNal/apps/crawler"
VENV_PATH="$WORKDIR/.venv/bin/activate"
LOG_DIR="$WORKDIR/logs"

case "$MART" in
  emart|lottemart|homeplus|marketkurly|wisely|all) ;;
  *)
    echo "[ERROR] Unsupported mart: $MART" >&2
    echo "Usage: $0 [emart|lottemart|homeplus|marketkurly|wisely|all]" >&2
    exit 1
    ;;
esac

mkdir -p "$LOG_DIR"

cd "$WORKDIR"
source "$VENV_PATH"

LOG_FILE="$LOG_DIR/${MART}-crawler.log"
STARTED_AT="$(date '+%Y-%m-%d %H:%M:%S %Z')"

echo "[$STARTED_AT] crawl start mart=$MART" >> "$LOG_FILE"
python -m mart_crawler crawl --mart "$MART" >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] crawl end mart=$MART" >> "$LOG_FILE"
