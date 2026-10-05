# Academic Workflow

将真实学术工作中有用的经验提炼为可复用的 AI agent skills，帮助论文与图稿更准确、
清楚、易读，同时减少重复解释和不必要的记录负担。

当前包含学术写作与学术作图两个 skill，之后可继续增加其他学术工作流。
欢迎通过 Issues 提出问题和建议，通过 Pull Requests 改进内容。

[English](README.md) · [贡献说明](CONTRIBUTING.md)

## 已有 skills

- [academic-paper-writing](skills/academic-paper-writing/SKILL.md)：写作表达、数据与表格核对、
  前后一致性、协作编译及终稿审查。
- [academic-diagram-design](skills/academic-diagram-design/SKILL.md)：可编辑学术示意图、
  紧凑排版、素材管理及导出检查。

## 安装一个或多个

以下命令需要 Node.js 22.20.0 或更新版本及 npm。

交互选择 skills、使用的 agent 和安装范围：

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow
```

只为 Codex 全局安装写作 skill：

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow --skill academic-paper-writing --agent codex --global
```

两个一起安装：

```bash
npx skills@1.7.0 add zzzhy03/academic-workflow --skill academic-paper-writing --skill academic-diagram-design --agent codex --global
```

之后更新：

```bash
npx skills@1.7.0 update academic-paper-writing academic-diagram-design --global
```

安装从仓库直接读取，不必先下载 ZIP。更新是把仓库版本取到本地，不会把本地修改自动推回仓库。

## 可选的 OpenPencil 安装

macOS/Linux 用户可以同时安装我们的 skills、OpenPencil 官方 skill、CLI/MCP，
并为 Codex 注册 MCP：

```bash
npx --yes --package=git+https://github.com/zzzhy03/academic-workflow.git academic-workflow install --all --with-openpencil --mcp-root "$PWD"
```

该命令另外需要 Git 和 Codex CLI。`--mcp-root` 应指向允许 OpenPencil 访问的作图目录。
增加 `--dry-run` 可先查看步骤，不执行安装；用一个或多个 `--skill NAME` 替代 `--all` 可以选择安装。

官方 OpenPencil skill 从其当前主仓库获取，具体修订与软件版本记录在
[dependencies.json](dependencies.json)，不直接打包本机旧副本。

已存在但不同的 MCP 设置会被保留并报告；已有软件版本不一致时需要显式使用
`--update-tools` 才会替换，应先确认与桌面应用兼容。
`--project` 仅改变 skill 安装范围，额外的软件包和 MCP 配置仍是用户级。

**桌面应用需另外安装。** macOS 可参考官方的 `brew install --cask openpencil`；
其他平台请看 [OpenPencil 官方说明](https://github.com/open-pencil/open-pencil)。
安装脚本不会启动应用。使用桌面模式时，需要打开一个设计文档，并重新连接或重启 Codex MCP 客户端。
配置写入成功不等于已经验证桌面连接成功。Windows 的 skills 安装可用，
OpenPencil 工具及 MCP 暂按官方说明手动设置。

## 自动打包与贡献

- 每次 push 到 main、每个 PR：自动测试、检查引用和打包，生成 CI artifacts。
- 推送与 package.json 版本一致的标签（例如 v0.1.0）：验证通过后创建 GitHub Release。
- Release 包含单个 skill ZIP、全部 skills ZIP、版本清单和 SHA-256 校验值。
- 本地保存不会自动上传；提交并推送后才触发 CI。
- 仓库负责源码维护，安装副本负责使用。暂不向 npm registry 发布独立包。

维护检查另外需要 Python 3.9 或更新版本；普通 skill 安装不需要。修改后可运行：

```bash
npm ci --ignore-scripts
npm test
npm run validate
npm run build
```

欢迎补充能够跨项目复用、能改善实际决策的经验。
不要为了一个案例把规则写死，也不需要为纯文字调整补一套形式化测试。
新 skill 放在 `skills/` 并登记到 `dependencies.json`，其余贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。

本仓库使用 [MIT License](LICENSE)。
OpenPencil 和 Skills CLI 是独立上游项目，仍保留各自的维护者、安装方式与许可证。
