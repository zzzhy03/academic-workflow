---
name: academic-diagram-design
description: Design, revise, or audit editable conceptual figures for CS/AI papers from prose and supplied assets, including method overviews, pipelines, multi-panel schematics, and qualitative comparisons. Use for figure composition, asset preparation, and publication layout. Do not use for numerical plots, LaTeX result tables, UI mockups, or automatic code reconstruction.
---

# Academic Diagram Design

Create scientifically faithful, editable figures that are clear at their final
size in the paper. Use the user's explanation, manuscript, and supplied materials
as the basis for meaning. Inspect implementation code when the user requests it.

The central layout goal is to give meaningful content as much of the available
paper space as practical. Crop unnecessary background, tighten composition, and
preserve complete subjects, legibility, and meaningful separation.

Follow current user and project instructions. Keep paper names, paths, terminology,
specific cases, and collaborator conventions in project files. The numerical
defaults in the references are adjustable starting points.

## Read the relevant functional reference

- [Design and layout](references/design-and-layout.md): scientific expression,
  composition, optional concept sketches, typography, spacing, and editable structure.
- [Assets and workspace](references/assets-and-workspace.md): importing selected
  materials, cropping, self-contained asset dependencies, saving, versions, and cleanup.
- [Export and review](references/export-and-review.md): output format and resolution,
  final-size checks, and delivery to the manuscript.

Read only what the current task needs. Keep each rule in its functional reference;
the workflow below connects them without requiring every task to start over.

## Work through the appropriate stages

1. **Understand and plan.** Establish the figure's message, relationships, emphasis,
   and intended single-column or double-column use from available context. Clarify
   scientific ambiguities that would change its meaning. For a substantial new
   composition, discuss a small number of useful alternatives when the direction
   remains open. Use a generated concept sketch only when visual exploration helps.
2. **Prepare.** Reuse a suitable design workspace. Select and copy needed external
   assets and their dependencies into it before processing or linking them. The
   workspace must remain usable after the external source folder is removed.
3. **Draw and refine.** Establish the structure, insert real content, then calculate
   alignment, spacing, type, and connector routes. Review substantial structural
   choices before detailed polish. Preserve approved surroundings during local edits
   and save each reviewable result.
4. **Check and deliver.** Inspect the saved source and actual export at paper size.
   Update the intended manuscript figure when requested, then perform the affected
   manuscript checks required by that project. Update the brief current-state note
   and clean or archive no-longer-needed working material.

A small revision can start at the relevant stage. An audit reports findings without
making unrequested changes. Do not require users to fill out planning forms,
per-asset records, or repeated confirmations of decisions already established.

## Use tools and destinations in context

Use a suitable editable vector environment. When OpenPencil is selected, use the
available `open-pencil` skill or current tool documentation for operations; this
skill defines the figure workflow, not a duplicate application manual. Use the
available `imagegen` skill for a requested or appropriate concept sketch.

Use established source and export destinations and existing authorization. Ask
when the intended document, destination, or scientific choice remains ambiguous.
Keep raw materials, editable designs, and final manuscript figures in the locations
defined by the project; publishing and synchronization follow that project's rules.
