# Homepage Copy Review: Feature Introduction & Education

**Target Audience:** Developers, designers, and technical decision-makers evaluating design system tools  
**Review Date:** April 13, 2026  
**Reviewer Perspective:** Technical documentation and feature clarity  
**Status:** Updated to feature-introduction approach (v3)

---

## Update Notes (Version 3 - Feature-First Approach)

**Strategic Shift:** Moving from marketing/persuasion to feature introduction and technical education.

**New Philosophy:**
- **Explain capabilities clearly** rather than selling benefits
- **Show how things work** rather than why you should use them
- **Technical accuracy** over emotional appeal
- **Educational tone** like product documentation
- **Feature completeness** over conversion optimization

**Key Changes:**
1. Removed marketing tactics (urgency, social proof, competitive positioning)
2. Shifted from benefit-driven headlines to capability-focused headlines
3. Emphasized "what it does" and "how it works" over "what you get"
4. Kept technical examples and code snippets (they aid understanding)
5. Updated CTAs to navigation rather than conversion actions
6. Voice shifted from persuasive to explanatory

---

## Executive Summary

**Overall Assessment:** The homepage already leans toward feature explanation rather than hard selling. The recommended revisions will strengthen this educational approach while maintaining clarity and scanability.

**Current Strengths:**
- Technical credibility with code examples
- Clear module-based architecture
- Professional, informative tone
- Good use of specific examples

**Areas for Refinement:**
- Some headlines too abstract ("Enterprise-Grade," "Design for the Future")
- Could show more "how it works" detail
- Feature descriptions could be more specific about capabilities
- More technical precision would aid evaluation

**Philosophy:**
Treat the homepage as the introduction to a comprehensive technical guide. Users should leave understanding what Chassis does, how the pieces fit together, and whether it matches their use case.

---

## Section-by-Section Analysis

### 1. Hero Section

#### Current Copy:
```
Build Better Design Systems.
In Sync, At Scale.

Chassis is the backbone of scalable design systems built for complex, evolving product 
ecosystems. It unifies Figma components, advanced design tokens, multi-platform transformers, 
asset libraries, and a fully token-synced CSS framework — all working in harmony across 
brands, platforms, and products.
```

#### Analysis:
1. **Good:** Lists all five modules (comprehensive overview)
2. **Good:** Mentions multi-brand/multi-platform scope
3. **Could improve:** "Backbone" is metaphorical—more direct description would aid understanding
4. **Could improve:** "In harmony" is abstract—could specify the sync mechanism
5. **Overall:** Solid introduction, minor clarity improvements possible

#### Recommended Copy (Feature-Introduction Approach):
```
Build Design Systems That Scale & Sync.
Across Brands. Across Platforms.

Chassis is a complete design system foundation with five integrated modules: 
Figma component libraries, design tokens with multi-platform output, a token-synced 
CSS framework, an icon build system, and asset management tools. All modules share 
the same token source for automatic synchronization.
```

**Why This Works for Feature Introduction:**
- Explicitly names all five modules (helps users grasp the scope)
- Clarifies the integration mechanism (shared token source)
- Removes marketing language ("backbone," "in harmony")
- More technical precision ("multi-platform output" vs "transformers")
- Shows how pieces connect (sync via tokens)

**Alternative (more technical):**
```
Chassis: Integrated Design System Infrastructure

Five modules working from a single token source: Figma components, design tokens 
compiler, CSS framework generator, icon build pipeline, and asset distributor. 
Update tokens once—changes propagate to all modules automatically.
```

---

### 2. Chassis Tokens Section

#### Current Copy:
```
Module Title: Chassis Tokens
Headline: Enterprise-Grade Token Management

Chassis provides robust token architecture to manage themes, colors, spacing, and typography 
at scale. Define, transform, and sync tokens across mobile, web, embedded, and headless platforms.

Feature 1: Centralized token definitions
Create and manage design tokens directly in Figma using Variables. Sync changes automatically 
with your codebase.

Feature 2: Intelligent references
Build tokens that reference other tokens, enabling cascading updates across your entire system

Feature 3: Cross-platform transformation
Convert tokens automatically for different platforms while preserving relationships and hierarchy
```

