# Collaboration and Build

Use this reference when editing manuscript files, synchronizing a collaborative
project, or managing its PDF variants. Use the current project's setup and existing
authorization; no particular branch, author macro, or engine is universal.

## Follow the manuscript's revision conventions

Inspect how collaborators mark substantive edits and comments. Follow established
revision macros and use the current author's comment macro where appropriate.
If no such convention exists, do not introduce one for a routine edit. If the
author-to-macro mapping is unclear and a comment is needed, ask.

Follow the project's distinction between substantive revisions and small corrections.
Do not wrap every typo fix in a revision macro automatically. Keep manuscript text,
revision styling, and internal author notes distinguishable, especially during
final cleanup.

## Establish the synchronization state

Before editing tracked files, inspect repository instructions, the working tree,
branch, upstream, and relevant pending changes. Determine whether this project
actually uses Overleaf, GitHub synchronization, or another arrangement. Do not
configure a new integration as part of an ordinary writing task.

For a manual Overleaf-to-GitHub workflow, online changes must reach GitHub before
the local checkout can incorporate them. Use synchronization status already
established in the current conversation. If necessary status is missing, explain
what needs to be synchronized while continuing safe read-only inspection.

Preserve local work before updating. Do not pull over a dirty worktree; first
account for and safely preserve the existing edits according to the project workflow.
Use a fast-forward update when histories allow it; when they diverge, inspect the
differences and use the project's merge process. Do not discard work or force-push
to bypass a conflict.

After authorized local changes reach GitHub, remind the user to pull them into
Overleaf and compile there when that is how this project synchronizes. A successful
local push alone does not establish that Overleaf is updated.

## Make conflicts reviewable

Separate independent changes from genuine overlaps. For a substantive disagreement,
show the complete local and remote passages, explain what differs, and give a
proposed combined version when useful. Include enough context to judge whether
content moved elsewhere rather than being removed.

Resolve routine non-overlapping changes within scope. Ask about scientific or
editorial choices that cannot be inferred. After merging and restoring local work,
check that both intended contributions remain present and compatible. A conflict-free
Git merge does not itself establish semantic consistency.

Respect the current authorization for commits and pushes, including a request to
review locally first. Group commits by the actual change when commits are requested.

## Maintain working and final variants only when useful

Use shared manuscript sources with switches for unfinished content or temporarily
omitted sections instead of maintaining two drifting copies of the prose.
Retain partial results and deferred work; hiding a table does not complete the
experiment or justify deleting its remaining placeholders.

Control content visibility separately from image quality. When heavy figures slow
editing, use reduced-resolution preview copies or temporarily skip irrelevant
large figures. Keep full-quality originals and restore final assets for publication
checks. JPEG can suit photographic/rendered previews; preserve transparency or
line detail when another format is more appropriate.

Follow the current decision about which incomplete content remains visible.
Avoid removing every numeric placeholder simply because a variant is called final
or clean. During final review, flag any remaining placeholders against the actual
delivery requirements.

## Build once the editing round is ready

Identify the manuscript roots and which outputs the changed files affect, including
main, working, supplementary, or combined variants when present. Run all builds
required by the project after the intended source edits for the round are complete.
Do not rebuild after every intermediate edit.

Use the template's configured engine and bibliography workflow. Use its existing
build recipe, such as latexmk when configured, rather than switching engines or
using a single pass without a demonstrated need. For a standalone document, use
the environment's established editor/compiler workflow.

Respect existing editor build preferences. Do not enable continuous rebuilds just
to refresh an assistant edit. Confirm the generated outputs are current and that
the viewer is displaying the intended PDF; refresh it when necessary.

On failure, inspect the first substantive compiler error. Retain incremental and
source-navigation files during normal builds; clean auxiliary files only for
symptoms such as stale or corrupt build state. Keep generated files in the project's
designated output location.

After a successful build, inspect affected pages with their surrounding text:
formulas, tables, captions, wrapping, and page breaks can be wrong even when
compilation succeeds. Check repository status so generated artifacts do not
accidentally enter source changes. Report build or visual-check limitations plainly.
