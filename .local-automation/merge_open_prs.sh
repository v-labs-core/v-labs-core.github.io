#!/bin/bash
set -euo pipefail

WORKSPACE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$WORKSPACE"

if [[ ! -d .git && ! -f .git ]]; then
  echo "Not a Git workspace: $WORKSPACE"
  exit 1
fi

gh auth status >/dev/null

prs_json="$(gh pr list --state open --json number --limit 100)"

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

    if [[ "$head_branch" == "ux-only" && "$base_branch" == "main" ]]; then
      git fetch origin main
      if [[ "$(git branch --show-current)" == "ux-only" ]]; then
        git reset --hard origin/main
        git push origin HEAD:ux-only --force-with-lease
      else
        echo "Merged ux-only PR #${pr_number}; reset local ux-only before the next polish run."
      fi
    fi
  else
    echo "Skipping PR #${pr_number} with merge state ${merge_state}"
  fi
done < <(
  gh pr list \
    --state open \
    --json number,headRefName,baseRefName,url,mergeStateStatus \
    --limit 100 \
    --jq '.[] | [.number, .headRefName, .baseRefName, .url, .mergeStateStatus] | @tsv'
)
