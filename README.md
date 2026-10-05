# Academic Workflow

Reusable academic workflows for AI agents, refined through manuscript writing and
figure production. The aim is to make research outputs accurate, readable, and
well presented without turning routine edits into paperwork.

This repository starts with two skills and is open to additional academic workflows.
Suggestions, issues, and pull requests are welcome.

[简体中文](README.zh-CN.md) · [Contributing](CONTRIBUTING.md) · [Releases](https://github.com/zzzhy03/academic-workflow/releases)

## Available skills

| Skill | Purpose |
| --- | --- |
| [academic-paper-writing](skills/academic-paper-writing/SKILL.md) | Scholarly wording, table updates, consistency, collaborative LaTeX editing, and final PDF review. |
| [academic-diagram-design](skills/academic-diagram-design/SKILL.md) | Editable conceptual figures, compact layout, asset preparation, and publication exports. |

Each skill is a normal `SKILL.md` folder with supporting references.
OpenPencil's own skill and software remain upstream dependencies; they are not
copied into this repository.

## Install skills

Requires Node.js **22.20.0 or newer** and npm for the commands below.
The Skills CLI can target Codex and other supported agents; choose the agent and
scope interactively:

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow
```

Install only writing, globally for Codex:

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow --skill academic-paper-writing --agent codex --global
```

Install both explicitly:

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow --skill academic-paper-writing --skill academic-diagram-design --agent codex --global
```

Update those installed skills:

```bash
npx skills@1.7.0 update academic-paper-writing academic-diagram-design --global
```

Installation reads the repository. You do not need to wait for a release ZIP.
These commands install or update copies; they do not push local edits back to GitHub.

## Optional OpenPencil setup for Codex

For **macOS/Linux**, the optional installer can add our skills, the upstream
OpenPencil skill, the OpenPencil CLI/MCP packages, and a Codex MCP entry in one command:

```bash
npx --yes --package=git+https://github.com/zzzhy03/academic-workflow.git academic-workflow install --all --with-openpencil --mcp-root "$PWD"
```

Choose a directory containing the designs/assets that OpenPencil should access.
The command requires Git, Node/npm, and the Codex CLI. Add `--dry-run` to see its
plan without running any installation or configuration commands. Use repeated
`--skill NAME` options instead of `--all` to select skills. The bootstrap currently
targets Codex; use the standard Skills CLI for other agents.

The optional setup:

1. Installs the chosen repository skills using the Skills CLI.
2. Installs the official `open-pencil` skill at the revision in
   [dependencies.json](dependencies.json).
3. Installs the pinned `@open-pencil/cli` and `@open-pencil/mcp` packages globally.
4. Registers a user-level `open-pencil` MCP entry with an explicit
   `OPENPENCIL_MCP_ROOT`.

Existing matching tools/configuration are reused. A different MCP root or transport
is preserved and reported rather than overwritten. Different installed tool
versions require an explicit `--update-tools` option. Check compatibility with the
desktop application before replacing versions. `--project` changes the skill scope
only; optional tool packages and MCP registration remain user-wide.

**The desktop application is separate.** On macOS, OpenPencil documents
`brew install --cask openpencil`; Windows/Linux downloads and requirements are on
the [official project](https://github.com/open-pencil/open-pencil). The installer
does not install or open the desktop app. For app mode, open the editor with a
document and reconnect/restart the Codex MCP client. A successful registration is
not a verified live editor connection.

For Windows, install the skills normally, install the official CLI/MCP packages,
then configure the MCP server using Codex's current instructions. Automatic
OpenPencil setup on Windows is not yet supported by this bootstrap.

Installation failures stop the remaining steps and return a nonzero exit code.
Completed steps are not automatically rolled back.

## Maintain and release

Maintainer checks require Python 3.9 or newer in addition to Node/npm.
Edit the authoritative files under `skills/`, then run:

```bash
npm ci --ignore-scripts
npm test
npm run validate
npm run build
```

- Every pull request and push to `main` validates the collection, tests the
  installer, and builds downloadable CI artifacts.
- A version tag matching `package.json`, such as `v0.1.0`, publishes a GitHub
  Release with individual skill ZIPs, a collection ZIP, a manifest, and SHA-256
  checksums after validation succeeds.
- Generated packages live in `dist/` and are not committed.
- Local edits do not automatically push to GitHub. CI starts after a push.
- No npm registry publication is required. The bootstrap runs directly from this
  Git repository; `private: true` prevents accidental npm publication.

To release, update `package.json` and its lockfile version, commit the changes,
then create and push the matching version tag.

The upstream skill revision and tool versions are explicit in `dependencies.json`.
Dependency upgrades should be reviewed and tested before changing these pins.
A new skill should be added under `skills/` and listed in `dependencies.json`.

## Contribution principles

Report unclear guidance, repeated friction, or a concrete failure. Prefer rules
that improve a real decision across papers. Keep project names, machine paths,
private research data, and one-off fixes out of shared skills.

Small documentation improvements do not need a new test suite. Changes to
installation, dependency handling, or packaging should include relevant tests.
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License and upstream projects

This repository is MIT licensed; see [LICENSE](LICENSE).
OpenPencil and the Skills CLI are separate projects, installed from their official
sources and governed by their respective licenses. This project is not an official
OpenPencil or OpenAI product.

- [Skills CLI](https://github.com/vercel-labs/skills)
- [OpenPencil and its current skill](https://github.com/open-pencil/open-pencil)
- [Codex skills documentation](https://learn.chatgpt.com/docs/build-skills)
