# Export and Review

Use this reference for publication exports or a final figure audit. Review the
actual delivered artifact, not just the design canvas.

## Check semantic structure before every export

Before exporting any version, including intermediate drafts and previews, inspect
the whole figure's element hierarchy and grouping. Organize panels, modules, and
their contents in a clear semantic order, with correct parent-child relationships.
Elements that form one meaningful unit should belong to the appropriate group;
independent units should remain distinct, and shared elements should sit at the
appropriate common level.

Correct misplaced elements or unclear group boundaries while preserving the
intended appearance and layer stacking. The resulting structure should make it
straightforward to select, move, or edit a semantic unit together. Save the checked
structure before exporting.

## Select output format and size

Retain the editable figure source. Prefer vector PDF for vector diagrams used in
LaTeX; keep SVG when useful for interchange. For rendered or other raster content,
use an appropriate image format, preserving transparency and line quality where
needed.

For raster exports, use these approximate starting widths:

| Intended use | Export width |
| --- | ---: |
| Single-column figure | 2000 px |
| Double-column figure | 4000 px |

Let height follow the composition. These are adjustable production defaults,
not prescribed canvas dimensions: drawing at another scale and exporting
proportionally is fine. Higher export dimensions do not recover detail absent
from source images.

Check the actual insertion width in the paper. Pixel count provides raster detail;
it does not establish readable label size. Typography is defined in
[Design and layout](design-and-layout.md). Vector-only content has no fixed pixel
width requirement.

Save and export the intended figure/page to the established destination. Exclude
reference images, hidden experiments, temporary annotations, and unused canvas.

## Inspect at final reading size

Check the export and, when available, the affected paper page at normal reading
size. Focus on what could undermine this figure:

- **Meaning:** entities, labels, directions, decisions, repetitions, and groupings
  agree with the supplied explanation and manuscript. The caption and panel
  references describe the actual figure.
- **Occupancy and alignment:** subjects are complete and proportional; image gaps,
  label distances, panel padding, and outer margins do not waste avoidable space.
  No text, arrowhead, or image is clipped, covered, or unintentionally misaligned.
- **Legibility:** main labels, smaller labels, formulas, line weights, and arrowheads
  remain clear after scaling. Peer labels and comparison panels are consistent.
- **Rendering:** images are present, transparency and layer order are correct, and
  fonts or vector conversion have not changed glyphs, line breaks, or geometry.
  Important distinctions remain understandable with the chosen contrast and colors.

When converting or restoring a figure, compare against the source where fidelity
matters. If a limitation remains, describe it rather than treating a successful
export or lint result as sufficient verification.

## Deliver to the paper

Update only the intended final figure in the manuscript's image directory when
requested or already authorized. Leave editable sources, collected assets, and
working logs in the design workspace.

Follow the project's build requirements for affected manuscript targets. Inspect
the image with its caption and nearby text for scale, spacing, clipping, or float
problems introduced by the change. If the manuscript is unavailable, provide the
export and clearly state that insertion into the paper has not been checked.

Finish the workspace review described in
[Assets and workspace](assets-and-workspace.md): verify collected asset dependencies,
update the current source/export status, and clean or archive unnecessary work.
Report the editable source and final export paths, checks completed, and any
remaining issue. Keep delivery notes brief.
