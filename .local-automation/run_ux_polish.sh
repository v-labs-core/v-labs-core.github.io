#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPT_FILE="$SCRIPT_DIR/ux_polish_prompt.txt"
SUMMARY_FILE="$SCRIPT_DIR/last_run_summary.txt"
CODEX_BIN="${CODEX_BIN:-/Users/mrv/.nvm/versions/node/v24.12.0/bin/codex}"
CODEX_MODEL="${CODEX_MODEL:-gpt-5.2}"
PR_TITLE="Rolling UX updates"
PR_LABELS=(enhancement design github-pages codex-automation)

require_gh() {
  command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1
}

extract_pr_number() {
  local value="$1"
  if [[ "$value" =~ /pull/([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  if [[ "$value" =~ \#([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  return 1
}

ensure_pull_request() {
  local existing_pr
  existing_pr="$(gh pr list --head ux-only --base main --state open --json number,url --jq '.[0] | "#\(.number) \(.url)"' 2>/dev/null || true)"

  if [[ -n "$existing_pr" && "$existing_pr" != "null" ]]; then
    PR_NUMBER="$(extract_pr_number "$existing_pr" || true)"
    PR_URL="${existing_pr##* }"
  else
    PR_URL="$(gh pr create --base main --head ux-only --title "$PR_TITLE" --body "This PR tracks rolling UX-only improvements from the \`ux-only\` branch.")"
    PR_NUMBER="$(extract_pr_number "$PR_URL" || true)"
  fi

  for label in "${PR_LABELS[@]}"; do
    gh pr edit "$PR_NUMBER" --add-label "$label" >/dev/null 2>&1 || true
  done
}

ensure_tracking_issue() {
  local commit_subject="$1"

  local existing_issue
  existing_issue="$(gh issue list --state open --json number,title,url,body --limit 100 --jq '.[] | select((.body // "") | contains("PR #'"$PR_NUMBER"'")) | "#\(.number) \(.url)"' 2>/dev/null || true)"
  if [[ -n "$existing_issue" && "$existing_issue" != "null" ]]; then
    return 0
  fi

  local issue_body
  issue_body="$(cat <<BODY
This issue tracks the UX update in PR #${PR_NUMBER}.

Focus:
- ${commit_subject}

This issue stays open until PR #${PR_NUMBER} is merged.
BODY
)"

  gh issue create \
    --title "$commit_subject" \
    --body "$issue_body" \
    --label "${PR_LABELS[0]}" \
    --label "${PR_LABELS[1]}" \
    --label "${PR_LABELS[2]}" \
    --label "${PR_LABELS[3]}" >/dev/null
}

main() {
  cd "$WORKSPACE"

  if [[ ! -d .git && ! -f .git ]]; then
    echo "Not a Git workspace: $WORKSPACE"
    exit 1
  fi

  if [[ "$(git branch --show-current)" != "ux-only" ]]; then
    echo "Expected branch ux-only"
    exit 1
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Working tree is not clean"
    exit 1
  fi

  require_gh
  git fetch --all --prune
  git reset --hard origin/ux-only
  git rebase origin/main

  "$CODEX_BIN" exec \
    --full-auto \
    --model "$CODEX_MODEL" \
    --cd "$WORKSPACE" \
    --sandbox workspace-write \
    --output-last-message "$SUMMARY_FILE" \
    - < "$PROMPT_FILE"

  git fetch origin ux-only

  local remote_sha commit_subject
  remote_sha="$(git rev-parse origin/ux-only)"
  commit_subject="$(git log -1 --pretty=%s "$remote_sha")"

  ensure_pull_request
  ensure_tracking_issue "$commit_subject"

  echo "UX workflow synced for ${remote_sha}"
}

main "$@"
