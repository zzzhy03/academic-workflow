---
name: academic-paper-writing
description: Draft, revise, or review research manuscripts and supplementary material based on supplied research, especially LaTeX papers. Use for scholarly wording, result-table updates, cross-section consistency, collaborative edits, and final PDF review or delivery. Figure construction and experiment implementation are separate tasks.
---

# Academic Paper Writing

Help produce a correct, clear, readable paper with coherent tables and page layout.
Use the supplied research, manuscript, and current project conventions. Preserve
scientific meaning and already-correct prose; make changes proportional to the
request.

The assistant performs the necessary checks during the work. Do not require the
user to fill out per-result forms, provenance cards, or parallel tracking tables.
Use existing files, logs, and conversation context. Ask only for missing information
or decisions that materially affect the result, and carry forward answers already
given.

## Read the relevant functional reference

- [Writing and consistency](references/writing-and-consistency.md): precise prose,
  main/supplement division, related-content checks, numbers, and readable tables.
- [Collaboration and build](references/collaboration-and-build.md): revision
  conventions, synchronization, conflict handling, working/final variants, and
  compilation.
- [Review and delivery](references/review-and-delivery.md): review of the visible
  manuscript, final layout, and delivery of the requested PDFs.

Read the parts relevant to the task. A small correction does not require a full
manuscript audit or a new project setup.

## Work in proportion to the request

1. **Understand the change.** Read enough surrounding text and project guidance to
   understand the intended meaning, manuscript version, and output. Distinguish a
   request for discussion or a draft from an instruction to edit files. Respect an
   established paragraph-by-paragraph review process without imposing it on every
   routine correction.
2. **Make the focused change.** Follow the manuscript's language and established
   terminology. Preserve unrelated collaborator edits and accurate, readable prose.
   Discuss genuine scientific ambiguities rather than choosing an interpretation
   just to make the sentence smoother.
3. **Check related content.** Follow the implications of the change through relevant
   definitions, numbers, tables, captions, and supplementary text. Inspect related
   locations without assuming that each must be rewritten.
4. **Build and inspect when files changed.** Use the project's required outputs and
   build process, then inspect affected PDF pages. For a review or chat-only draft,
   report the result without unnecessary source edits or builds.
5. **Report the result briefly.** State what changed and was checked, any specific
   unresolved issue, and relevant local/commit/synchronization status. Reuse a short
   existing project note only when unfinished work needs to survive the conversation.

## Keep the skill portable

Read paths, author identities, revision macros, branch policies, engines, and build
roots from the current project. Follow existing user authorization and repository
instructions for editing, commits, and external synchronization; these instructions
do not authorize publishing or contacting collaborators.

This skill covers captions, references, and placement of figures within the paper.
For changes inside an editable figure, use an appropriate figure-design workflow,
such as the available `academic-diagram-design` skill. Keep its asset and drawing
rules there rather than duplicating them here.