#### Analysis:
1. **Needs work:** "Enterprise-Grade" is marketing fluff, not descriptive
2. **Good:** Mentions specific token types and platforms
3. **Could improve:** "Robust architecture" says nothing about how it works
4. **Good:** Feature 1 explains the Figma Variables integration clearly
5. **Could improve:** Feature 2 should emphasize multi-brand theming (key capability)
6. **Good:** Feature 3 explains transformation capability

#### Recommended Copy (Feature-Introduction Approach):
```
Module Title: Chassis Tokens
Headline: Design Tokens Compiler with Multi-Platform Output

Define design tokens in Figma Variables. Compile to platform-specific formats automatically. 
Support multiple brands and applications from a single token source.

Feature 1: Figma Variables as source of truth
Define tokens in Figma using Variables. Export to JSON. Token compiler reads structure 
and outputs code for all platforms.

Feature 2: Multi-brand theming system
Define core tokens plus brand-specific overrides. Generate separate theme outputs for 
each brand from shared token base.

Feature 3: Platform-specific transformation
Single token definition outputs to SwiftUI, Android XML, CSS variables, and Sass. 
Preserves token relationships and hierarchy across platforms.
```

**Why This Works for Feature Introduction:**
- Clearly states what it is (compiler, not vague "management")
- Describes the workflow: Figma → JSON → compiled output
- Feature 2 now explains theming capability (unique to Chassis)
- Removes marketing language, adds technical specifics
- Shows how the system works, not just what it does

---

### 3. Chassis Assets Section

#### Current Copy:
```
Module Title: Chassis Assets
Headline: Asset Management for Multi-Brand Design

Eliminate asset duplication and disorganization. Chassis lets you store, manage, and distribute 
icons, logos, fonts, and illustrations across brands and platforms with ease.

Feature 1: Store Files
Organize brand- and app-specific assets in structured, predictable folders.

Feature 2: Distribute Assets
Automatically generate platform-optimized assets with a single script.

Feature 3: Build Confidently
Build with assets that are clean, versioned, and deployment-ready.
```

#### Analysis:
1. **Good:** Clearly lists asset types (icons, logos, fonts, illustrations)
2. **Could improve:** "Eliminate duplication" is benefit-focused rather than descriptive
3. **Good:** Features follow logical workflow (organize → build → use)
4. **Could improve:** "With ease" is marketing filler
5. **Needs clarity:** What platforms? What formats?

#### Recommended Copy (Feature-Introduction Approach):
```
Module Title: Chassis Assets
Headline: Platform-Specific Asset Build Pipeline

Organize design assets in a structured folder system. Run the build command to generate 
platform-optimized outputs for iOS, Android, and web automatically.

Feature 1: Structured asset organization
Store brand and app assets in categorized folders (icons/, logos/, fonts/). Consistent 
naming and path structure for predictable file locations.

Feature 2: Automated platform builds
Single command generates iOS xcassets, Android drawables, and web-optimized files from 
source assets. Handles resizing and format conversion.

Feature 3: Versioned, deployment-ready output
Built assets include platform-specific metadata and optimization. Ready to commit directly 
to your codebase.
```

**Why This Works for Feature Introduction:**
- Describes what the asset pipeline does (build system, not vague "management")
- Specifies platforms and formats (iOS xcassets, Android drawables)
- Explains the workflow without selling benefits
- Removes marketing language ("eliminate," "with ease")
- Shows technical specifics (folder structure, build command)

---

### 4. Chassis Styles (CSS) Section

#### Current Copy:
```
Module Title: Chassis Styles
Headline: Code with tokens, not translation layers.

Design systems often require engineers to manually interpret design specs and translate them 
into CSS. That translation introduces errors and creates maintenance overhead. Chassis CSS 
generates its variables and utility classes directly from the token system, so design decisions 
arrive in code already implemented.

Feature 1: Token-generated CSS variables
Design tokens become CSS custom properties automatically. Change a token, and every component 
that uses it updates.

Feature 2: Perfectly align with Figma
Chassis CSS utility classes mirror Figma styles and variables for streamlined design to code 
implementation.

Feature 3: Faster frontend development
Stop re-implementing design decisions. Use a framework that already speaks your design system's 
language.
```

