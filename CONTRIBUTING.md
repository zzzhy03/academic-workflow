# Contributing

Issues and pull requests are welcome. This repository collects practical academic
workflows, starting with manuscript writing and figure design.

## Propose a useful change

Explain the recurring task, what currently goes wrong or takes unnecessary effort,
and the behavior your change should improve. A concise example can support the
discussion, but keep private manuscripts, data, credentials, and machine-specific
paths out of public reports.

Prefer a short decision rule with a clear scope. Avoid making every past mistake
a universal requirement or adding forms that shift routine checking to the user.
Keep common guidance in one place and use references only where they help.

## Submit a pull request

1. Fork the repository and create a branch for your change.
2. Edit the authoritative source files under `skills/` or the relevant tooling.
3. For a new skill, create `skills/<name>/SKILL.md` with name and description
   frontmatter, and add the name to `dependencies.json`.
4. Run `npm test`, `npm run validate`, and `npm run build`.
5. Describe the change and the checks you actually performed.

Ordinary wording changes need a careful review, not tests that merely match the
new wording. Installation and packaging changes should exercise observable behavior
such as selection, failure handling, existing configuration preservation, and
archive contents.

Keep the Bash installer compatible with macOS Bash 3.2 and Linux Bash. Its normal
file-installation path must not require Node, npm, Python, Git, or jq. Tests use
local release fixtures and explicit temporary destinations, without changing the
user's HOME or installed skills. Preserve the manual ZIP and Skills CLI paths
when changing distribution behavior.

## Dependency updates

OpenPencil's skill and tools are fetched from upstream rather than vendored.
Update their pins in `dependencies.json` deliberately. Check package runtime
requirements, the MCP setup command, desktop compatibility, and the upstream skill's
references. Never describe a registered MCP server as a successfully connected
editor without a live connection check.

## Releases

Maintainers update `package.json` and `package-lock.json`, commit, and push a matching
`vX.Y.Z` tag. CI tests and packages the tagged source before publishing the release.
A main-branch push builds CI artifacts without creating a stable release.

Contributions to this repository are provided under its [MIT License](LICENSE).
