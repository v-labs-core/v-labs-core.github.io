#!/bin/bash
set -euo pipefail

WORKSPACE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$WORKSPACE"

if [[ ! -d .git && ! -f .git ]]; then
  echo "Not a Git workspace: $WORKSPACE"
  exit 1
fi

gh auth status >/dev/null

prs_json="$(gh pr list --state open --json number,headRefName,baseRefName,url,mergeStateStatus --limit 100)"

if [[ "$prs_json" == "[]" ]]; then
  echo "No open PRs to process."
  exit 0
fi

while IFS=$'\t' read -r pr_number head_branch base_branch pr_url merge_state; do
  [[ -z "$pr_number" ]] && continue

  if [[ "$merge_state" == "CLEAN" || "$merge_state" == "UNSTABLE" || "$merge_state" == "HAS_HOOKS" ]]; then
    gh pr merge "$pr_number" --merge --delete-branch=false

    issue_numbers="$(gh issue list --state open --json number,body --limit 100 --jq '.[] | select((.body // "") | contains("PR #'"$pr_number"'")) | .number' 2>/dev/null || true)"
    while IFS= read -r issue_number; do
      [[ -z "$issue_number" ]] && continue
      gh issue close "$issue_number" --comment "Completed in merged PR #${pr_number}: ${pr_url}" >/dev/null 2>&1 || true
    done <<< "$issue_numbers"
  else
    echo "Skipping PR #${pr_number} with merge state ${merge_state}"
  fi
done < <(
  echo "$prs_json" | python3 - <<'PY'
import json,sys
for pr in json.load(sys.stdin):
    print("\t".join([
        str(pr.get("number","")),
        pr.get("headRefName",""),
        pr.get("baseRefName",""),
        pr.get("url",""),
        pr.get("mergeStateStatus",""),
    ]))
PY
)