#### Analysis:
1. **Good headline:** Clear concept about direct token-to-CSS
2. **Too problem-focused:** Spends time explaining the pain rather than the solution
3. **Good:** Feature 1 clearly explains auto-generation
4. **Good concept:** Feature 2 about Figma alignment is valuable
5. **Could improve:** "Faster" is vague, "speaks your language" is metaphorical

#### Recommended Copy (Feature-Introduction Approach):
```
Module Title: Chassis Styles
Headline: Token-Generated CSS Framework

CSS custom properties and utility classes generated directly from design tokens. 
Update tokens, CSS rebuilds automatically with new values.

Feature 1: Auto-generated CSS variables
Token definitions compile to CSS custom properties. Token changes trigger CSS regeneration. 
All values stay in sync with token source.

Feature 2: Utility classes mirror Figma naming
CSS class names match Figma's Auto Layout properties and variable names. Designers and 
developers use the same terminology.

Feature 3: Token-aware component styles
Framework includes pre-built component patterns that reference tokens. Components adapt 
when token values change.
```

**Why This Works for Feature Introduction:**
- Describes the generation mechanism, not the problem it solves
- Specifies what gets generated (custom properties, utility classes)
- Explains the sync mechanism (tokens → compile → CSS)
- Feature 2 clarifies the Figma naming alignment
- Removes marketing language, adds technical accuracy

---

### 5. Chassis Icons Section

#### Current Copy:
```
Module Title: Chassis Icons
Headline: Icons that ship with your system.

Icon libraries tend to grow organically — different naming conventions, inconsistent sizing, 
no clear ownership. Chassis Icons gives you a structured way to create, name, and distribute 
icons that stay consistent across design tools and codebases.

Feature 1: Structured icon library
A clear system for organizing icons by category, size, and variant — so every icon has a 
predictable location and name.

Feature 2: Easy team distribution
Distribute icons as a versioned package. Every team gets the same set, with the same names, 
at the same version.

Feature 3: Design-to-code compatibility
Icons flow from design tools into code as optimized SVGs with consistent markup. No manual 
cleanup needed.
```

#### Analysis:
1. **Good:** Explains the organizational structure clearly
2. **Could improve:** "Tend to grow organically" is problem-focused
3. **Good:** Feature 1 explains the categorization system
4. **Could improve:** Feature 2 describes distribution but not the formats
5. **Good:** Feature 3 mentions the design-to-code flow
6. **Needs specifics:** What formats? What build outputs?

#### Recommended Copy (Feature-Introduction Approach):
```
Module Title: Chassis Icons
Headline: Icon Build System with Multi-Format Output

Organize SVG icons in a category-based structure. Build command generates icon fonts, 
SVG sprites, React components, and individual files from source SVGs.

Feature 1: Category-based icon organization
Store icons in folders by category (actions/, status/, navigation/). Enforced naming 
convention ensures consistency across design and code.

Feature 2: Multiple output formats from one source
Single build generates: icon fonts (WOFF2), SVG sprites, individual SVG files, and 
React/Vue components. All from the same source icons.

Feature 3: Figma to production pipeline
Export icons from Figma, run build script, commit generated files. Icon library stays 
in sync between design tool and codebase.
```

**Why This Works for Feature Introduction:**
- Describes the build system and its outputs
- Specifies formats (WOFF2, SVG sprites, React components)
- Explains the folder structure approach
- Shows the workflow (Figma → export → build → commit)
- Removes problem descriptions, focuses on capabilities

---

### 6. Chassis Figma Section

#### Current Copy:
```
Module Title: Chassis Tokens (ID conflict with Tokens section)
Headline: Design for the Future in Modularity

Chassis brings a modular, token-first approach to designing in Figma — built to scale and 
adapt over time. Every component is powered by tokens for color, spacing, typography, and 
sizing, ensuring future-proof flexibility across brands and platforms.

Feature 1: Token-driven components
Every color, spacing value, and type style in the library comes from the token system.

Feature 2: Consistent design language
Spacing, typography, and color scales match exactly across Figma and production code.

Feature 3: Scalable component architecture
Components are structured to support multiple brands and themes without duplicating designs.
```

