# Academic Workflow

将真实学术工作中的经验提炼为可复用的 AI agent skills，帮助论文与图稿更准确、清楚、
易读，同时减少重复解释和不必要的记录负担。欢迎通过 Issues 和 Pull Requests 提出建议。

[English](README.md) · [贡献说明](CONTRIBUTING.md) · [Releases](https://github.com/zzzhy03/academic-workflow/releases)

## 已有 skills

- [academic-paper-writing](skills/academic-paper-writing/SKILL.md)：写作、数据与表格核对、
  一致性、协作编译及终稿检查。
- [academic-diagram-design](skills/academic-diagram-design/SKILL.md)：可编辑学术示意图、
  紧凑排版、素材管理及导出检查。

Skill 本体是包含 `SKILL.md`、参考文档等内容的文件夹，不依赖 Node.js 才能读取。
`agents/openai.yaml` 是可选的 OpenAI 界面元数据，主体格式也适用于 Claude Code。

## 三种安装方式

| 方式 | 需要什么 | 适用情况 |
|---|---|---|
| Release ZIP | 浏览器和解压工具 | 手动安装，或向支持自定义 skill 的客户端上传单个 ZIP |
| Bash 安装器 | macOS/Linux 的 Bash、curl、unzip、awk 及 sha256sum 或 shasum | 直接从正式 Release 安装，不需要 Node、npm、Git 或 Python |
| Skills CLI | Node.js 22.20.0+、npm 和 Git | 已习惯通用跨客户端安装工具的用户 |

### 手动下载

从 [最新 Release](https://github.com/zzzhy03/academic-workflow/releases/latest) 下载单个 skill
或 `academic-workflow-skills.zip` 合集。解压后，把直接包含 `SKILL.md` 的 skill 文件夹
放到客户端目录，保留 `references/` 等内容；不要把外层合集目录当成一个 skill。

常见全局位置为 Codex 的 `~/.agents/skills/` 和 Claude Code 的 `~/.claude/skills/`。
已有自定义或旧版安装位置时，沿用当前客户端配置。手动更新前先处理自己的修改，再替换对应目录。

### Bash 安装器

为 Codex 安装全部：

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- --agent codex
```

只为 Claude Code 安装写作 skill：

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- --agent claude-code --skill academic-paper-writing
```

重复 `--skill` 可以选多个；不指定则安装合集内全部 skills。

| 参数 | 含义 |
|---|---|
| `--project` | 安装到当前项目，默认是全局安装 |
| `--dest 路径` | 指定已有的、自定义的 skill 安装目录 |
| `--version v0.2.0` | 指定正式版本，默认 latest |
| `--list` | 查看该版本的 skills，不安装 |
| `--dry-run` | 下载并验证目录清单，展示计划，不写入安装目录 |
| `--replace` | 更新选中的已有 skills，同时保留旧目录备份 |

更新时再次运行，并加上 `--replace`：

```bash
curl -fsSL https://github.com/zzzhy03/academic-workflow/releases/latest/download/install.sh | bash -s -- --agent codex --replace
```

安装器先确定一个 Release 版本，再下载该版本的目录清单、ZIP 和校验值。
所有选中压缩包下载、校验完成后才开始安装。默认不覆盖已有目录；
`--replace` 只替换所选 skills，旧版备份放在加载目录之外，其他 skills 不受影响。
通过软链接安装的 skill 不会被替换，应更新其源文件或指定其他目录。
若后续某个安装失败，前面已经完成的安装会保留。

已有旧版或自定义路径时，用 `--dest` 更新那里，避免同一客户端出现多个同名副本。
要固定安装器本身的版本，可以从指定版本的下载 URL 获取 `install.sh`，
同时使用 `--version` 指定该版本。

Bash 方式支持 **v0.2.0 及以后**的 Release；旧版仍可手动下载 ZIP。
Windows 可使用 ZIP、Skills CLI，或在 WSL 等 Linux 环境中使用 Bash 路径。

### Skills CLI

`npx skills` 调用的是 [Vercel Labs 的第三方开源安装工具](https://github.com/vercel-labs/skills)，
并非本项目原创的 CLI，也不是 skill 文件格式标准本身。

交互选择 skills、agent 和安装范围：

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow
```

也可以加 `--agent codex --global` 或 `--agent claude-code --global`，
并用一个或多个 `--skill 名称` 指定内容。通过此工具安装后，用它更新：

```bash
npx skills@1.7.0 update academic-paper-writing academic-diagram-design --global
```

Skills CLI 直接读取 Git 仓库，Bash 安装器读取正式 Release。
因此 main 的新内容可能先于下一个 Release 出现在 Skills CLI 安装中。
这些安装和更新操作都不会把用户本地修改自动推回 GitHub。

## 可选的 OpenPencil 配套安装

Bash 文件安装器不安装软件或改动 MCP 配置。原有 Node 安装入口继续保留，
供 macOS/Linux 的 Codex 用户选用：

```bash
npx --yes --package=git+https://github.com/zzzhy03/academic-workflow.git academic-workflow install --all --with-openpencil --mcp-root "$PWD"
```

它需要 Git、Node/npm 和 Codex CLI，会调用 Skills CLI 安装选中的学术 skills 与
OpenPencil 官方 skill，安装指定版本的 CLI/MCP，并为 Codex 注册 MCP。
可以用一个或多个 `--skill` 替代 `--all`，或加 `--dry-run` 先看命令计划。
Claude Code 用户可通过上面的通用方式安装 skills，再按其客户端方式配置 MCP。

上游来源和版本放在 [dependencies.json](dependencies.json)。
已有匹配工具/配置会复用；不同的 MCP 根目录或连接方式会保留并报告，
工具版本不一致需要显式 `--update-tools` 才会替换。更新前应确认桌面版本兼容。
`--project` 仅改变 skill 安装范围，额外软件包和 MCP 配置仍是用户级。

桌面应用单独安装，见 [OpenPencil 官方说明](https://github.com/open-pencil/open-pencil)。
脚本不会自动安装或启动桌面应用。桌面模式需要打开设计文档并重新连接 MCP；
注册成功不等于已验证实际连接。现有自动配套安装暂不支持 Windows。
安装失败会停止后续步骤并返回失败状态，之前已完成的步骤不会自动回滚。

## GitHub Actions 在做什么

两条流程共用 [scripts/build.py](scripts/build.py)：

| 触发条件 | 执行内容 | 结果 |
|---|---|---|
| push 到 main 或提交 PR | 格式和引用检查、安装器测试、打包 | 保存为 Actions 构建产物，供检查 |
| 推送版本标签，例如 v0.2.0 | 再次检查，核对版本号，再打包 | 创建公开 GitHub Release |

Release 包含单个 skill ZIP、合集 ZIP、`install.sh`、`skills.txt`、版本清单和 SHA-256 校验值。
Bash 测试在 Linux、macOS 执行；Windows 继续检查 Node 安装器和打包。
这些都在 GitHub 的机器上执行，ZIP/Bash 用户无需安装维护者的构建环境。

本地保存不会自动上传。推送 main 才触发 CI；版本标签才触发正式 Release。
生成文件位于忽略的 `dist/`，不提交。当前不发布到 npm registry，
`private: true` 防止意外发布自己的 Node 包。

## 维护与贡献

维护检查需要 Node/npm 和 Python 3.9+：

```bash
npm ci --ignore-scripts
npm test
npm run validate
npm run build
```

以 `skills/` 中的源码为准。新增 skill 时，把目录加入这里，并登记到 `dependencies.json`；
发布目录清单会自动生成。发布新版本时更新 package.json 和 lockfile，提交后推送匹配的版本标签。
上游依赖版本应经过检查后再升级。

欢迎提出可复用的改进。不要把私人研究材料、机器路径或单次案例规则混入通用 skills。
文字修改以审阅为主；安装和打包修改需要相应行为测试。
贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。

本仓库采用 [MIT License](LICENSE)。OpenPencil 和 Skills CLI 保留各自维护者与许可证。
