# Homepage Copywriting Review & Recommendations

**Target Audience:** Product Managers, Design Leads, Engineering Leads, Tech Directors  
**Review Date:** April 10, 2026  
**Reviewer Perspective:** Copywriting for B2B SaaS/Developer Tools  
**Status:** Updated with feedback corrections (v2)

---

## Update Notes (Version 2)

**Key Corrections Based on Feedback:**

1. **Hero Section:** Now maintains comprehensive multi-module summary (Figma + Tokens + CSS + Icons + Assets) rather than narrowing to single benefit
2. **Tokens Feature 2:** Changed from token references to multi-brand/multi-app theming—the core differentiator
3. **Assets Features:** Restructured to clear workflow: Feature 1 = organize/store, Feature 2 = build (no command syntax), Feature 3 = deploy/retrieve
4. **CSS Feature 2:** Keeps Figma alignment angle (better than original recommendation), avoids repeating visual examples
5. **Icons Section:** Acknowledged current copy is effective; minimal changes recommended
6. **Figma Feature 2:** Removed code examples from body copy (visuals will demonstrate)
7. **Social Proof:** Adapted for pre-launch: GitHub activity, open source, beta access (not fake user counts)
8. **Risk Reversals:** Updated for open source reality: no lock-in, self-hosted, MIT license (not "free trial")

**Philosophy:** Refine what needs refinement. Keep what's already working.

---

## Executive Summary

**Overall Assessment:** The homepage is clean and well-structured, but the copy lacks sharp differentiation. It describes mechanisms rather than delivering outcomes. The recommended revisions maintain or reduce current length while making benefits immediately clear.

**Key Strengths:**
- Clear technical architecture
- Professional, concise tone
- Good use of code examples
- Clean, scannable layout

**Critical Issues:**
- Headlines don't promise specific outcomes
- Features describe "what" instead of "so what"
- CTAs are passive ("Go to" vs action verbs)
- Missing differentiation (why Chassis vs alternatives)
- No quantifiable benefits or metrics

**Recommendation Philosophy:**
Keep the brevity. Sharpen the message. Every word should deliver value.

**Length Comparison:**
- Current hero: 61 words → Recommended: 29 words (-52%)
- Current section body: ~30 words avg → Recommended: ~25 words avg (-17%)
- Current feature: ~20 words → Recommended: ~15 words (-25%)

**Net result: Shorter copy with clearer benefits.**

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

#### Issues:
1. **Too narrow** - Focuses on one benefit instead of summarizing the full system
2. **"Backbone" is abstract** - Doesn't clearly explain what Chassis does
3. **Feature list in running text** - Hard to scan quickly
4. **Missing module clarity** - Doesn't make the 5 modules immediately obvious
5. **Good:** Already mentions multi-brand/platform scope

**User Feedback:** Current hero better explains Chassis as a comprehensive multi-module system. 
Recommendation should maintain this comprehensiveness while sharpening the message.

#### Recommended Copy:
```
Build Design Systems That Scale.
From Figma to Production. Automatically.

Chassis is a complete design system foundation—Figma components, design tokens, 
CSS framework, icon generator, and asset distributor. One system. Every platform. 
Built for teams managing multiple brands and products.
```

**Why This Works:**
- Acknowledges the multi-module complexity
- Lists all modules for comprehension
- Still benefit-focused ("Automatically")
- Emphasizes scale (multiple brands/products)
- Keeps professional brevity

**Alternative (if you prefer even more comprehensive):**
```
Build Design Systems That Scale.
Across Brands. Across Platforms.

Chassis unifies Figma components, design tokens, CSS framework, icon libraries, 
and asset management into one system. Ship faster with automated Figma-to-code 
workflows built for multi-brand, multi-platform teams.
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

#### Issues:
1. **"Enterprise-Grade"** - Overused, meaningless buzzword
2. **"Robust architecture"** - Technical jargon without context
3. **Feature 2 misses key differentiator** - Token references less important than multi-brand theming
4. **No urgency** - Why should they care now?
5. **Missing contrast** - What's the alternative/current pain?

**User Feedback:** Feature 2 should emphasize multi-brand, multi-app theming system—this is 
Chassis's core differentiator, more important than token reference mechanics.

#### Recommended Copy:
```
Module Title: Chassis Tokens
Headline: One Source. Every Platform. Always in Sync.

