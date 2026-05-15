# UX-only workflow

This folder mirrors the rolling UX workflow used in the notifications repo.

Expected repo setup:
- working branch: `ux-only`
- base branch: `main`
- rolling pull request: `ux-only` -> `main`
- labels: `enhancement`, `design`, `github-pages`, `codex-automation`

Main scripts:
- `run_ux_polish.sh`: runs a bounded visual UX pass, then syncs the rolling PR and tracking issue
- `merge_open_prs.sh`: merges mergeable open PRs and closes linked issues
- `launchd-v-labs-core-ux-polish.template.plist`: documents the local fallback scheduler

UX pass scope:
- Future automated `ux-only` changes are visual-only: layout, spacing, color, typography,
  responsiveness, accessibility states, imagery, icons, and branding assets.
- Automated runs must not add, remove, rewrite, or expand public-facing wording, content
  sections, navigation labels, metadata copy, form labels, privacy text, or service descriptions
  unless a user explicitly requests a content change.
- PRs for visual work must include the latest applicable before and after screenshots. If
  screenshot capture is not available, the PR must say that explicitly and include the reason.

These scripts assume the folder is a real Git checkout of `v-labs-core/v-labs-core.github.io`.
The hosted website lives in `docs/` and is deployed by the GitHub Pages workflow; root-level
automation files and repository notes are not part of the public web artifact.
The `deploy` branch is an automation-managed mirror of `docs/` contents only.

Local fallback scheduler:
- live plist: `/Users/mrv/Library/LaunchAgents/com.mrv.v-labs-core-ux-polish.plist`
- label: `com.mrv.v-labs-core-ux-polish`
- interval: `21600` seconds
- run at load: enabled

The fallback scheduler and the scheduled automation both run `run_ux_polish.sh`; the script
remains the single source of truth for branch, PR, issue, and label handling.
