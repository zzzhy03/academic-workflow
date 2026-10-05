# Design and Layout

Use this reference to plan a figure or revise its visual expression. For supplied
images, combine it with [Assets and workspace](assets-and-workspace.md); for final
output, use [Export and review](export-and-review.md).

## Express the scientific content

Identify what the reader should understand, which entities and relationships are
necessary, and where the contribution lies. Resolve ambiguous operations or arrow
meanings before drawing them. Name a module after understanding its function, using
concise scholarly wording consistent with the manuscript.

Allocate space according to importance, information density, and final-size
readability. Compress routine or repeated steps when their meaning remains clear.
A caption can carry explanation that would overcrowd a panel. Do not introduce
modules, claims, or geometry merely to fill space.

## Choose the composition

Choose a structure that fits the relationships. Useful options include:

| Relationship | Composition and point to watch |
| --- | --- |
| Ordered transformations | A pipeline with clear input and output; compress minor steps before making an excessively wide chain. |
| Parallel paths or fusion | Align corresponding operations and show where paths combine; distinguish shared from independent processing when relevant. |
| Overall method and a key detail | An overview with a linked detail panel; make clear that the enlargement is not another execution stage. |
| Iteration or feedback | Show what returns, what changes, and where the loop ends. |
| Categories or hierarchy | Use containment, a tree, or a matrix; reserve arrows for relationships with meaningful direction. |
| Qualitative comparison | Align cases and methods with comparable views and scales; callouts point to visible evidence. |

Use separate panels when they make distinctions such as training versus inference
clearer. Give each panel a specific job and keep its reading order consistent with
the caption. Share labels or legends where repetition would waste space.

## Explore a visual direction when useful

When the scientific structure is clear but the composition or style remains
unresolved, a generated raster sketch can help choose a direction. Start with one;
generate another only if it answers an unresolved question or compares a materially
different composition. Skip this for an established layout or a small revision.

Provide the intended relationships, panel roles, emphasis, and restrained visual
style. Use little text. Evaluate composition and hierarchy rather than polishing
generated spelling or arrows. Generated labels, equations, and topology are not
scientific evidence: reconstruct the selected direction as editable elements using
the actual specification. Keep any imported concept reference separate from final
content and exclude it from the publication export.

Save the reference visibly in the design workspace so the user can review it.
Stop generating references once the direction is sufficient to proceed.

## Make the subject large within the paper allocation

A figure is scaled to fit its allocated paper width or height. Empty background
and padding consume that same allocation, reducing the visible size of the useful
content. Treat compactness as part of composition from the start.

After preparing tight asset crops, minimize unnecessary image-to-image gaps, panel
padding, distance between labels and images, and the outer figure margin. Avoid
adding another blank border around each already-cropped asset. Retain the space
needed to distinguish groups, prevent touching or overlap, and keep text readable.

Adapt panel proportions to the actual subjects. Preserve aspect ratios and
scientific content; a tall or narrow subject need not fill both dimensions.
For a series of comparable figures, use consistent scales and type, considering
the page with the tightest space budget.

## Calculate and refine the layout

Assign concrete positions and sizes to visible elements. Derive repeated gaps,
baselines, and connector routes from shared values. After changes to text, assets,
or structure, recompute affected bounds and inspect the result.

Use actual rendered text and image bounds rather than relying on empty frames or
nominal text boxes. A user's rough arrangement can establish intent while still
requiring alignment and spacing corrections. Choose manual placement or layout
tools according to which produces the intended geometry.

For a new complex figure, settle the structure before detailed decoration. Use a
simple skeleton where helpful, then refine with real assets. Local edits should
preserve unrelated, already-approved content.

## Typography and visual consistency

Judge type relative to the paper's body text at the final inserted size. Keep main
labels close to body-text size; use roughly **0.5–2 times the body-text size** as an
adjustable range for secondary labels through prominent headings. The lower end
must still be readable. This is not a requirement to use either extreme.

Keep peer labels consistent in font, size, weight, capitalization, and notation.
Use actual glyph appearance to compare figures; identical editor font sizes do not
guarantee identical printed size after scaling. Check subscripts and edge labels
as well as headings.

Use consistent visual treatment for the same semantic role. Keep arrows direct,
their endpoints clear, and their direction faithful to the method. Assign a meaning
to differences such as solid and dashed lines. Avoid decorative connectors.

Use a small, coherent palette with sufficient contrast. Support essential color
distinctions with labels, shape, or another cue when needed. Icons should help
recognition; keep their style and weight consistent. Decoration should not obscure
the mechanism or occupy space needed by the content.

## Preserve useful editability

Keep text as text where possible, assets replaceable, and connectors editable as
coherent objects. Group elements by semantic unit so the user can move or replace
a module without collecting scattered layers.

When importing SVG or other artwork, distinguish visual fidelity from text and
structural editability. Outlined text is not editable text; check transforms,
cropping, layer order, and line styles. Explain relevant conversion limitations
instead of claiming an exact editable reconstruction.
