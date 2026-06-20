#!/usr/bin/env bash
# Stop hook for onyx-ng: enforces the CLAUDE.md Definition of Done during an
# autonomous /goal run. No-op during normal interactive turns.
#
# Gating (in order):
#   1. stop_hook_active == true            -> exit 0 (never re-enter on our own block)
#   2. marker .claude/.goal-active absent  -> exit 0 (interactive turn, do nothing)
#   3. consecutive blocks >= CAP           -> exit 0 (safety: stop nagging, reset)
# Otherwise run the 4 DoD checks; if any fail, emit decision:block to keep going.

set -uo pipefail

DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
MARKER="$DIR/.claude/.goal-active"
COUNTER="$DIR/.claude/.goal-block-count"
CAP=25

STDIN="$(cat)"

# 1. Avoid infinite loop: if we already triggered a continuation, stand down.
if echo "$STDIN" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# 2. Only active when the marker file exists (opt-in per /goal run).
[ -f "$MARKER" ] || exit 0

# 3. Safety cap on consecutive blocks.
count=0
[ -f "$COUNTER" ] && count="$(cat "$COUNTER" 2>/dev/null || echo 0)"
if [ "$count" -ge "$CAP" ]; then
  rm -f "$COUNTER"
  echo "{\"systemMessage\":\"goal-verify: cap de $CAP bloqueos alcanzado, deteniendo verificacion.\"}"
  exit 0
fi

cd "$DIR" || exit 0

run() { eval "$1" >/tmp/goal-verify.$$ 2>&1; }   # returns command's exit code
fails=""
run "npx nx run ui-components:typecheck"        || fails="$fails typecheck"
run "npx nx test ui-components --watch=false"   || fails="$fails test"
run "npx nx lint ui-components"                 || fails="$fails lint"
run "npx nx run docs:build-storybook"           || fails="$fails storybook"
rm -f /tmp/goal-verify.$$

if [ -z "$fails" ]; then
  rm -f "$COUNTER"            # all green -> reset counter, allow stop
  exit 0
fi

echo $((count + 1)) > "$COUNTER"
reason="DoD incompleto: fallan ->$fails. Arregla y vuelve a correr los checks; no declares done hasta que typecheck/test(jest-axe 0)/lint/storybook pasen. Si un check parece defectuoso, PARA y explica."
# Escape for JSON via jq.
jq -nc --arg r "$reason" '{decision:"block", reason:$r}'
exit 0
