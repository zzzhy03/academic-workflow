# Academic Workflow

将真实学术工作中的经验提炼为可复用的 AI agent skills，帮助论文与图稿更准确、清楚、
易读，同时减少重复解释和不必要的记录负担。欢迎通过 Issues 和 Pull Requests 提出建议。

[English](README.md) · [贡献说明](CONTRIBUTING.md) · [Releases](https://github.com/zzzhy03/academic-workflow/releases)

## 已有 skills

- [academic-paper-writing](skills/academic-paper-writing/SKILL.md)：写作、数据与表格核对、一致性、协作编译及终稿检查。
- [academic-diagram-design](skills/academic-diagram-design/SKILL.md)：可编辑学术示意图、紧凑排版、素材管理及导出检查。作图时可通过 `--with-openpencil` 安装 OpenPencil 官方 skill、CLI/MCP 并配置客户端；桌面应用请按[官方说明](https://github.com/open-pencil/open-pencil)另行安装。

## 三种安装方式

| 方式 | 需要什么 | 使用情况 |
|---|---|---|
| Release ZIP | 浏览器和解压工具 | 直接下载Release ZIP手动安装 |
| Bash 安装器 | macOS/Linux 的 Bash、curl、unzip | 从正式版本一条命令安装 |
| Skills CLI | Node.js 22.20.0+、npm 和 Git | 沿用 Skills CLI 安装工作流 |

### Release ZIP

从 [最新 Release](https://github.com/zzzhy03/academic-workflow/releases/latest) 下载单个 skill ZIP
或 `academic-workflow-skills.zip` 合集，将其中所需的 skill 文件夹完整放入客户端的技能目录。
保留文件夹内的参考文档；手动更新时替换对应目录。

### Bash 安装器

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash
```

默认安装全部学术 skills，并自动识别本机客户端。需要传入参数时，在 `bash` 后加
`-s --`，再接下表中的命令或参数。

| 命令或参数 | 用途 | 可选项或示例 |
|---|---|---|
| `install / update` | 安装或更新，默认 install；update 保留旧目录备份 | `install`、`update` |
| `--skill NAME` | 选择 skill，可重复指定 | `academic-paper-writing`、`academic-diagram-design` |
| `--all` | 安装全部学术 skills，默认行为 | `--all` |
| `--agent TARGET` | 选择客户端；auto 自动识别，all 安装到两者 | `auto`（默认）、`all`、`codex`、`claude-code` |
| `--global` | 全局安装，默认行为 | `--global` |
| `--project` | 安装到当前项目 | `--project` |
| `--dest DIRECTORY` | 沿用已有或自定义安装目录 | `--dest "$HOME/.agents/skills"` |
| `--version TAG` | 选择正式版本 | `latest`（默认）、`v0.3.0` |
| `--with-openpencil` | 同时安装作图所需的官方 skill、CLI/MCP，并注册客户端 | `--with-openpencil` |
| `--mcp-root DIRECTORY` | OpenPencil 可访问的作图目录，默认当前目录 | `--mcp-root "$PWD"` |
| `--list` | 查看学术 skill 列表，不安装 | `--list` |
| `--dry-run` | 展示计划，不安装 | `--dry-run` |
| `--help` | 查看帮助 | `--help` |

例如更新现有安装：

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- update
```

文件会在下载检查完成后安装；已有目录需用 `update` 更新，旧版备份保留在技能加载目录之外。
自动识别到多个客户端时会分别安装，未识别到时使用通用技能目录。
已有自定义位置可用 `--dest` 指定；软链接安装应更新其源目录。

选择 `--with-openpencil` 时，需具备 Node/npm 和相应客户端 CLI；
两个客户端使用相同的配套功能。MCP 注册为用户级，访问范围由 `--mcp-root` 决定。
已有匹配配置会复用，不同配置会保留并提示检查；`update` 可更新配套技能与软件版本。
桌面连接需要打开设计文档后验证。Bash 路径支持 macOS/Linux 或 WSL。

### Skills CLI

本仓库的增强入口调用 [Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)，
并提供同样的可选作图配套安装：

```bash
npx --yes --package=git+https://github.com/zzzhy03/academic-workflow.git academic-workflow
```

以下参数用于这个增强入口：

| 命令或参数 | 用途 | 可选项或示例 |
|---|---|---|
| `install / update` | 安装或更新，默认 install | `install`、`update` |
| `--skill NAME` | 选择 skill，可重复指定 | `academic-paper-writing`、`academic-diagram-design` |
| `--all` | 安装全部学术 skills，默认行为 | `--all` |
| `--agent TARGET` | 自动识别或指定客户端 | `auto`（默认）、`all`、`codex`、`claude-code` |
| `--global` | 全局安装，默认行为 | `--global` |
| `--project` | 安装到当前项目 | `--project` |
| `--with-openpencil` | 同时安装官方 skill、CLI/MCP 并注册客户端 | `--with-openpencil` |
| `--mcp-root DIRECTORY` | OpenPencil 可访问的作图目录，默认当前目录 | `--mcp-root "$PWD"` |
| `--yes` | 接受 Skills CLI 的安装确认 | `--yes` |
| `--dry-run` | 展示计划，不安装 | `--dry-run` |
| `--help` | 查看帮助 | `--help` |

也可以继续使用原生 Skills CLI，让它交互选择技能和安装位置：

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow
```

原生命令的选项以 Vercel 文档为准，不接收本仓库的 `--with-openpencil`。
Skills CLI 从 Git 仓库安装，Bash 从正式 Release 安装；两种方式都不会自动上传用户的本地修改。
自动软件/MCP 配置适用于 macOS/Linux 或 WSL，桌面应用不会自动安装或启动。

## GitHub Actions

两条流程共用 [scripts/build.py](scripts/build.py)：

| 触发条件 | 执行内容 | 结果 |
|---|---|---|
| push 到 main 或提交 PR | 格式和引用检查、安装测试、打包 | Actions 构建产物 |
| 推送版本标签，例如 v0.3.0 | 再次检查并核对版本号，再打包 | 公开 GitHub Release |

当前 Release 提供源码、两个独立 skill ZIP、一个合集 ZIP，以及 `install.sh`。
源码下载由 GitHub 自动提供；安装所需的技能列表和 ZIP 校验信息包含在脚本中。
本地保存不会自动上传，推送 main 才触发 CI，版本标签才触发正式发布。

## 维护与贡献

维护检查需要 Node/npm 和 Python 3.9+：

```bash
npm ci --ignore-scripts
npm test
npm run validate
npm run build
```

以 `skills/` 中的源码为准。新增 skill 后登记到 `dependencies.json`，安装脚本的发布数据会自动生成。
发布时更新 package.json 和 lockfile，提交后推送匹配的版本标签。
纯文字修改以审阅为主，安装和打包修改应补充相应行为测试。

本仓库使用 [MIT License](LICENSE)。OpenPencil 官方 skill 的固定版本与许可证保留在
[integrations/open-pencil](integrations/open-pencil/UPSTREAM.md)，CLI/MCP 仍从官方软件包安装。
其他贡献说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。