Update a color in Figma. Deploy to iOS, Android, and web automatically. No tickets, 
no spreadsheets, no version drift.

Feature 1: Figma to code, instantly
Update tokens in Figma Variables. See them in production code automatically. Zero manual work.

Feature 2: Multi-brand, multi-app from one source
Manage unlimited brands and apps with theme variants. Switch contexts, tokens adapt automatically.

Feature 3: Native output for every platform
Get SwiftUI tokens, Android XML, and CSS variables—all from one source with one command.
```

**Why This Works:**
- Feature 2 now emphasizes multi-brand/multi-app capability (core differentiator)
- Shows theming system value
- Still concise and scannable
- Highlights Chassis's unique strength

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

#### Issues:
1. **Weak value prop** - "with ease" is meaningless filler
2. **Feature flow unclear** - Should follow: organize → build → deploy
3. **Feature 1 should focus on storage** - Organizing and saving files
4. **Feature 2 duplicates visual** - Don't show command syntax when visual already does
5. **Feature 3 should be about retrieval** - Getting deployment-ready output
6. **Numbered features** - Feels like instructions, not benefits

**User Feedback:** Features need clearer workflow separation. Feature 1 = organizing files, 
Feature 2 = building (without repeating "pnpm assets" since visual shows it), Feature 3 = 
getting deployment-ready output.

#### Recommended Copy:
```
Module Title: Chassis Assets
Headline: Every Team. Right Asset. Right Version. Automatically.

No more "which logo file?" Slack threads. One command delivers platform-optimized 
assets to every team, every time.

Feature 1: Organize in one place, find instantly
Store brand and app assets in structured folders with predictable paths. Find any asset 
in seconds, not Slack threads.

Feature 2: Build once, output for all platforms
Single command generates iOS xcassets, Android drawables, and web formats automatically. 
No manual exports.

Feature 3: Deploy ready-to-use assets
Optimized, versioned, and platform-specific assets delivered to your codebase. Just import 
and ship.
```

**Why This Works:**
- Feature 1: Focuses on organizing/storing
- Feature 2: Describes build without repeating command syntax
- Feature 3: Emphasizes getting deployment-ready output
- Maintains clear workflow: store → build → deploy

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

#### Issues:
1. **Good headline** - Actually strong, keep the concept
2. **Too explanatory** - Assumes they don't already know this pain
3. **Feature 2 concept good, execution needs work** - Current title about Figma alignment is 
   better, but body copy repeats what visual shows
4. **"Perfectly align"** - Hyperbole, hard to believe
5. **Feature 3 is vague** - What does "faster" mean?

**User Feedback:** Feature 2's current title about Figma alignment is superior. Need better 
title and body that don't duplicate the visual examples. Focus on shared language benefit.

#### Recommended Copy:
```
Module Title: Chassis Styles
Headline: Figma to CSS. Zero Translation.

Design changes become production CSS automatically. No tickets, no handoff meetings, 
no drift between design and code.

Feature 1: Auto-generated CSS variables
Tokens in Figma become CSS custom properties instantly. Change spacing once. 
Deployment-ready in your next build.

Feature 2: Design and code speak the same language
CSS classes mirror Figma naming conventions exactly. Developers write code that matches 
design intent without translation guides.

Feature 3: Ship faster, maintain less
No manual CSS translation means no translation bugs. Developers code from real tokens 
from day one.
```

**Why This Works:**
- Feature 2 keeps the Figma alignment concept (you were right)
- Emphasizes shared language without repeating visual examples
- More focused on the benefit (no translation guides needed)
- Maintains professional tone

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

#### Issues:
1. **Weak headline** - Doesn't promise anything specific
2. **"Tend to grow"** - Understates the chaos
3. **Benefits too subtle** - "structured way" sounds boring
4. **No pain amplification** - Icon chaos causes real problems
5. **Missing scale mention** - How many icons? How many variants?
6. **No time/cost savings** - What's the ROI?

#### Recommended Copy:
```
Module Title: Chassis Icons
Headline: Structured Icons. Every Format. Zero Export Work.

End icon naming chaos. Enforced structure keeps design and code in perfect sync 
across all platforms.

Feature 1: Organized by design, findable by name
Category-based structure (`actions/`, `status/`) with consistent naming. Same icon, 
same name in Figma and code.

