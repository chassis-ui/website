# Documentation Style Guide

How to write the guides of chassis-ui.com: the pages under `/docs/`, in `packages/website/content/docs/**/*.mdx`. They cover Chassis as a whole, and each package documents itself on its own site. This guide follows the language and voice of the [chassis-ui/css guide](https://github.com/chassis-ui/css/blob/main/WRITING.md) and the [chassis-ui/tokens guide](https://github.com/chassis-ui/tokens/blob/main/WRITING.md), adapted to pages that span the packages.

**The guide is the reference, not the existing pages.** Don't copy a convention from a page because the page does it; check it here.

## How this guide is organized

- **Language (§1–6)** — voice, tone, vocabulary, code references in prose.
- **Accuracy (§7–9)** — one home per fact, names that must exist, counts, versions and the roadmap.
- **Structure (§10–13)** — what each page owns, frontmatter, section order per doc type, headings.
- **Components and conventions (§14–18)** — tables, callouts, link lists, troubleshooting entries, cross-references.
- **Code blocks and doc length (§19–22)** — language tags, commands, when to split a doc.
- **Lint checklist** — what to verify before opening a PR.
- **Appendix A** — MDX component reference.

The language and accuracy rules also apply to the repository docs (`README.md`, `CONTRIBUTING.md`, `ref/`) and to changelog entries. The structure rules are for the docs pages only. The home page, the package home pages and the blog are not docs: they are written as marketing copy and articles, and this guide does not cover them.

---

## Language

### 1. Voice by doc type

The right prose voice depends on the doc category. There are two conventions, and mixing them produces prose that either feels like a marketing page or sounds robotic.

| Doc type                                  | Voice       | Second-person `you/your` | First-person `we/our` |
| ----------------------------------------- | ----------- | ------------------------ | --------------------- |
| Getting Started (`getting-started/*.mdx`) | Tutorial    | ✓ Appropriate            | ✗ Avoid               |
| Guides (`guides/*.mdx`)                   | Tutorial    | ✓ Appropriate            | ✗ Avoid               |
| Reference (`reference/*.mdx`)             | Instructive | ✗ Avoid                  | ✗ Avoid               |

**Tutorial voice** allows "you" and "your": they read naturally where the reader chooses a package, runs a command or adds a brand. A table or a list inside a guide still reads better without a pronoun.

**Good:** "Start here when you own the files of a brand: its logos, images and fonts."

**Bad (still avoid in a guide):** "We've now built the tokens. Our next step is to add the fonts."

**Instructive voice** avoids `you`, `your`, `we`, `our` and `us` in prose. The reader consults a reference page to find a name or a configuration, not to follow a procedure. Imperative ("Add the server to `.mcp.json`") and descriptive ("The server keeps no session") are both instructive voice, and a paragraph usually mixes them.

**Good:** "Add the server to `.cursor/mcp.json`. The server needs no key."

**Bad:** "You can add our server to your `.cursor/mcp.json`."

**First-person plural is discouraged in every doc type.** "We" implies a narrator who is neither the project nor the reader. Name the actor: Chassis, the package, the build, the agent, the reader.

### 2. Every heading earns its paragraph

Every `##`, `###` and `####` heading is followed by at least one sentence before any code block, table, list or sub-heading. The sentence says what the section is about and when to reach for it. One full sentence is enough; don't pad.

**Exception:** `## Prerequisites`, `## Troubleshooting` and `## Next steps` may go directly into their entries. Their names say what follows.

**Anti-pattern: container phrases.** "The following table lists…" and "Below is…" announce content without describing it. State what the content does. **Bad:** "The following table lists the skills." **Good:** "Each skill covers one kind of work." A sentence that ends in a colon before a list is fine.

**Anti-pattern: label paragraphs.** A bold label on its own line (`**How it works:**`) is a heading in disguise. Make it a heading with an intro sentence, or fold it into the paragraph.

### 3. Describe behavior, not benefits

Documentation says what Chassis is and what a command does; it does not sell Chassis. The home page does that. Skip "comprehensive", "powerful", "seamless", "production-ready" and "enterprise-grade": state the behavior.

**Good:** "A brand overrides only the tokens that differ, and every other token keeps its default."

**Bad:** "Our powerful multi-brand architecture enables seamless theming at scale."

**Exception:** the frontmatter `description` may hold a light positioning phrase, under 160 characters and free of superlatives.

**Generic advice is not documentation.** A sentence that is true of any design system ("keep your brands consistent") says nothing about Chassis. Keep a guideline only when it names a package, a command, a file or a token.

### 4. Active voice over passive where natural

Prefer active voice with the actor named: the build, the command, the package, the agent, the designer. Passive is fine when the actor is unknown or unimportant.

**Good:** "`chassis-tokens init` writes a repository of tokens into a new folder."

**Bad (when avoidable):** "A repository of tokens is written into a new folder when the command is run."

### 5. Vocabulary

Chassis has one word for each concept. A synonym makes the reader wonder whether it is a second concept. The words are those of the package docs, so that a reader who follows a link finds the same ones.

| Use                   | For                                                                                                                           | Not                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Chassis               | The whole: the packages and what they build                                                                                   | Chassis UI (the name of the organization only) |
| package               | One of Tokens, Figma, CSS, React, Assets and Icons                                                                            | project, module, library, tool                 |
| builder               | A package that holds a build and no files of a brand: Tokens, Assets, Icons                                                   | generator, pipeline, CLI                       |
| repository of tokens  | The repository that `chassis-tokens init` writes. Also: of assets, of icons                                                   | token repo, token project, token library       |
| the tokens of Chassis | `chassis-ui/website-tokens`, the repository of tokens of the Chassis sites. Also: the icons of Chassis, the assets of Chassis | the default tokens, the Chassis theme          |
| the build             | What a builder runs on a repository                                                                                           | the pipeline, the script, the generator        |
| brand                 | An option of the `brand` group of the tokens, and its folder in a repository of assets                                        | tenant, white-label, product                   |
| app                   | An option of the `app` group, and its folder in a repository of assets                                                        | application (except in page titles), project   |
| theme                 | An option of the `theme` group: light or dark                                                                                 | mode, color mode, color scheme                 |
| platform              | A build target: the web, iOS, Android                                                                                         | target, output                                 |
| the library           | The Chassis component library in Figma                                                                                        | the Figma kit, the UI kit                      |
| skill                 | The instructions an agent follows for one kind of work                                                                        | prompt, recipe, workflow                       |
| the MCP server        | The server at `mcp.chassis-ui.com`                                                                                            | the Chassis API, the MCP                       |
| agent                 | The AI that runs a skill                                                                                                      | assistant, bot, model, AI                      |

The home page says "color mode" and "dark mode", which is the reader's word before they meet the tokens. In the docs the word is **theme**, as in the tokens.

Figma has its own terms: a **Variable**, a **Collection**, a **Mode**. Use them capitalized, and only for Figma.

Product names keep their spelling: Chassis Tokens, Chassis Figma, Chassis CSS, Chassis React, Chassis Assets, Chassis Icons, Chassis MCP, Tokens Studio, Style Dictionary, Figma, Figma Community, React Aria, Tailwind CSS, Node.js, npm, pnpm, Claude Code, Cursor, VS Code, GitHub, Git LFS. Name a package in full the first time on a page ("Chassis Tokens"), then by its short name ("Tokens") where the sentence stays clear.

Write in American English (`color`, `behavior`, `customize`, `license`), the spelling of the token names and of the package docs.

### 6. Code references in prose

Backtick every code reference: a package (`@chassis-ui/tokens`), a command in full (`npx @chassis-ui/tokens init acme-tokens`), a file path, a configuration key as a path (`chassis.build`), a token, a class, a tool or a skill name.

**Placeholders** go in angle brackets, lowercase: `source/<brand>/`, `<version>`. The brand of an example is `acme` and its folders are `acme-tokens`, `acme-assets` and `acme-icons`, as in the package docs. No file names a real brand other than `chassis`.

**Repositories** are named `chassis-ui/<repo>`, never by a local folder or a relative path.

**Interface labels** of Figma, Tokens Studio and an editor are bold, not code: **Skills → Add skill**.

A token, a class or a file is named in the form of the package that owns it. Copy the name from that package's docs; don't write it from memory.

---

## Accuracy

### 7. One home per fact

The website docs cover what spans the packages: what Chassis is, how the packages connect, where to start, and work that crosses several of them, such as adding a brand. Everything about one package lives in the docs of that package.

**A fact has one home.** State it on the page that owns it ([§10](#10-what-each-page-owns)), and link to that page from everywhere else. A page of the website docs does not restate a package's installation steps, options, file names or requirements; it names the step in a sentence and links to the page that has it.

Three tests before writing a sentence:

- **Would it need an edit when one package releases?** Then it belongs in that package's docs. Link it.
- **Is it already on another page of these docs?** Then link that page. Don't write it a second time in other words.
- **Is it a list of the packages?** The packages are described once, in the Introduction. The Overview lists the documentation of each, and no other page lists them.

**Good:** "Chassis CSS ships compiled CSS and its Sass source. Its [installation guide](/css/docs/getting-started/installation/) covers both."

**Bad:** two screens of the Sass load paths, the PostCSS prefix and the CDN links, copied from the Chassis CSS docs and one release behind them.

A summary is allowed where the reader needs it to choose: one sentence about what a package is for, before the link. A procedure is not.

### 8. Names are facts

Every package name, command, option, file path, URL, tool name and page title in a doc must exist as written. Before adding one, find it in the README or the docs of the repository that owns it:

```bash
grep -rn "chassis-assets verify" README.md packages/site/content/docs
```

A link to a page of a package's docs names a page that exists in that package's sidebar. A linked page is called by its title ("[Library Setup](/figma/docs/getting-started/library-setup/) of Chassis Figma").

**Values stay out.** A color, a font family, a size or a contrast ratio belongs to one brand and changes with its next release. Say what a brand changes ("its colors, its typefaces and its corner radii"), not what it changes them to.

**A capability is stated as the package states it.** Don't infer one. If the README of a package does not say that it does something, the docs here don't say it either.

### 9. Counts, versions and the roadmap

A doc that states a number makes a promise that the next release can break.

**Counts.** Don't count components, tokens, icons, skills or tools; name them or their kind. The packages may be counted, since a new one is a change to these docs anyway.

**Versions.** A version requirement of a package is that package's fact ([§7](#7-one-home-per-fact)): link its docs. The requirement that every builder shares is stated once, in `## Prerequisites` of the Installation page, as "Node.js 22.12 or later", never as "the latest". No doc holds a version number of a Chassis package or a CDN link with one.

**Roadmap.** A planned feature is named as planned, or not at all. No doc describes one as if it existed.

---

## Structure

### 10. What each page owns

Each page owns a set of facts, and the sidebar (`packages/website/data/sidebar.yml`) follows the order in which a reader meets them.

| Page                               | Owns                                                                                                 | Does not hold                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `getting-started/overview.mdx`     | The index: a link to every guide and to the documentation of each package                            | Prose about a package, steps                     |
| `getting-started/introduction.mdx` | What Chassis is, what each package is, how the packages connect, their repositories and npm packages | Commands, steps                                  |
| `getting-started/installation.mdx` | Where to start, and the first command of each start                                                  | What a package is, the steps after the first one |
| `getting-started/support.mdx`      | How to follow the project, report a problem, report a vulnerability and contribute                   | Lists of packages                                |
| `guides/add-a-brand.mdx`           | The steps that add a brand across the tokens, the assets and Figma                                   | The file formats of each package                 |
| `guides/ai-agents.mdx`             | What an agent can do with the skills, and how to set one up and ask for the work                     | The configuration of each client                 |
| `reference/chassis-mcp.mdx`        | The MCP server: how a client connects, and what the server serves                                    | What an agent does with a skill                  |

A new page states what it owns in this table before it is written. If the table can't say it in one line, the page is two pages or belongs in a package's docs.

### 11. Frontmatter

Every doc starts with YAML frontmatter. Required fields:

```yaml
---
title: Add a Brand
description: One-sentence summary, under 160 characters.
toc: true
---
```

Optional fields:

| Field      | Values                               | Effect                                                               |
| ---------- | ------------------------------------ | -------------------------------------------------------------------- |
| `aliases`  | A path or a list of paths            | Redirects an old URL to the page. Add one when a page moves.         |
| `sections` | List of `{title, description, slug}` | Renders the first link list of the Overview. Used by that page only. |

`description` starts with what the page covers, not with "A guide to" or "Learn how to".

**Titles.** Page titles are in title case, as in the package docs, because the sidebar finds a page by the slug of its sidebar title: the entry `Add a Brand` loads `add-a-brand.mdx` in the folder named by the slug of its group. A new page needs a sidebar entry whose slug is its file name. The frontmatter title may be longer than the sidebar title: the Introduction is titled `Welcome to Chassis`, as the introductions of the package docs are, so that its first heading does not repeat its title.

### 12. Standard section order

Each doc type has a section order. Skip a section that doesn't apply; don't reorder them.

**The index** (`getting-started/overview.mdx`) has no prose of its own beyond one sentence per section. It holds link lists only ([§16](#16-link-lists)).

**Concept pages** (`getting-started/introduction.mdx`) explain, and hold no steps:

```text
## Introduction     (what the subject is, in two or three paragraphs)
## <one ## per concept, named after it>
## Next steps       (always last)
```

**Guides** (`getting-started/installation.mdx`, `guides/*.mdx`) follow the order in which the reader does the work:

```text
## Introduction     (what the guide gets the reader to, and who it is for)
## Prerequisites    (what must exist first, as a list)
## <one ## per step, named with a verb>
## Troubleshooting  (see §17; only for failures that have happened)
## Next steps       (always last)
```

**Reference pages** (`reference/*.mdx`) are scanned, not read:

```text
## Introduction     (what the thing is, and its address)
## <one ## per thing a reader looks up>
## Next steps       (always last)
```

**Canonical section names.** Use `## Introduction`, `## Prerequisites`, `## Troubleshooting` and `## Next steps`. Not "Overview", "Requirements", "What you need", "See also" or "Related".

`## Next steps` is a list of links, each with what the reader finds there. It is the only place where a page sends the reader on; don't end a section with "continue with…".

### 13. Headings

**Hierarchy.** Don't skip levels: `##` → `###` → `####`. Three levels of nesting usually mean a section that wants its own page.

**Length.** Keep `##` and `###` headings under about 25 characters. The table of contents is narrow, and a longer heading wraps.

**Sentence case, no trailing punctuation.** Capitalize the first word and proper nouns only: `## Add the token set`, `### Claude Code`. Write "and", not `&`.

**Verbs for steps, nouns for things.** A step of a guide starts with a verb (`## Export to Figma`). A section of a concept or a reference page is a noun (`## Tools`).

**Code in headings.** A heading that names code keeps its spelling without backticks, so the anchor stays readable.

---

## Components and conventions

### 14. Tables

Every table is wrapped in `<CxTable>`, with no blank line between a tag and the table. Use a table for things with the same properties: packages with their repositories, skills with what they do, tools with what they return. Use a list for steps and for things with one property.

Name the columns after what they hold. A cell is a phrase without a trailing period, or one or two full sentences with the period left off the last. A column that says the same in every row moves into the sentence before the table.

### 15. Callouts

Use `<Callout>` for an aside that interrupts the reading flow and is important enough to highlight.

- **`<Callout type="info">`** — helpful and non-essential: an alternative, a related page.
- **`<Callout type="warning">`** — a real gotcha: a step that cannot be undone, a file that must not be committed, a command that publishes.

A callout has no `title`. When it needs a lead-in, start its body with a bold phrase. What every reader needs is prose, not a callout. No emoji, in headings, prose or callouts.

### 16. Link lists

The Overview lists pages as a grid of links, each a title and one sentence. The first list comes from `sections` of the frontmatter, for the pages of its own folder. A list of pages elsewhere is written in the body with the same markup, from an exported array:

```mdx
export const guides = [
  {
    title: 'Add a Brand',
    href: '/docs/guides/add-a-brand/',
    description: 'The steps that add a brand to the tokens, the assets and Figma.'
  }
]

<div class="grid grid-cols-1 md:grid-cols-2 gap-xl">
  {guides.map((item) => (
    <div>
      <a class="d-block text-decoration-none" href={item.href}>
        <strong class="d-block font-h5 mb-2xs">{item.title}</strong>
        <span class="fg-subtle">{item.description}</span>
      </a>
    </div>
  ))}
</div>
```

The description of a page in a list is the `description` of its frontmatter, or a shorter form of it. The description of a package's documentation says what that documentation covers, not what the package is: that is the Introduction's.

Link lists are for the Overview. Other pages link in prose and in `## Next steps`.

### 17. Troubleshooting entries

Each entry of `## Troubleshooting` is a `###` heading that names the symptom in a few words, followed by the exact message in backticks, the cause, and the fix in imperative voice. Quote the message as the tool prints it, so that a search for the error finds the page.

Add an entry for a failure that a reader has met. Don't invent one to fill the section, and leave the section out when there is none.

### 18. Cross-references

**Within these docs.** Use the `[[docsref:/path/to/doc]]` token inside Markdown link syntax, with an optional heading slug:

```mdx
[Add a Brand]([[docsref:/guides/add-a-brand]])
[the skills]([[docsref:/guides/ai-agents#run-a-skill]])
```

**Within the same doc.** Use a plain `#anchor`. Re-verify the anchors after renaming a heading.

**The docs of a package.** Use a root-relative link to the page, and name the page by its title and the package: `[Font Assets](/assets/docs/asset-types/fonts/) of Chassis Assets`. Link the page that holds the fact, not the home page of the package. A link list on the Overview links the root of a package's docs (`/tokens/docs/`).

**Configuration values.** `[[config:<key>]]` prints a value of `packages/website/config.yml`: `[[config:repo]]`, `[[config:figmaHandle]]`.

**Repositories.** Link a repository on GitHub by its name: `[chassis-ui/tokens](https://github.com/chassis-ui/tokens)`.

**External references.** Standard Markdown links, to the official docs of the tool.

**Link text** is the title of the page or the name of the thing. Not "here", "this page" or "read more".

---

## Code blocks and doc length

### 19. Fenced code language tags

Always tag a fenced code block with its language; an untagged block has no highlighting.

| Block kind           | Language tag             | Notes                                        |
| -------------------- | ------------------------ | -------------------------------------------- |
| Shell commands       | ` ```bash `              | No `$` prompt, no comments that name a tool. |
| Configuration        | ` ```json `              | `.mcp.json`, `package.json`.                 |
| Markup               | ` ```html `              |                                              |
| Stylesheets          | ` ```scss ` / ` ```css ` |                                              |
| Commands of an agent | ` ```text `              | Slash commands of Claude Code, and prompts.  |
| Directory trees      | ` ```text `              | Anything that is not code.                   |
| MDX                  | ` ```mdx `               | When this guide shows authoring patterns.    |

### 20. Commands

A command is one the reader can paste and run.

- **One command per block** when the reader runs them one at a time and reads the result of each. Commands that always run together share a block.
- **One block per package manager.** Don't put `# pnpm` and `# npm` in one block. Show npm (`npm install`, `npx`), which every reader has; add a block for another package manager only where its command differs in more than the name.
- **Say where it runs** in the sentence before the block: "In the repository of tokens:".
- **Say what it writes** in the sentence after the block, when it writes files.
- **A command of a package is that package's fact** ([§7](#7-one-home-per-fact)). These docs show the first command of a start and the commands of a cross-package procedure, and link the rest.

### 21. Inline code vs code blocks

Use inline backticks for a single name, path or short value. Use a fenced block for anything that spans lines, and for a single line that the reader copies and runs.

### 22. Document length and splitting

These pages are short on purpose: most of what a reader needs is in the docs of a package. A page that grows past about 200 lines of MDX is usually restating a package ([§7](#7-one-home-per-fact)); cut and link before splitting. Split a page when it owns two sets of facts ([§10](#10-what-each-page-owns)).

---

## Lint checklist

Before opening a PR with a doc change, verify:

- [ ] **Voice ([§1](#1-voice-by-doc-type)):** no "we", "us" or "our" on any page, and no "you" or "your" on a reference page. Quick check: `grep -niE "\b(we|our|ours|us)\b" <file>`.
- [ ] Every `##`/`###`/`####` heading has a sentence before the next block ([§2](#2-every-heading-earns-its-paragraph)).
- [ ] No container phrases and no bold label paragraphs ([§2](#2-every-heading-earns-its-paragraph)).
- [ ] No marketing adjectives and no generic advice ([§3](#3-describe-behavior-not-benefits)).
- [ ] Vocabulary: package, builder, repository of tokens, brand, app, theme, platform, the library, skill, agent ([§5](#5-vocabulary)).
- [ ] Every code reference is in backticks, placeholders use angle brackets, and the brand of an example is `acme` ([§6](#6-code-references-in-prose)).
- [ ] No fact of one package is restated, no fact is on two pages, and no page but the Introduction describes the packages ([§7](#7-one-home-per-fact)).
- [ ] Every name, command, path and linked page exists as written, checked in the repository that owns it ([§8](#8-names-are-facts)).
- [ ] No values of a brand, no counts but that of the packages, and no version of a Chassis package ([§8](#8-names-are-facts), [§9](#9-counts-versions-and-the-roadmap)).
- [ ] The page is in the table of [§10](#10-what-each-page-owns), and holds only what the table gives it.
- [ ] The title is in title case, the `description` is under 160 characters, and the page has a sidebar entry whose slug is its file name ([§11](#11-frontmatter)).
- [ ] The section order matches the doc type, with `## Introduction` first and `## Next steps` last ([§12](#12-standard-section-order)).
- [ ] Headings don't skip a level, are under about 25 characters, in sentence case, and steps start with a verb ([§13](#13-headings)).
- [ ] Every table is wrapped in `<CxTable>` ([§14](#14-tables)).
- [ ] Callouts have no `title`, and there is no emoji ([§15](#15-callouts)).
- [ ] Internal links use `[[docsref:/...]]`, and a link to a package names the page and the package ([§18](#18-cross-references)).
- [ ] Every fenced code block has a language tag, and shell blocks are `bash` ([§19](#19-fenced-code-language-tags)).
- [ ] One block per package manager, and each command says where it runs ([§20](#20-commands)).
- [ ] `pnpm lint`, `pnpm check` and `pnpm build` pass.

---

## What's not in this guide (yet)

These conventions haven't been formalized here. To propose one: write the section, apply it to at least one doc in the same PR as evidence, and open an issue first when it is contested.

Currently unwritten:

- Screenshots and diagrams: when to embed one, its alt text, and where its source lives.
- Pages for one platform across the packages (iOS, Android), which no page owns today.
- Conventions for the blog and for the copy of the home pages.

---

## Appendix A — MDX component reference

The docs use two MDX components and two text tokens. The components come from [`@chassis-ui/docs`](https://www.npmjs.com/package/@chassis-ui/docs) and are imported automatically; a doc needs no `import` line for them.

### `<CxTable>`

Wraps a Markdown table in a scroll container and gives the table its styling. Use it for every table ([§14](#14-tables)).

### `<Callout>`

A highlighted aside. See [§15](#15-callouts) for when to use each type.

| Prop     | Type                              | Default  | Purpose           |
| -------- | --------------------------------- | -------- | ----------------- |
| `type`   | `'info' \| 'warning' \| 'danger'` | `'info'` | Visual treatment. |
| _(slot)_ | MDX content                       | —        | The body.         |

### Text tokens

Replaced at build time in prose, link targets, code blocks and frontmatter.

| Token                 | Replaced with                                                   | Example                           |
| --------------------- | --------------------------------------------------------------- | --------------------------------- |
| `[[docsref:/<path>]]` | The URL of a doc of this site, with an optional `#anchor`       | `[[docsref:/guides/add-a-brand]]` |
| `[[config:<key>]]`    | A value of `packages/website/config.yml`; nested keys with dots | `[[config:repo]]`                 |

### Other components

`@chassis-ui/docs` also provides `<Example>`, `<ResizableExample>`, `<ScssDocs>`, `<JsDocs>`, `<AddedIn>`, `<DeprecatedIn>` and `<InFigma>`, which the Chassis CSS docs use. These docs don't use them: an example of a component belongs in the docs of the package that has the component.
