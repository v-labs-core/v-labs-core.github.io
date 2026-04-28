# UX-only workflow

This folder mirrors the rolling UX workflow used in the notifications repo.

Expected repo setup:
- working branch: `ux-only`
- base branch: `main`
- rolling pull request: `ux-only` -> `main`
- labels: `enhancement`, `design`, `github-pages`, `codex-automation`

Main scripts:
- `run_ux_polish.sh`: runs a bounded Codex UX pass, then syncs the rolling PR and tracking issue
- `merge_open_prs.sh`: merges mergeable open PRs and closes linked issues

These scripts assume the folder is a real Git checkout of `v-labs-core/v-labs-core.github.io`.
The hosted website lives in `docs/` and is deployed by the GitHub Pages workflow; root-level
automation files and repository notes are not part of the public web artifact.
