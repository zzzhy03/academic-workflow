# Assets and Workspace

Use this reference when selecting, importing, processing, or organizing figure
materials. The design workspace contains editable sources and working assets.
The manuscript's image directory contains the final exports consumed by LaTeX.

## Import selected material before using it

Treat an externally supplied material folder as read-only. Do not modify, rename,
move, delete, or write crops, renders, or logs into that folder.

Select what the figure needs and copy it into the design workspace before editing
or linking it. Collect required textures, referenced geometry, and other associated
asset files as well. Preserve the selected, unprocessed copies when needed to
re-render, re-crop, or reconsider the presentation.

Subsequent figure links, asset lists, and processing scripts must use the collected
copies. Prefer workspace-relative asset paths where supported. External absolute
paths and symlinks back to the supplied folder do not make the workspace independent.
An original location may be kept as a brief provenance note, not a required input.

The asset-dependency check is practical: the figure should still open, remain
editable, and support regeneration after the supplied folder is unavailable.
Inspect references and copy missing dependencies before calling collection complete.
Do not move or delete the external folder to perform this check.

Copy the selected subset and its dependencies, not the whole supplied collection.
Reuse an existing collected copy when suitable. Asset independence does not require
bundling the installed renderer or design application.

## Keep the workspace understandable

Use the established project layout when it already serves the task. For a new
workspace, a useful division is:

```text
figure-workspace/
├── current.md     Current source/page, export destination, and unfinished work
├── source/        Editable figure and scripts still needed to regenerate it
├── assets/        Collected source copies and prepared figure assets
├── exports/       Current publication export and useful preview
└── _work/         Temporary renders, generated scripts, diagnostics, and logs
```

Small figures need only the relevant parts. Keep unprocessed collected copies
distinguishable from derivatives using clear names or subfolders. Organize prepared
assets by use in the figure so replacements are easy to find.

Keep the workspace outside the paper repository or locally ignored when project
guidance calls for that. Only the required final figure goes into the manuscript's
image directory. Keep temporary/generated scripts with working material; retain
scripts under source only when they are still useful for regenerating the figure.

Existing machine-generated selections and render settings may be reused, with
paths updated to collected copies. Do not ask the user to maintain another asset
spreadsheet, form, or parallel record.

## Crop for useful subject occupancy

Remove non-semantic background before composition. As a starting point, leave
approximately **5% safety margin on each side of the resulting crop**, with the
complete subject occupying most of the available extent. Adjust margins for the
actual subject, comparison conditions, and final layout; tighter spacing is useful
when it remains clear.

Preserve aspect ratio and meaningful content. Do not stretch a narrow subject or
cut off part of it to fill a slot. Keep views, scale, and framing comparable across
methods for the same case. A display crop must not silently change what is claimed
about the scientific input or result.

Compose the prepared assets using
[Design and layout](design-and-layout.md), which covers gaps between assets and
the outside margin of the whole figure.

## Save a reliable current version

Use an established source path and naming scheme. Save after each reviewable
iteration, and keep the current source and important milestones easy to identify.
Use pages or separate version files as appropriate; a minor tweak does not require
another complete set of source, previews, reports, and scripts.

When using OpenPencil, begin by listing documents and explicitly target the intended
document and page. Inspect its tree and selection before editing. Resolve genuinely
ambiguous unnamed documents rather than relying on the visually active tab.

Before switching between desktop editing and headless file updates, establish
which state is current and preserve unsaved user edits. Reopen or reload the saved
result when needed; a stale open tab must not overwrite a newer disk version.
Use the available `open-pencil` skill or current tool documentation for operations.

Keep completed rendering and layout work resumable. Limit concurrent heavy tasks
according to actual resource conditions, and release task-owned previews and
processes when finished without interfering with unrelated user work.

## Keep current status short and cleanup deliberate

Maintain at most one brief current-state note when a multi-step task needs it:
which source/page to edit, where the export goes, and what remains unfinished.
Update it in place as work completes; do not leave stale active-state instructions
beside a later completion paragraph. Reuse an existing note instead of creating a
second README describing the same status. The assistant maintains this note.

After the selected result has been checked and needed inputs are collected, remove
known-unneeded temporary renders, failed outputs, duplicate PDF snapshots, and
diagnostics, or place them in a recoverable archive when appropriate. Retain useful
milestones and files still needed to reproduce the current figure. Do not treat
the supplied external folder or unrelated manuscript build caches as cleanup targets.

Report any meaningful retained dependency or cleanup uncertainty briefly.