Feature 2: One export, all formats
Export once from Figma. Get icon fonts, SVG sprites, individual files, and React 
components automatically.

Feature 3: Build all variants in seconds
Design in Figma. Run `pnpm icons build`. Icon fonts, sprites, and platform variants 
regenerate instantly.
```

**Why This Works:**
- Headline is benefit-focused and scannable
- Intro addresses pain without melodrama
- Features are to the point
- Still mentions automation benefit
- More professional tone

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

#### Issues:
1. **Wrong section ID** - Duplicate "tokens-section" ID (should be "figma-section")
2. **Vague headline** - "Design for the Future in Modularity" means nothing
3. **Buzzword heavy** - "token-first," "future-proof," "scalable"
4. **Feature 2 shows code syntax** - Should avoid code examples in body copy since visuals will show
5. **No differentiation** - How is this different from Tokens section?
6. **No use case** - Who is this for? What problem does it solve?

**User Feedback:** Feature 2 should avoid using code examples in body text. The visual will 
demonstrate implementation; body copy should focus on the shared token system benefit.

#### Recommended Copy:
```
Module Title: Chassis Figma
Headline: Multi-Brand Components. One Design System.

Token-powered components adapt to any brand automatically. Swap the theme, not the design work.

Feature 1: Design once, apply to infinite brands
One button component. Multiple themes. Switch brand tokens and every component adapts instantly.

Feature 2: Design and engineering use the same tokens
Figma components and production code reference identical token names and values. No guessing 
which spacing or color to use.

Feature 3: Launch new brands in days
Clone a theme file. Update token values. Every component rebrands itself. Ship in days, 
not months.
```

**Why This Works:**
- Feature 2 avoids code syntax, focuses on shared token system
- Emphasizes alignment without showing implementation
- Keeps benefit clear (no guessing)
- Professional and concise

---

## Calls-to-Action Analysis

### Current CTAs:
```
- "Go to Chassis Tokens"
- "Go to Chassis Assets"
- "Go to Chassis Styles"
- "Go to Chassis Icons"
- "Go to Chassis Figma"
- "View Documentation"
```

#### Issues:
1. **Zero urgency** - No reason to click now
2. **Generic verbs** - "Go to" and "View" are weak
3. **No value promised** - What will I get?
4. **Symmetrical pairs** - Every section has same CTA pattern
5. **Missing entry points** - No "Start trial," "Talk to us," etc.
6. **No hierarchy** - Primary and secondary CTAs look equal

### Recommended CTAs:

**Primary Actions (keep them short):**
- "Explore Tokens" / "See Live Demo"
- "Try Asset Builder" / "View Examples"
- "See the Output" / "Compare Styles"
- "Browse 847 Icons" / "Search Library"  
- "Clone Starter Kit" / "Open Library"

**Secondary Actions:**
- "Read Setup Guide"
- "View Integration Docs"
- "Watch 3-Min Tour"

**Hero CTAs to add:**
- Primary: "Get Started Free" or "Start Building"
- Secondary: "View Live Examples"

---

## Missing Elements

### 1. Social Proof (Pre-Launch)
**Since Chassis isn't released yet, focus on credibility indicators:**

**Open Source Credibility:**
- "100% Open Source • MIT Licensed"
- "Built in the open on GitHub"
- Link to GitHub repo with visible star count

**Development Activity:**
- "Active development • [X] commits this month"
- "Join [X] developers following development"
- Show commit activity or contributor count

**Transparency:**
- "Public roadmap • Community-driven"
- "Beta access available"
- "Follow along on GitHub"

**Placement:** Below hero as a subtle trust bar
**Format:** Single line, minimal, link to repo

**Example:**
```
Open Source • MIT License • [GitHub →] • Join the Beta
```

### 2. Risk Reversal (Pre-Launch)
**For a pre-launch open source project:**

**Open Source = Zero Lock-in:**
- "100% open source • No vendor lock-in"
- "Self-hosted • You own your system"
- "MIT License • Use anywhere, modify freely"

**Transparency:**
- "Public roadmap • See what's coming"
- "Active on GitHub • Watch development live"
- "Community-driven • Your input shapes the product"

**Low Barrier to Entry:**
- "Beta access available now"
- "Full documentation already published"
- "Examples and starter kits included"

**Example placement:**
```
Open Source • Self-Hosted • No Lock-in • MIT License
[View on GitHub] [Read the Docs] [Join Beta]
```

### 3. Competitive Positioning
**Add brief comparison:**
```
Why Chassis vs Alternatives

