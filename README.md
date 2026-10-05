# Academic Workflow

Reusable academic workflows for AI agents, refined through manuscript writing and
figure production. Suggestions, issues, and pull requests are welcome.

[简体中文](README.zh-CN.md) · [Contributing](CONTRIBUTING.md) · [Releases](https://github.com/zzzhy03/academic-workflow/releases)

## Available skills

- [academic-paper-writing](skills/academic-paper-writing/SKILL.md): scholarly writing, result tables, consistency, collaborative builds, and final review.
- [academic-diagram-design](skills/academic-diagram-design/SKILL.md): editable conceptual figures, compact layout, assets, and publication exports. When using OpenPencil for drawing, `--with-openpencil` adds its official skill, CLI/MCP, and client configuration; install the desktop application separately using the [official instructions](https://github.com/open-pencil/open-pencil).

## Installation methods

| Method | Requirements | Use |
| --- | --- | --- |
| Release ZIP | Browser and extraction tool | Download a Release ZIP and install manually |
| Bash installer | macOS/Linux with Bash, curl, and unzip | Install a published release with one command |
| Skills CLI | Node.js 22.20.0+, npm, and Git | Use an existing Skills CLI workflow |

### Release ZIP

Download an individual skill ZIP or `academic-workflow-skills.zip` from the
[latest release](https://github.com/zzzhy03/academic-workflow/releases/latest).
Place the required skill folders, including their references, in the client's
skill directory. Replace the corresponding directory when updating manually.

### Bash installer

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash
```

By default, install all academic skills and detect the available clients.
To pass arguments, append `-s --` after `bash`, followed by the command or options.

| Command or option | Purpose | Choices or example |
| --- | --- | --- |
| `install / update` | Install or update; default install. Update retains previous directories as backups | `install`, `update` |
| `--skill NAME` | Select a skill; repeat for several | `academic-paper-writing`, `academic-diagram-design` |
| `--all` | Install all academic skills, the default | `--all` |
| `--agent TARGET` | Detect or select clients; all targets both | `auto` (default), `all`, `codex`, `claude-code` |
| `--global` | User-wide installation, the default | `--global` |
| `--project` | Install under the current project | `--project` |
| `--dest DIRECTORY` | Use an existing/custom installation directory | `--dest "$HOME/.agents/skills"` |
| `--version TAG` | Select a published version | `latest` (default), `v0.3.0` |
| `--with-openpencil` | Add the official drawing skill, CLI/MCP, and client registration | `--with-openpencil` |
| `--mcp-root DIRECTORY` | Directory OpenPencil may access; default current directory | `--mcp-root "$PWD"` |
| `--list` | List academic skills without installing | `--list` |
| `--dry-run` | Show the plan without installing | `--dry-run` |
| `--help` | Show help | `--help` |

Update an existing installation:

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- update
```

Downloads are checked before installation. Existing directories require `update`;
backups stay outside the skill-loading directory. Multiple detected clients receive
their own copies. If none is detected, the common skill directory is used.
Use `--dest` for a custom location; update the source of a symlinked installation.

Selecting `--with-openpencil` requires Node/npm and the selected client CLIs. Both clients receive
the same optional integration. MCP registration is user-wide; `--mcp-root` limits
file access. Matching configurations are reused and conflicting ones preserved for
review. Update can align the companion skill and packages with the selected release.
Verify the desktop connection after opening a design document. The Bash route
supports macOS/Linux or WSL.

### Skills CLI

This repository's enhanced entry point calls
[Vercel Labs Skills CLI](https://github.com/vercel-labs/skills) and provides the
same optional drawing-tool setup:

```bash
npx --yes --package=git+https://github.com/zzzhy03/academic-workflow.git academic-workflow
```

These options apply to that enhanced entry point:

| Command or option | Purpose | Choices or example |
| --- | --- | --- |
| `install / update` | Install or update; default install | `install`, `update` |
| `--skill NAME` | Select a skill; repeat for several | `academic-paper-writing`, `academic-diagram-design` |
| `--all` | Install all academic skills, the default | `--all` |
| `--agent TARGET` | Detect or select clients | `auto` (default), `all`, `codex`, `claude-code` |
| `--global` | User-wide installation, the default | `--global` |
| `--project` | Install under the current project | `--project` |
| `--with-openpencil` | Add the official skill, CLI/MCP, and client registration | `--with-openpencil` |
| `--mcp-root DIRECTORY` | OpenPencil access directory; default current directory | `--mcp-root "$PWD"` |
| `--yes` | Accept Skills CLI installation prompts | `--yes` |
| `--dry-run` | Show the plan without installing | `--dry-run` |
| `--help` | Show help | `--help` |

The original Skills CLI remains available for interactive skill and destination selection:

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow
```

The original command follows Vercel's options and does not accept this repository's
`--with-openpencil`. Skills CLI installs from Git; Bash installs from published
releases. Neither route uploads local edits. Automatic software/MCP setup supports
macOS/Linux or WSL and does not install or launch the desktop application.

## GitHub Actions

Two workflows share [scripts/build.py](scripts/build.py):

| Trigger | Work | Output |
| --- | --- | --- |
| PR or push to main | Format/reference checks, installer tests, packaging | CI artifacts |
| A version tag such as v0.3.0 | Repeat checks, verify the version, package | Public GitHub Release |

Current releases provide source code, two individual skill ZIPs, one collection ZIP,
and `install.sh`. GitHub supplies the source downloads automatically; the installer
contains its skill list and ZIP verification data.
Local saves do not upload automatically. Main pushes start CI; version tags publish releases.

## Maintain and contribute

Maintainer checks require Node/npm and Python 3.9+:

```bash
npm ci --ignore-scripts
npm test
npm run validate
npm run build
```

Edit sources under `skills/`. Register new skills in `dependencies.json`; release
data in the installer is generated automatically. Update the package and lockfile
version before pushing a matching version tag. Review wording changes carefully;
installation/packaging changes need relevant behavior tests.

This repository is [MIT licensed](LICENSE). The pinned upstream OpenPencil skill
and its license are preserved under
[integrations/open-pencil](integrations/open-pencil/UPSTREAM.md); CLI/MCP packages
are installed from the official upstream. See [CONTRIBUTING.md](CONTRIBUTING.md).
