# Academic Workflow

Reusable academic workflows for AI agents, refined through manuscript writing and
figure production. The aim is to make research outputs accurate, readable, and
well presented without turning routine edits into paperwork.

The collection starts with two skills and is open to additional academic workflows.
Suggestions, issues, and pull requests are welcome.

[简体中文](README.zh-CN.md) · [Contributing](CONTRIBUTING.md) · [Releases](https://github.com/zzzhy03/academic-workflow/releases)

## Available skills

| Skill | Purpose |
| --- | --- |
| [academic-paper-writing](skills/academic-paper-writing/SKILL.md) | Scholarly wording, table updates, consistency, collaborative LaTeX editing, and final PDF review. |
| [academic-diagram-design](skills/academic-diagram-design/SKILL.md) | Editable conceptual figures, compact layout, asset preparation, and publication exports. |

Skills are ordinary folders containing `SKILL.md` and references. They do not need
Node.js to load. The optional `agents/openai.yaml` supplies OpenAI interface metadata;
the core skill format also works in Claude Code.

## Choose an installation method

| Method | Prerequisites | Use it for |
| --- | --- | --- |
| Release ZIP | Browser and extraction tool | Manual installation, or uploading an individual skill to a supported client |
| Bash installer | macOS/Linux; Bash, curl, unzip, awk, and sha256sum or shasum | Lightweight installation from a published release |
| Skills CLI | Node.js 22.20.0 or newer, npm, and Git | Existing cross-agent installation/update workflows |

### Download a Release ZIP

Open [Releases](https://github.com/zzzhy03/academic-workflow/releases/latest) and download
one skill ZIP or `academic-workflow-skills.zip`. Copy the selected skill folders,
including their references, to the client's skill directory. Use the folders that
directly contain `SKILL.md`, not the outer collection folder.

Typical personal destinations are `~/.agents/skills/` for Codex and
`~/.claude/skills/` for Claude Code. Follow the configuration of an existing
installation. If updating manually, replace the corresponding folder after
accounting for local edits.

### Install with Bash

Install the collection for Codex:

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- --agent codex
```

Install only writing for Claude Code:

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- --agent claude-code --skill academic-paper-writing
```

Repeat `--skill` to select multiple skills; omit it or use `--all` for the collection.
Additional options:

| Option | Meaning |
| --- | --- |
| `--project` | Install under the current project's client directory instead of globally |
| `--dest PATH` | Use an explicit existing/custom installation location |
| `--version v0.2.0` | Use a specific release; default is latest |
| `--list` | List skills in the selected release without installing |
| `--dry-run` | Fetch and verify the catalog, then show the plan without installing |
| `--replace` | Update selected existing skills, retaining their previous folders in a backup |

Run the installer again with `--replace` to update:

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- --agent codex --replace
```

The script resolves one release version, verifies its catalog and selected ZIPs
against `SHA256SUMS`, and downloads/checks all selected archives before installing.
Existing selected directories require `--replace`; unrelated skills are untouched.
Backups are stored beside the skill directory, outside its loading path. Symlinked
skill folders are preserved: update their source or choose another destination.
If a later installation fails, earlier successful installations remain in place.

Use `--dest` to update a legacy/custom location rather than leaving a second copy
of the same skill. A pinned installation can download `install.sh` from that
release's own download URL and pass its tag with `--version`.

The Bash installer supports releases **v0.2.0 and newer**, which include its catalog.
Earlier releases remain available as manual ZIP downloads. Windows users can use
manual ZIPs or Skills CLI; the Bash route targets macOS/Linux (including a suitable
Linux environment such as WSL).

### Install with Skills CLI

[Skills CLI](https://github.com/vercel-labs/skills) is a third-party installer from
Vercel Labs. It is not the skill format itself or a tool authored by this repository.

Choose skills, agent, and scope interactively:

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow
```

For a specific client, add `--agent codex --global` or
`--agent claude-code --global`. Select one or more skills using repeated
`--skill NAME` arguments. Update skills installed through that tool with:

```bash
npx skills@1.7.0 update academic-paper-writing academic-diagram-design --global
```

Skills CLI reads the Git repository; the Bash installer reads published Release
assets. A main-branch change is available through Skills CLI before the next release.
Neither route uploads local edits back to GitHub.

## Optional OpenPencil setup for Codex

The file-only Bash installer does not install software or modify MCP configuration.
The existing optional Node bootstrap remains available for **macOS/Linux**:

```bash
npx --yes --package=git+https://github.com/zzzhy03/academic-workflow.git academic-workflow install --all --with-openpencil --mcp-root "$PWD"
```

This requires Git, Node/npm, and the Codex CLI. It uses Skills CLI to install the
chosen repository skills and the upstream OpenPencil skill, installs the pinned
`@open-pencil/cli` and `@open-pencil/mcp` packages globally, then registers a user-level
Codex MCP entry with the requested filesystem root.

Use repeated `--skill NAME` instead of `--all` for selection, or `--dry-run` to
inspect the command plan without executing it. The bootstrap targets Codex; Claude
Code users can install the skills with either generic route and configure MCP using
their client's instructions.

The upstream skill revision and tool versions are recorded in
[dependencies.json](dependencies.json). Existing matching tools/configuration are
reused. A different MCP root/transport is preserved and reported; different tool
versions require explicit `--update-tools`. Check desktop compatibility first.
`--project` changes skill scope only; tools and MCP registration remain user-wide.

**The desktop application is separate.** See the
[official OpenPencil project](https://github.com/open-pencil/open-pencil).
The bootstrap does not install or open it. For app mode, open a document and
reconnect/restart the MCP client. Registration alone is not a verified live editor
connection. Automatic OpenPencil setup on Windows is not yet supported here.
Failures stop remaining steps with a nonzero exit code; completed steps are not
automatically rolled back.

## How checking, packaging, and release work

Two GitHub Actions workflows share [scripts/build.py](scripts/build.py):

| Trigger | Checks and packaging | Published output |
| --- | --- | --- |
| PR or push to `main` | Skill/reference validation, installer tests, packaging | CI artifacts for inspection |
| A version tag such as `v0.2.0` | Repeat checks, verify tag/package version agreement, package | A public GitHub Release |

Releases contain individual skill ZIPs, a collection ZIP, `install.sh`, `skills.txt`,
a version manifest, and SHA-256 checksums. Bash tests run on Linux and macOS; Windows
checks retain the Node installer and packaging tests. This runs on GitHub's machines:
users installing ZIPs or using Bash do not need the repository's build environment.

Generated files live in ignored `dist/`. Local saves do not automatically upload
or publish; pushing to main starts CI, while a matching version tag starts release.
No npm registry publication is required. `private: true` prevents accidental npm
publication of this repository's bootstrap.

## Maintain and contribute

Maintainer checks require Node/npm and Python 3.9 or newer:

```bash
npm ci --ignore-scripts
npm test
npm run validate
npm run build
```

Edit the authoritative files under `skills/`. For a new skill, add its folder and
register its name in `dependencies.json`; the release catalog is generated from
that list. To release, update the package and lockfile version, commit, then create
and push a matching `vX.Y.Z` tag. Review dependency pins before upgrading them.

Report unclear guidance or recurring friction. Keep private research, machine
paths, and one-off corrections out of shared skills. Wording changes need careful
review; installer and packaging changes need relevant behavior tests.
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License and upstream projects

This repository is [MIT licensed](LICENSE). OpenPencil and Skills CLI are separate
upstream projects with their own maintainers and licenses. This is not an official
OpenPencil or OpenAI product.

- [Agent Skills format](https://agentskills.io/specification)
- [Skills CLI](https://github.com/vercel-labs/skills)
- [OpenPencil and its current skill](https://github.com/open-pencil/open-pencil)