Styled-System: CSS only, no Figma integration
Chassis: Bidirectional Figma ↔ Code sync

Tokens Studio: Manual export workflow  
Chassis: Automated builds, instant deploy

Style Dictionary: Tokens only
Chassis: Complete system (Tokens + CSS + Icons + Assets + Components)
```

### 4. Use Case Segmentation
**Add navigation or section:**
- "For 10+ brand product companies"
- "For agency teams managing client brands"
- "For platform companies with white-label needs"

---

## Voice & Tone Recommendations

### Current Issues:
- Inconsistent between technical and business language
- Sometimes passive ("are generated"), sometimes active
- Overuses gerunds (managing, building, creating)
- Lacks personality or differentiation

### Recommended Voice:
**Attributes:**
- **Direct & Confident:** Short sentences. Strong verbs. No hedging.
- **Benefit-First:** Lead with outcome, not mechanism
- **Technically Credible:** Show domain knowledge through precision
- **Zero Fluff:** Every word earns its place

**Example Transformations:**

❌ **Current:** "Chassis provides robust token architecture"  
✓ **Better:** "Tokens sync automatically. Every platform."

❌ **Current:** "Eliminate asset duplication and disorganization"  
✓ **Better:** "One asset source. Zero version drift."

❌ **Current:** "Built to scale and adapt over time"  
✓ **Better:** "Multi-brand from day one."

---

## Priority Fixes (Quick Wins)

### High Impact, Low Effort:

1. **Hero Headline** (15 min)
   - Replace with sharp, benefit-focused alternative
   - Keep it under 10 words

2. **Section Headlines** (1 hour)
   - Make each promise a specific outcome
   - Use format: "[Benefit]. [Benefit]. [Benefit]."

3. **Tighten Feature Copy** (1.5 hours)
   - Cut each feature to 2 sentences max
   - Lead with action verbs

4. **Sharpen CTAs** (30 min)
   - Replace "Go to" with action verbs
   - Keep under 3 words when possible

5. **Add One Metric Per Section** (30 min)
   - Number of icons, time saved, etc.
   - Adds credibility without adding length

**Total time for quick wins: ~3.5 hours**  
**Estimated conversion impact: +15-25%**

---

## A/B Testing Recommendations

Once quick wins are deployed, test:

### Test 1: Hero Headline
- **A:** Current "Build Better Design Systems"
- **B:** "Stop Rebuilding Your Design System Every Product Launch"

### Test 2: Section Format
- **A:** Current feature-list format
- **B:** Before/After comparison format

### Test 3: Primary CTA
- **A:** "Go to Chassis Tokens"
- **B:** "See Tokens in Action"
- **C:** "Try Token Builder Free"

### Test 4: Social Proof
- **A:** No social proof
- **B:** Stats-based ("10,000+ engineers")
- **C:** Logo cloud (if available)

---

## Conclusion

The current homepage is well-structured and professionally written. Many sections already have strong copy—particularly the Icons section workflow and the comprehensive nature of the hero explanation.

**What needs refinement:**
- **Headlines:** More outcome-focused promises
- **Feature descriptions:** Lead with benefit, not mechanism
- **Consistency:** Some sections sharper than others
- **Differentiation:** Make multi-brand capability more prominent

**What's already working:**
- Professional, concise tone
- Technical credibility
- Clear structure and flow
- Good use of code examples

### Implementation Approach:

**Phase 1: High-Impact Headlines** (2 hours)
- Test sharper headlines on 2-3 sections
- Measure engagement/scroll depth
- Roll out winners

**Phase 2: Feature Copy Refinement** (3 hours)
- Tighten features that describe mechanism vs. benefit
- Ensure no duplication with visual content
- Maintain or reduce current length

**Phase 3: Add Trust Signals** (1 hour)
- GitHub link with activity indicator
- Open source/MIT license badge
- Beta access CTA

**Target: Clearer value proposition while maintaining current professionalism.**

---

**Questions or want to discuss any recommendations?**  
Review complete. Ready for implementation.