#### Analysis:
1. **Issue:** Wrong section ID (should be "figma-section" not "tokens-section")
2. **Too vague:** "Design for the Future in Modularity" doesn't explain what it is
3. **Good:** Mentions token-powered components clearly
4. **Could improve:** "Future-proof flexibility" is marketing speak
5. **Good:** Feature 2 explains the Figma-code alignment
6. **Needs clarity:** How does multi-brand theming actually work?

#### Recommended Copy (Feature-Introduction Approach):
```
Module Title: Chassis Figma
Headline: Token-Powered Component Library for Figma

Component library built entirely with Figma Variables. Swap theme/brand by switching 
variable collections. All components adapt automatically.

Feature 1: Components reference tokens, not hard-coded values
Every component style property (color, spacing, typography) references a Figma Variable. 
No hard-coded hex values or fixed spacing.

Feature 2: Same token names in Figma and code
Variable names in Figma match token names in code output. Designers and developers 
reference identical token identifiers.

Feature 3: Multi-brand theming via variable collections
Create separate variable collections for each brand. Switch collection, all components 
retheme instantly. No component duplication needed.
```

**Why This Works for Feature Introduction:**
- Clearly states what it is (Figma component library)
- Explains the token mechanism (Variables, not hard-coded)
- Describes multi-brand approach (variable collections)
- Shows how theming works technically
- Removes marketing buzzwords ("future-proof," "scalable")

---

## Navigation & Documentation Links

### Current CTAs:
```
- "Go to Chassis Tokens"
- "Go to Chassis Assets"
- "Go to Chassis Styles"
- "Go to Chassis Icons"
- "Go to Chassis Figma"
- "View Documentation"
```

#### Analysis:
1. **Good for navigation:** Clear module names, straightforward language
2. **Appropriate tone:** Not selling, just directing to more information  
3. **Could improve:** Consider more specific preview of what's in each section
4. **Consistent pattern:** Same CTA style for all modules (good for predictability)

### Recommended Approach (Feature-Introduction):

Keep CTAs simple and navigational. These are educational signposts, not conversion tools.

**Module Section CTAs:**
- "View Tokens Documentation"
- "View Assets Documentation"  
- "View CSS Documentation"
- "View Icons Documentation"
- "View Figma Documentation"

**Or more specific:**
- "See Token Examples & API"
- "Browse Asset Pipeline Docs"
- "Explore CSS Framework"
- "View Icon Library"
- "Open Figma Components"

**Hero CTAs:**
- Primary: "Read Documentation"
- Secondary: "View on GitHub"

**Why This Works:**
- Clear expectations about what link leads to
- No pressure language ("Try," "Start," "Get")
- Appropriate for educational content
- Still actionable but informational

---

## Additional Content Recommendations

### 1. Architecture Overview
**Add a brief system diagram or explanation:**

**Simple explanation of how modules connect:**
```
How Chassis Modules Connect

Token Source (Figma Variables)
    ↓
Design Tokens Compiler
    ↓ ↓ ↓ ↓ ↓
    ↓ CSS Framework
    ↓ Figma Components  
    ↓ Icon Build System
    ↓ Asset Distributor
    
All modules reference the same token definitions for automatic sync.
```

**Placement:** After hero, before module sections  
**Purpose:** Help users understand the system architecture quickly

### 2. Technical Specifications
**Add quick-reference specs for evaluators:**

**Example placement:** Sidebar or footer section
```
Technical Overview

Token Formats: JSON, YAML
Output Platforms: iOS, Android, Web, React Native
CSS Approach: Utility-first + custom properties
Icon Formats: SVG sprite, icon fonts, React components
Browser Support: Modern browsers (last 2 versions)
License: MIT
Repository: GitHub (active development)
```

### 3. Use Case Scenarios
**Add concrete examples of who uses Chassis and how:**

```
Common Use Cases

Multi-Brand Products
- Maintain separate brand themes from shared component base
- White-label platforms with tenant-specific styling

Design System Teams
- Sync Figma component library with production code
- Automate token updates across platforms

Agency/Consultancy
- Reusable system across client projects
- Consistent workflow for different brands
```

**Purpose:** Help users self-identify if Chassis fits their needs

### 4. Getting Started Path
**Add clear next steps for different user types:**

```
Where to Start

Designers: Open the Figma library and explore token-powered components
Developers: Review token output formats and CSS framework docs
Teams: See the multi-brand theming example project
```

