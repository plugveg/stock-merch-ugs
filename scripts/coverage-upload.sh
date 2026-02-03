#!/bin/bash
set -e

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

echo "Uploading coverage to Codacy..."
bash <(curl -Ls https://coverage.codacy.com/get.sh) report -r coverage/lcov.info
