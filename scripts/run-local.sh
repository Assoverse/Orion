#!/usr/bin/env bash
set -euo pipefail
# Apply the default configuration against the local cluster.
pnpm --filter @orion/cli exec -- orion apply -f orion.yaml