**Purpose:** Reduce friction for first-time exploration

---

## Voice & Tone Recommendations

### Current Tone:
- Mix of technical and business language
- Generally professional and informative
- Some marketing buzzwords ("enterprise-grade," "robust")
- Good use of specific examples

### Recommended Voice (Feature-Introduction):

**Attributes:**
- **Clear & Precise:** Explain what things are and how they work
- **Technically Accurate:** Use proper terminology, avoid metaphors
- **Educational:** Assume users are evaluating, not buying
- **Example-Driven:** Show concrete use cases and outputs
- **Neutral:** Informative without hype or selling

**Example Transformations:**

❌ **Marketing:** "Enterprise-Grade Token Management"  
✓ **Feature-Intro:** "Design Tokens Compiler with Multi-Platform Output"

❌ **Marketing:** "Eliminate asset duplication and disorganization"  
✓ **Feature-Intro:** "Centralized asset storage with automated platform-specific builds"

❌ **Marketing:** "Ship faster with automated workflows"  
✓ **Feature-Intro:** "Token changes compile to all platforms automatically"

❌ **Marketing:** "Built to scale and adapt over time"  
✓ **Feature-Intro:** "Supports multiple brands via theming system"

**Key Principles:**
1. **Describe, don't persuade** - State capabilities factually
2. **Show how, not why** - Explain mechanics before benefits  
3. **Be specific** - "Compile to SwiftUI" not "works everywhere"
4. **Use examples** - Code snippets, file formats, platform names
5. **Avoid superlatives** - No "best," "perfect," "revolutionary"

---

## Priority Improvements (Quick Wins)

### High Impact for Clarity:

1. **Replace Vague Headlines** (1 hour)
   - Change "Enterprise-Grade" to "Design Tokens Compiler"
   - Change "Design for the Future in Modularity" to "Token-Powered Figma Components"
   - Use descriptive technical terms instead of marketing phrases

2. **Add Technical Specifics** (1 hour)
   - List supported platforms explicitly (iOS, Android, Web, React Native)
   - Mention output formats (SwiftUI, XML, CSS, Sass)
   - Show token types (colors, spacing, typography, etc.)

3. **Clarify Feature Descriptions** (1.5 hours)
   - Add "how it works" details to each feature
   - Include workflow steps where appropriate
   - Specify file formats and tools used

4. **Update Navigation Labels** (30 min)
   - Make CTAs more descriptive ("View Token Documentation" vs "Go to Tokens")
   - Add context about what users will find

5. **Add Architecture Overview** (1 hour)
   - Simple diagram showing module connections
   - Explanation of shared token source
   - How sync mechanism works

**Total time for clarity improvements: ~4.5 hours**  
**Expected outcome: Better comprehension and faster evaluation**

---

## Conclusion

The current homepage already leans toward technical documentation rather than hard selling. The recommended revisions will strengthen this educational approach by adding more specificity, removing marketing language, and focusing on clear capability descriptions.

**What works well already:**
- Comprehensive module overview
- Technical examples and code snippets
- Professional, informative tone
- Clear structure with module-based sections

**What needs refinement:**
- **Replace buzzwords with technical terms:** "Enterprise-Grade" → "Design Tokens Compiler"
- **Add more specifics:** Platforms, file formats, supported tools
- **Clarify the "how":** Show workflow steps and architecture
- **Emphasize multi-brand theming:** Key differentiating capability

**What to avoid:**
- Marketing superlatives ("best," "perfect," "revolutionary")
- Urgency tactics or pressure language
- Benefit-driven headlines (shift to capability-driven)
- Conversion-focused CTAs

### Implementation Approach:

**Phase 1: Clarity Improvements** (2 hours)
- Replace vague headlines with descriptive technical terms
- Add platform/format specifications to each section
- Update CTAs to be more informative

**Phase 2: Architecture Context** (2 hours)
- Add simple diagram showing module relationships
- Explain shared token source concept
- Show how sync works across modules

**Phase 3: Technical Specifications** (30 min)
- Add supported platforms list
- Include output format details
- Link to technical documentation

**Target: Clear, accurate feature introduction that helps users evaluate fit.**

---

**Updated for feature-introduction approach: April 13, 2026**  
This review now focuses on educational clarity rather than conversion optimization.
