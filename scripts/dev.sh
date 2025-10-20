#!/usr/bin/env bash
set -euo pipefail
# Run the Orion control plane, agent, and dashboard in parallel for local development.
pnpm --filter @orion/core dev &
CORE_PID=$!
pnpm --filter @orion/agent dev &
AGENT_PID=$!
pnpm --filter @orion/dashboard dev &
DASH_PID=$!

trap 'kill $CORE_PID $AGENT_PID $DASH_PID' INT TERM
wait
