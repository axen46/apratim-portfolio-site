# Plan: build a standout product architect and engineer portfolio

**Plan prepared:** 25 October 2026  
**Status:** Guided portfolio reset, project tour, capability explorer, and scroll-linked case-study maps implemented and checked in desktop/mobile browser previews; publication and final content review remain
**Sources reviewed:** `~/Downloads/Apratim_Sarkar_Resume_001.docx` and the user-provided LinkedIn profile export  
**Primary positioning recommendation:** Lead with **Data Scientist and Digital Specialist Engineer**, emphasizing applied AI, credit-risk analysis, commercial lending, and full-stack delivery. Use “Product Architect” only when specific project ownership and architectural decisions can substantiate it.

**Latest implementation:** The home page opens with an editorial cobalt hero, an original monochrome illustrated guide, and a spacious personal introduction, followed by a deep-teal guided project tour. Each selected project has three keyboard-accessible synthetic view panes and the tour is followed by a seven-item resume-backed “More work” index. The Toolkit now includes four keyboard-accessible capability tabs that connect product architecture, AI, data, and API work to specific case-study evidence. The Network Assurance case follows five resume-backed stages from signals to service delivery; Document Intelligence uses a CSS-built exploded capability stack for document inputs, OCR/vision, retrieval, model analysis, and review. Both case-study visuals update with scroll, provide direct stage links, adapt for phone layouts, and retain reduced-motion support. Asset versions are updated to avoid stale browser caches.

## Expanded project tour and resume detail

**Reference review:** A closer pass through [Sebastien Graf’s portfolio](https://www.sebg.ch/) shows that its middle and lower sections carry as much weight as the hero: a long guided project tour uses large, legible project views with short descriptions tied to the work; an “All work” index offers a quick scan of the broader portfolio; and the page closes with a direct contact route. The site’s specific projects, artwork, and copy are not reused. For Apratim, the useful pattern is to make each system easier to inspect while preserving the existing guided editorial direction.

**Resume-backed detail:** The supplied resume describes ITAP document retrieval and analysis with internally hosted open-source models, GRAG/CRAG, self-query and text-to-query RAG, OCR, and image processing; iBAP AI search and OpenAPI YAML creation/review using prompts, few-shot learning, and RAG; ISNA SD-WAN time-series analysis, SolarWinds and Splunk signals, use-case-specific ML, FastAPI, and CI/CD; and earlier full-stack and independent projects. The profile export supplies the newer title chronology (Senior Systems Engineer, January–September 2025; Digital Specialist Engineer, October 2025–present), while the resume lists Senior Systems Engineer through the present. The experience timeline uses the export’s more specific progression; the project descriptions draw technical detail from the resume. Internal project visuals must stay synthetic and anonymized.

### Implementation

1. Add three keyboard-accessible views to each of the four selected-work panels, so readers can switch between a product/workflow view, a system view, and a decision/delivery view without leaving the guided tour.
2. Clearly label every recreated interface and system sketch as illustrative. Do not present synthetic prompts, YAML, data, or screens as actual client product evidence.
3. Add a compact “More work” index for resume-supported hackathon, capstone, research, and personal-project evidence; keep award scope and project maturity precise.
4. Keep the existing case-study pages as the deeper reading path. Add content only where the resume supports it, and keep commercial lending, customer, model-performance, and production details anonymized.
5. Check all panels at desktop and mobile widths, keyboard behavior, reduced-motion settings, and the links into the detailed stories.

**Executed and checked:** All four project viewers have Workflow/System/Scope or equivalent views. Arrow-key navigation updates the selected tab and its visible panel. The work index expands the visible resume coverage without claiming private client evidence. The local preview was checked at 1280px and 390px widths; the project cards and index fit the phone viewport, and the project/case links remain reachable.

## Reference review: Hamza’s Desk

I reviewed [Rao Muhammad Hamza’s portfolio](https://www.raomuhammadhamza.tech/) in desktop and phone layouts, including its Projects and Experience views. Its signature is a rotatable 3D desk: the monitor opens a project gallery, project selection fills the monitor with a product screenshot beside a README-style explanation, and career items become clickable role cards. A numbered section menu stays available across the scene. The first visit also shows a simulated model-training terminal and offers a sound choice; the About view includes an AI chat persona.

### Patterns worth adapting

- **Pair a real artifact with the build story.** The project detail view makes the application itself visible alongside motivation, behavior, implementation notes, and decisions. The current portfolio already has synthetic project screens and deeper case studies; replace those synthetic screens with approved product captures, public demos, or source links when available.
- **Make project selection quick.** The reference lets visitors narrow the monitor gallery to one project. The current site has four in-depth case studies plus a supporting-work index, so a project filter can be considered when those supporting entries have public artifacts or distinct detail pages to reveal.
- **Keep section access persistent.** Numbered Projects / Experience / About / Contact navigation stays visible even as the scene changes. The existing sticky header and work-tour links already solve this more directly for a scroll-based portfolio.

### Patterns not to copy into this portfolio

- Do not replace the current site with a full 3D room. It adds WebGL asset cost, a loading sequence, camera controls, and a desktop-first composition; it also repeats an immersive direction that was previously rejected during this redesign.
- Do not copy the training-progress screen, GPU/loss readouts, continuous sound, or AI persona. Those details imply live model performance or answer accuracy that Apratim’s resume does not support.
- Keep the visitor’s route to project evidence and contact understandable without manipulating a 3D scene. Treat the monitor/gallery pairing as a content pattern, not a requirement to recreate the setting.

**Recommendation:** Keep the cobalt introduction, scroll-led case studies, keyboard-accessible project panes, and compact work index. The highest-value follow-up is gathering shareable project screenshots, demos, or repositories and pairing each with a concise “what I built / how it works / key decisions” note. This adds genuine evidence before adding another visual system.

**Artifact pass:** The supplied profile export and resume contain no source-code or direct product-demo links. The export mentions `antaheen.org` in a recommendation, but the domain did not resolve during this check; the public LinkedIn profile also redirects to its sign-in wall. The current site does contain a functioning browser-based keyword-search prototype with synthetic documents in the document-intelligence case study. A direct “Try the synthetic keyword demo” link is now visible in that project’s homepage viewer; it does not imply that this is the internal ITAP application. No other screenshots or repositories were added without verified ownership and shareability.

## Visual reset plan after review of sebg.ch

The current atlas-heavy direction is retired. The reference is a portfolio by Sebastien Graf, a frontend/full-stack developer. Its useful design patterns are a full-viewport cobalt introduction, oversized plainspoken headline, illustrated guide with a short speech bubble, restrained top navigation, a spacious personal introduction, a long-form project tour, a compact all-work index, and a direct closing contact section. The character and artwork on that site are its own; this redesign will use an original illustration and Apratim-specific content rather than copying its assets or wording. [Reference: sebg.ch](https://www.sebg.ch/)

### New direction

Rebuild the first impression as a bright editorial portfolio with a guided tour. Keep the verified role as **Data Scientist and Digital Specialist Engineer**, and make product thinking visible through the case-study decisions and delivery story. Treat “product architect” as a capability, not a job title claim.

### Implementation plan

1. **Reset the hero:** replace the dark two-column dashboard, role-lens chips, and isometric atlas with a full-viewport cobalt scene, one oversized value statement, a minimal navigation, one contact action, and an original monochrome illustrated guide. Add a short conversational invitation to scroll.
2. **Give the story room:** follow the hero with a quiet, light introduction and a single compact strip of verified areas of work.
3. **Make selected work a guided tour:** use a full-bleed deep teal section with a sticky progress guide and direct links to four large case-study presentations. Keep the existing case content and anonymization while stripping away dashboard framing and unnecessary filters.
4. **Keep motion in service of the tour:** use restrained scroll reveals, an idle gesture for the guide, a project-aware guide caption, and subtle hover states. Preserve keyboard access, mobile layout, and reduced-motion behavior. Avoid adding a model runtime, heavy media, fabricated performance metrics, or autoplay audio.
5. **Make the visual change reviewable:** version the assets, run the static site locally, and inspect the hero and project tour at desktop and phone widths. Verify navigation and case-study links.

### Acceptance checks

- The hero is visually distinct from the previous navy systems dashboard and matches the new cobalt/editorial direction.
- The primary role and work are understandable without clicking controls.
- The original illustration reads as an intentional portfolio guide, not an unlabeled profile photo.
- All four existing case studies remain directly reachable and legible in the tour.
- There is no horizontal overflow at phone widths; keyboard navigation and reduced-motion settings continue to work.

The implementation lives in [../index.html](../index.html), [../styles.css](../styles.css), and [../script.js](../script.js). It keeps dedicated case studies for [commercial lending and credit risk](../work/commercial-lending-risk.html), [document intelligence](../work/document-intelligence.html), [network assurance](../work/network-assurance.html), and [open-banking API workflows](../work/open-banking-apis.html). The homepage presents those cases in a scroll-aware guided tour and retains the product delivery explainer, expertise, career history, education, recognition, contact path, keyboard-friendly mobile navigation, and reduced-motion handling. The credit-risk page stays high-level because the supplied profile material does not establish publishable system details or outcome metrics. Hosting, final evidence review, and employer/client approvals remain launch work.

## 1. The goal

Build a memorable, credible portfolio that quickly answers:

1. **What kind of problems does this person solve?**
2. **What have they personally designed, built, and shipped?**
3. **What changed for users or the business as a result?**
4. **Can they explain the product and system decisions clearly?**
5. **How can a suitable employer, collaborator, or customer get in touch?**

“Best among all” is not an objectively provable ranking. Define “best” as unusually strong on **clarity, evidence, usability, craft, accessibility, and trust**—and validate it with target readers rather than relying on visual novelty alone.

### North-star outcome

A hiring lead or collaborator should understand the portfolio owner’s strongest value proposition within seconds, find a relevant project immediately, and be able to inspect credible evidence without needing a guided explanation.

### Measures of success

- In a five-second test, at least **4 of 5 target readers** can state the owner’s primary role/value and identify where to see proof.
- In a short task test, at least **4 of 5 target readers** can find a relevant case study and contact path without help.
- At launch, the site meets **WCAG 2.2 AA as the target standard** and has no known critical accessibility blockers.
- The site’s key pages meet the current Core Web Vitals “good” thresholds at the 75th percentile when field data is available: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1**.
- Every project claim, image, metric, and employer/customer reference is accurate and publishable.
- Each featured case study makes the owner’s contribution, decision-making, and result understandable without overselling.

These are targets, not guarantees of job offers, search ranking, or business outcomes.

## 2. Research findings to apply

The reviewed examples suggest that a strong portfolio is more than a gallery:

- **Connect the whole product journey.** [Lee Robinson’s product-engineering guide](https://leerob.com/product-engineers) describes working backward from the desired experience, iterating with users, and choosing technology pragmatically. Make this the central narrative.
- **Show multiple kinds of evidence, but curate them.** [Eugene Yan](https://eugeneyan.com/) connects writing, prototypes, talks, and technical work. Borrow the breadth, but feature only a small number of best projects on the home page.
- **Demonstrate how quality is assessed.** [Hamel Husain](https://hamel.dev/) makes AI evaluation and product measurement a clear specialty. For AI work, show evaluations, failure modes, and what changed—not just a model demo.
- **Pair finished work with the reasoning behind it.** [Emil Kowalski](https://emilkowal.ski/) combines projects and components with implementation-focused writing. Let each case study explain the important craft and technical decisions.
- **Make technical work approachable.** [Simon Willison](https://simonwillison.net/) and [Andrej Karpathy](https://karpathy.ai/) show different ways to explain experiments and technical topics. Use plain-language summaries before deeper technical detail.
- **Treat accessibility and speed as product quality.** Use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) as the accessibility reference and [Core Web Vitals](https://web.dev/articles/vitals) for field performance. Apply [Nielsen Norman Group’s usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) to interaction and content choices.
- **Do not force a fake FDE portfolio.** Client work is often confidential. Use authorized, anonymized case studies or clearly labeled synthetic demonstrations; never expose customer data or imply a demo is a real deployment.
- **Use motion and 3D as explanation.** The new direction can include one focused 3D system scene, role-aware profile transitions, and scroll-linked case-study views. Keep the scene optional and progressive: direct project links, readable content, keyboard operation, a static mobile/reduced-motion fallback, and no scroll hijacking. Prototype the scene before committing to an engine or migrating the site.
- **Connect UX layers instead of presenting architecture as disconnected boxes.** The requested [five-planes UX article](https://medium.com/design-bootcamp/navigating-the-5-planes-of-ux-understanding-the-role-of-each-ux-discipline-ab97df04d4d3) could not be read because the page returned HTTP 403. Its five-plane framing (strategy, scope, structure, skeleton, surface) remains a useful lens: make the relationship between user need, system decisions, interaction, and outcome understandable. A new home-page system explorer links those layers to relevant case studies rather than claiming a detailed review of the inaccessible article.
- **Use spatial UI as orientation, not a theme.** The [Dribbble space UI tag](https://dribbble.com/tags/space-ui) did not load usable design examples in the browser. Rather than infer or copy unseen shots, the portfolio uses a restrained star-field/orbit treatment around an interactive system map; labels and direct links keep it functional and readable.
- **Make the interface feel intentional at the component level.** [Componentry](https://componentry.dev/) presents animated, reusable UI components and builder-focused craft, but its page exposed limited readable content. Keep the system explorer’s keyboard-focusable case-study nodes and clear hover/focus feedback, then add WebGL only as an enhancement to that working navigation.

The broader site-by-site shortlist and notes are in [best-portfolio-sites.md](./best-portfolio-sites.md).

## 3. Positioning and audience

### Primary story

Position the owner as a **product architect and engineer who can move from an important user problem to a well-designed, AI-enabled product in production**—only where the owner’s real experience supports that claim.

Use a short, specific value statement rather than a list of every job title. Drafting format:

> I design and build **[kind of product or system]** for **[audience/problem]**, connecting **[relevant strengths]** to **[credible outcome]**.

Fill every bracket from verified experience. If there is not yet evidence for a claim, narrow the claim or build a clearly labeled independent project; do not invent clients, metrics, or production use.

### Secondary audiences and supporting evidence

| Audience / role | Evidence to make discoverable |
|---|---|
| Product architect / product engineer (primary) | Problem framing, product trade-offs, system design, shipped experience, iteration, impact |
| AI engineer / AI architect | Evaluation, model/system choices, data flow, deployment, monitoring, failure handling, cost/latency trade-offs |
| Forward-deployed engineer | Integration into real constraints, stakeholder collaboration, adoption, deployment lessons; sanitized where needed |
| Full-stack engineer | Working end-to-end application, code, design quality, APIs/data model, tests, accessibility |
| Data scientist | Reproducible analysis, data caveats, decision relevance, visual explanation, measured result |

Do not give all six roles equal visual weight. Use one coherent primary identity, then label projects with relevant capability tags to help adjacent-role readers navigate.

### Apratim-specific positioning and evidence

The resume and profile export support this concise starting position:

> I’m a Data Scientist and Digital Specialist Engineer at Infosys, contributing to credit-risk and commercial-lending ML and GenAI solutions from design to deployment.

The portfolio now pairs the current role with experience across telecom network assurance, open banking, and full-stack development. Do not imply independently owned product strategy, customer adoption, or production metrics that the supplied sources do not establish.

#### Recommended project order

| Priority | Resume-backed project | Why it belongs | Evidence to gather before writing |
|---|---|---|---|
| 1 | **Enterprise document intelligence / ITAP** — RAG variants, internally hosted open-source LLMs, OCR/image analysis, and document retrieval/analysis | Most current and directly relevant to enterprise AI product engineering and architecture | Which parts Apratim personally designed/built; approved system diagram; data/model flow; evaluation method and failure cases; whether it was a pilot or production feature; authorized demo/screenshots; latency, quality, or usage measures if publishable |
| 2 | **Telecom network assurance / AIOps** — time-series and network-log analysis, generalized ML, FastAPI services, and CI/CD/deployment tooling | Strong end-to-end proof spanning data science, backend engineering, operations, and client constraints; especially relevant to FDE roles | Anonymization/permission requirements; exact use cases and ownership; data scale and baselines; model/service deployment status; measurable operational impact; a synthetic or redacted architecture diagram |
| 3 | **Open banking API capabilities / iBAP** — AI-assisted API search and OpenAPI YAML creation/review with RAG and few-shot methods | Connects enterprise workflow, developer experience, AI assistance, and product decisions | Actual user/workflow; what shipped versus explored; review/validation safeguards; personal contribution; stakeholder feedback; approved screenshots or synthetic examples; impact evidence |
| 4 | **Synthetic identity verification hackathon** — GAN and multimodal analysis; ANZ Hackfest 2024 top-20 finalist | A concise, public-safe innovation story if the submission can be shared; demonstrates ideation and prototyping | Permission to name the event/project; team size and Apratim’s contribution; demo or submission artifacts; evaluation and limitations; whether any result can be stated beyond finalist status |
| 5 | **Legacy modernization hackathon** — GenAI-assisted modernization of legacy/assembly code | Potentially strong product/engineering story and a resume-listed org-wide award | Exact award wording and scope; what the solution did; role and team; code/demo rights; evaluation and human-review controls; approved before/after example |
| 6 | **Role-based billing platform / Miracurol / Kode interpreter** — earlier full-stack and independent projects | Useful supporting evidence for full-stack breadth, product instincts, and long-running builder interests | Pick at most one for launch unless unusually complete; recover screenshots/code; clarify current status, personal ownership, users, and any claims about medical/ML functionality |

This ranking is a starting recommendation based on relevance and breadth, not a claim that each project is publicly shareable or has measured impact. Internal Infosys work must be reviewed against employer and client confidentiality requirements. A public portfolio may instead use approved anonymized descriptions or clearly labeled synthetic recreations.

#### Experience signals to feature selectively

- Current Digital Specialist Engineer role at Infosys (October 2025 onward), contributing to credit-risk analysis and risk-modelling ML/GenAI solutions for commercial lending.
- Previous Senior System Engineer role (January–September 2025), followed by Systems Engineer work (March 2023–December 2024) across telecom network assurance, FastAPI microservices, open-banking API capabilities, and technology communities.
- Full-stack training capstone at Infosys (React, Spring Boot, MySQL, API testing, and Java unit tests); team lead for the capstone.
- Selected earlier work: edge-computing disease-outbreak research, a college-band website redesign, Python handset price-range prediction, and statistical data analysis.
- Profile-listed skills include economic capital, systems design, machine learning, deep learning, GenAI, statistics, time-series analysis, PySpark, Apache NiFi, Kafka, MLOps/GitOps, FastAPI, React, Spring Boot, and Kubernetes.
- Profile-listed Infosys recognition includes the Tech Influencer Technology Award (December 2024), INSTA Award (November 2024), and RISE Rookie of the Quarter (November 2024). ANZ Hackfest finalist and legacy-modernization hackathon recognition are retained from the resume.

Keep awards and skill keywords secondary to project evidence. Do not put a long technology-logo wall ahead of case studies.

## 4. Content and information architecture

### Recommended first version

1. **Home** — value statement, primary call to action, 2–3 featured projects, short credibility signals, selected writing, contact.
2. **Work** — filterable or categorized project index only if there are enough genuinely useful projects to justify filtering.
3. **Case study pages** — one page per featured project, with a repeatable evidence-led structure.
4. **About** — concise story, working style, relevant experience, resume link, and contact.
5. **Writing / notes** — only if there is useful material to publish; do not launch an empty blog section.
6. **Contact** — direct email or another dependable contact path, with clear expectations.

Keep the main navigation short: **Work, About, Writing (if populated), Contact**. Make the resume easy to find without making it the whole site.

### Case-study structure

Use this sequence for each featured project:

1. **At a glance:** product, audience, status, timeframe, team context, owner’s role, and links to demo/code where safe.
2. **The problem:** who had the problem, how it was discovered, and why it mattered.
3. **The goal and constraints:** desired outcome, technical/business constraints, and what success meant.
4. **The product decisions:** alternatives considered, scope chosen, trade-offs, and what was intentionally deferred.
5. **The architecture:** a simple system diagram plus explanation of important components, data flows, integrations, and operational choices.
6. **The build:** key UX and engineering decisions; how the work was tested; how the owner collaborated and iterated.
7. **The result:** real measures with timeframe and context. Distinguish observed facts from estimates. If numbers cannot be shared, use approved qualitative evidence or omit them.
8. **What changed / learned:** user feedback, failures, follow-up work, and the next iteration.

Each page should have a short non-technical summary first and expandable/deeper technical context below. A diagram should explain a decision or flow, not decorate the page.

### Content inventory before design

For every candidate project, gather:

- Public name or approved anonymized label
- Intended user and problem
- Evidence the problem exists
- Product scope and owner’s exact contribution
- Team and collaboration context
- Product and architecture decisions, including alternatives
- Implementation status and current demo availability
- Tests, evaluations, deployment, and operational considerations
- Outcomes, source, timeframe, and permission to publish
- Screenshots/diagrams and rights to use them
- Code, demo, article, or other supporting links
- Confidentiality or security review requirements

Score candidates on relevance to target work, strength of evidence, ownership clarity, product/technical depth, outcome, and publishability. Select the best two or three—not necessarily the newest or most visually impressive.

## 5. Experience and visual direction

### Design principles

- Make the **work** and the owner’s value proposition more prominent than decorative effects.
- Use a distinctive but restrained visual identity: a clear typographic system, strong hierarchy, generous spacing, and a small number of purposeful visual signatures.
- Show real product artifacts (screens, flows, diagrams, prototypes) with captions that explain their relevance.
- Use interaction to clarify work or demonstrate craft; avoid animation that delays reading or navigation.
- Keep readable line lengths, visible focus states, semantic headings, descriptive links, sufficient contrast, and keyboard support.
- Respect reduced-motion preferences; do not make essential content depend on hover, animation, color, or sound.
- Prefer direct language and explain specialized terms on first use.

### Recommended creative direction: “Product Systems Atlas”

Keep the **clear, modern product journal** as the reading layer, and add a memorable spatial layer: an interactive atlas of how a user need becomes an AI-enabled product. The 3D should make the portfolio feel authored by a product architect and engineer, while the writing and ordinary links stay quick to scan.

#### Visual system

- **Canvas:** warm off-white (`#F6F5F0`) for the reading surface, with deep ink (`#17212B`) for text and occasional full-bleed ink panels to create contrast.
- **Accent:** one vivid cobalt/blue for links and primary actions; a restrained chartreuse or mint may mark status or diagram nodes. Keep accent colors out of long text and never use color as the only signal.
- **Typography:** a highly legible sans-serif for headlines/body and a restrained monospace for metadata, dates, role labels, and architecture annotations. Use licensed/self-hosted fonts or a strong system-font stack; avoid loading a large font bundle for decoration.
- **Grid:** editorial two-column desktop composition with generous margins: narrative/content on one side, evidence/diagram on the other. Collapse to a single reading column on mobile.
- **Signature motif:** a three-dimensional, exploded system model connected by a thin trace—**user need → data → model/service → experience → outcome**. Keep it explicitly illustrative unless a client-approved architecture is available. The movement should reveal the relationship between layers, not suggest a live production system.
- **Project cards:** each card pairs a real, permission-cleared product image or custom diagram with a short problem statement, role, capability tags, and one verified outcome or status. Avoid decorative screenshots that do not support the story.

Color values are a starting palette, not a final brand decision. Check text/background combinations for WCAG contrast; adjust tokens if needed.

#### Homepage composition

1. **Compact header:** “Apratim Sarkar” wordmark, Work, About, and a clear Contact action. Add a resume link in the footer or About page.
2. **Hero:** a direct headline and one-sentence explanation on the left; the “Product Systems Atlas” scene on the right. Show four labeled architectural layers and four project waypoints, with an explicit “Explore work” action always visible. Use an animated 3D version only when it loads and runs well; otherwise show the matching static SVG/poster with the same labels and links.
   - Headline direction: **“I build AI products that connect data, models, and real workflows.”**
   - Supporting line: **“AI/ML engineer working across enterprise retrieval, data systems, backend services, and product delivery.”**
   - Actions: **Explore selected work** and **Get in touch**.
3. **Selected work:** a chapter-led editorial gallery for the four current case studies, with the strongest two or three given the richest visual treatment. Order and feature them according to verified ownership, relevance, and publication approval.
4. **How I work:** a compact five-step strip—**Understand → Design → Build → Evaluate → Deliver**—with one specific example of a decision or learning from the featured work.
5. **Proof bar:** concise verified signals such as current role/experience, a relevant award, and core strengths; no unsubstantiated counters or vanity metrics.
6. **About/contact close:** a short personal note, location only if desired, and a direct contact route. Keep the footer calm and useful.

#### Case-study page composition

- Start with a large, plain-language project title, a one-line outcome/problem, and a compact metadata row for role, team context, timeframe, and status.
- Show the user problem and the actual product surface before the architecture deep dive.
- Use a consistent vertical narrative with alternating evidence blocks: product screenshot, short decision note, architecture/data-flow diagram, evaluation/result, and reflection.
- Put a readable “system at a glance” diagram early, with a text explanation and labels; add deeper implementation details lower on the page.
- Include a visible **My contribution** section to make team context and individual ownership explicit.
- If the case is anonymized, label it as such. If a demo is synthetic, say so beside the demo—not only in a footer.
- End with measured outcomes or honest limitations, lessons, related work, and a next-project/contact path.

#### Interaction, motion, and responsive behavior

- Keep navigation and project links ordinary, obvious, and keyboard accessible. No scroll hijacking, hidden hover-only content, custom cursor, or forced intro animation.
- Choreograph a small set of signature moments: system layers assemble once on entry; role lenses transition the copy and highlighted project nodes; scroll gently moves the scene between labeled states; project artifacts respond to hover/focus. Do not make any essential message depend on completing an animation.
- Respect `prefers-reduced-motion`: use a static scene or user-triggered state changes, and provide a visible pause/motion control. Pause continuous rendering when the scene is off-screen or the tab is hidden.
- For long case studies, pair the section links with a compact chapter count and progress line that follows the active section. Keep the section links as direct anchors so readers can move through the story at their own pace.
- On mobile, put the headline and CTA first, then projects; stack diagrams and provide a readable text alternative rather than shrinking complex graphics.
- Use a project filter only if the content set grows enough to need one. Start with a simple role/capability label and normal page links.
- Offer dark mode only if it can be designed and tested as a complete theme; do not let it delay content quality or accessibility.

### Homepage content order

1. Name and specific role/value proposition.
2. One primary action: **View selected work**; one secondary action: **Contact** or **Resume**.
3. Two or three featured projects with role, problem, and outcome visible in the summary.
4. Compact “how I work” section: discover → decide → architect → build → measure.
5. Selected technical/product writing or talks, only if they strengthen the position.
6. Brief bio/credibility and an unmistakable contact link.

Avoid a vague hero headline, giant skill-logo wall, auto-playing media, fake terminal UI, meaningless counters, generic testimonials, and claims without evidence.

## 6. Build roadmap

The timeline is a planning estimate for one person, assuming project evidence is available. Research, content approval, or a complex project can extend it.

### Phase 0 — Audit and constraints (half day)

- Inspect the actual workspace, installed tooling, and any existing website before choosing a stack.
- Confirm the owner’s target audience, job-market/geographic context, privacy needs, domain, and available case studies.
- Inventory existing assets and identify which are publishable.

**Deliverable:** a short constraint/asset inventory and implementation decision. Reuse a sound existing stack; do not migrate technologies just to make the portfolio fashionable.

### Phase 1 — Evidence and positioning (1–2 days)

- Collect candidate projects and complete the content inventory.
- Check ownership, permissions, confidentiality, metrics, and demo/code safety.
- Score projects and choose two or three that best support the primary identity.
- Draft one positioning statement and short bio grounded in evidence.

**Exit check:** no featured-project claim depends on invented impact, unclear ownership, or unauthorized material.

### Phase 2 — Narrative and structure (1 day)

- Draft home-page copy and case-study narratives before visual design.
- Sketch the navigation and page-level information hierarchy.
- Map each project to the primary position and relevant secondary capabilities.
- Decide what not to include in the first release.

**Deliverable:** approved content outline and low-fidelity wireframes.

### Phase 3 — Visual system and prototype (2–4 days)

- Create a small type, color, spacing, layout, and component system.
- Design responsive home, project index (if needed), and one full case study.
- Prototype two hero directions: an animated system scene and its static fallback. Compare a Spline scene with a custom Three.js spike before choosing a runtime.
- Prototype the role-lens switcher and the project scene’s four states on desktop and mobile; use a real approved portrait only if available.
- Review with at least three people in likely target audiences before polishing all pages.

**Exit check:** readers can identify who the owner is, what they do, and which case study to open.

### Phase 4 — Implementation (5–10 days)

- Choose a minimal, maintainable implementation after the Phase 0 audit; use static content/pages unless the repo or content workflow genuinely needs a CMS.
- Implement shared layout/components, responsive case-study templates, metadata, and semantic HTML.
- Preserve the static-first site; add one lazy-loaded 3D scene as a progressive enhancement. Keep the SVG/poster, role descriptions, project anchors, and case-study text available without WebGL.
- Add scroll-linked chapter views and diagrams with accessible text alternatives. Prefer render-on-demand for mostly static 3D; dispose scene resources when the scene is removed.
- Optimize images, fonts, and scripts; avoid adding analytics or third-party widgets without a clear need.
- Add analytics only if desired and privacy-appropriate; define the events needed before integrating it.

**Deliverable:** a complete, navigable pre-release site with real content.

### Phase 5 — Quality and reader testing (2–3 days)

- Test keyboard-only navigation, focus visibility, headings/landmarks, forms/links, contrast, zoom, and reduced motion.
- Check phone, tablet, and desktop layouts; test common browsers.
- Run automated accessibility checks, then manually inspect critical flows; automated checks alone do not prove conformance.
- Test all project links, external links, downloads, contact paths, metadata, and 404 behavior.
- Check the 3D hero on a low-powered phone, with WebGL unavailable, with keyboard only, and with reduced motion enabled. Compare its loading cost and scrolling smoothness to the static fallback.
- Run a five-second positioning test and a case-study/contact task test with target readers.
- Measure Core Web Vitals in lab/pre-launch tools; after launch, gather field data before treating lab scores as real-user performance.
- Confirm no personal data, secrets, client identifiers, or restricted screenshots were accidentally published.

**Exit check:** success measures in Section 1 are met or there is an explicit follow-up issue for each gap.

### Phase 6 — Launch and iteration (ongoing)

- Publish to the chosen domain and verify HTTPS, redirects, canonical URLs, sitemap/robots settings, metadata, and social sharing cards.
- Share the site with a small group and ask what they remember, what they trusted, and what remained unclear.
- Review traffic or engagement only with privacy-respecting measurement and clear goals.
- Refresh project status, broken links, role positioning, and outcomes at least quarterly or after significant new work.

**Deliverable:** a maintained portfolio, not a one-time launch artifact.

## 7. Technical and quality decisions

Make these decisions only after inspecting the actual project:

- **Rendering/hosting:** prefer the simplest deployable approach that supports fast pages and maintainable content. A static-first site is a good default for a portfolio; SSR or a database is not justified unless there is a real feature requiring it.
- **Content editing:** use Markdown/structured local content first unless multiple editors or frequent non-technical updates require a CMS.
- **Contact:** direct email or a well-tested form. If a form is used, include validation, clear error/success feedback, abuse protection, and a privacy note.
- **Analytics:** optional. Do not add invasive tracking by default; decide what question measurement should answer.
- **Search/indexing:** set page titles/descriptions, canonical URLs, sitemap, robots directives, and meaningful social preview metadata.
- **Accessibility:** target WCAG 2.2 AA; manually test keyboard and screen-reader-relevant structure in addition to automated scans.
- **Performance:** target Core Web Vitals “good” thresholds at p75 once field data is available; optimize actual bottlenecks rather than chasing a single synthetic score.
- **3D scene:** keep the site static-first. Load one small hero scene after the critical copy; prefer render-on-demand, pause it when hidden, and dispose renderer resources when the scene is removed. Use Spline if its prototype meets accessibility, loading, and visual-integration goals; use Three.js only if custom scroll/pointer control justifies the extra implementation and upkeep. Preserve a poster/SVG fallback.
- **Profile imagery:** the current workspace contains no portrait, 3D model, or video assets. Use a real, owner-approved portrait if a human profile animation is desired. Until then use a designed monogram or abstract system sculpture; do not synthesize a face that implies it is Apratim.
- **Security/privacy:** do not expose keys, private repository URLs, customer information, internal diagrams, or unsafe demo inputs. No secrets in client-side code.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Portfolio tries to represent too many roles equally | Lead with product architecture/engineering; use project tags to demonstrate adjacent strengths. |
| The 3D scene distracts from experience or contact | Keep direct links visible and make the scene a bounded enhancement, never the sole navigation system. |
| The 3D scene loads slowly or drains mobile power | Compare against a static SVG/poster; lazy-load, render on demand, pause off-screen, cap scene complexity, and retain a mobile/reduced-motion fallback. |
| Profile animation feels generic or misrepresents the owner | Use an approved portrait or an abstract designed model; make role lenses change verified proof, not invent a persona. |
| Impressive style hides weak evidence | Draft case studies and prove content hierarchy before visual polish. |
| Metrics are unavailable or confidential | Use approved qualitative outcomes, synthetic public demos, or explicitly state what cannot be shared; never fabricate numbers. |
| Confidential client/employer work is exposed | Get permission, anonymize carefully, review diagrams/screenshots, and make synthetic work clearly labeled. |
| AI showcase becomes a generic chatbot demo | Show a user problem, evaluation, failure handling, cost/latency considerations, and the owner’s actual contribution. |
| Overbuilding delays launch | Ship a focused first release with 2–3 excellent case studies; defer CMS, search, complex animation, and unnecessary backends. |
| Accessibility is left until the end | Include semantic structure, keyboard behavior, contrast, and reduced motion in design and implementation phases. |
| Site becomes stale | Keep content easy to update and schedule a periodic review. |

## 9. Immediate next actions

1. Reconcile the supplied LinkedIn-export role dates and titles with the resume, especially the 2025 role progression, before public launch.
2. Request approved project artifacts and evidence for credit-risk, document intelligence, telecom AIOps, and banking API work: personal contribution, constraints, outcomes, diagrams, and publication permissions.
3. Verify award names, dates, team roles, certificate links, and all outcome claims against source material.
4. Expand the current credit-risk overview only with verified details that are approved for publication.
5. Prototype the Product Systems Atlas in Spline and as a static fallback; compare performance and accessibility before selecting the implementation path.
6. If a portrait-led profile animation is preferred, provide an approved portrait asset; the current workspace has none.
7. Confirm employer/client approval, then run target-reader usability checks and final accessibility/performance checks.

**Important dependency:** the site cannot credibly be made “best” through design alone. The highest-value next input is approved project evidence and a reconciliation of any differences between the resume and profile export.

## Research references

- Existing curated shortlist: [best-portfolio-sites.md](./best-portfolio-sites.md)
- [Lee Robinson — Product Engineers](https://leerob.com/product-engineers)
- [Eugene Yan — personal site, prototypes, writing, and talks](https://eugeneyan.com/)
- [Hamel Husain — AI product engineering and evals](https://hamel.dev/)
- [Emil Kowalski — projects and design-engineering writing](https://emilkowal.ski/)
- [Simon Willison — experiments, projects, and technical writing](https://simonwillison.net/)
- [Andrej Karpathy — research/engineering profile and teaching](https://karpathy.ai/)
- [W3C — Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [web.dev — Web Vitals](https://web.dev/articles/vitals)
- [Nielsen Norman Group — 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Skiper UI — reusable UI components](https://skiper-ui.com/)
- [AnimMasterLib — motion and interaction patterns](https://animmasterlib.dev/)
- [ThreeUI — recent section compositions](https://threeui.com/browse?sort=recent)

**Research note:** Site descriptions and primary-source materials were checked 25 October 2026. The examples are inspiration, not a claim that any one design is objectively best or that copying its visual style will produce equivalent results.

## 10. Bigger redesign proposal: “Product Systems Atlas”

This is a new, larger design direction requested on 25 October 2026. It builds on the existing type, color, case studies, and chapter navigation, but introduces one authored 3D signature and a clearer role-based personal profile. It is a plan, not an instruction to add a 3D runtime before the prototype is reviewed.

### Research translated into design decisions

| Research pattern | What to learn | How it fits this portfolio |
|---|---|---|
| [Aevion](https://drone.riotters.com/) | Technical scanning, product-like telemetry, capability callouts, and a staged reveal. | Animate a system model as a user-to-product path, and annotate it with true, publishable facts. |
| [Shopify Editions](https://www.shopify.com/editions/spring2026) | A persistent topic index makes a large set of features scannable. | Keep the current project chapter rail; extend its numbered index into the story states inside case studies. |
| [Viskhan Khasiyev](https://khasiyev.com/) | The maker’s design/code/automation identity and end-to-end client work are clear immediately. | Keep a single primary Product Architect & Engineer position, then let visitors switch supporting evidence by role. |
| [Unifiers of Japan](https://unifiersofjapan.framer.website/) | A long-form story gains clarity through numbered chapters, maps, timelines, and visual pauses. | Give each case study a small sequence of scroll states: problem, product decision, system, evaluation, delivery. |
| [Bruno Simon](https://bruno-simon.com/) | A fully spatial portfolio can make interaction itself memorable, but it needs controls, a quality setting, and recovery options. | Borrow spatial discovery; keep conventional project, résumé, and contact routes visible and immediate. |
| [Stefan Vitasović’s portfolio breakdown](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) | Repeated typography/motion motifs make an experimental site cohesive; the author describes a lighter mobile path without WebGL. | Use one repeated “layers assemble into a product” motif and retain an HTML/static mobile version. |

### Proposed experience

1. **Hero — the Product Systems Atlas.** Preserve the concise introduction and CTA. Pair them with one low-poly/isometric 3D model made of four clearly labeled layers: **user/workflow, data, model/service, interface**. Four smaller waypoints lead to the existing case studies. Hover, focus, or a role lens highlights a layer; clicking a waypoint opens its ordinary case-study URL.
2. **Profile role lenses.** Keep Product Architect & Engineer as the stable primary identity. Add switchable evidence lenses for **AI Engineer, Forward Deployed Engineer, Data Scientist, and Full-Stack Engineer**. Each lens updates one short supporting line, 2–3 capability labels, and the relevant case-study highlights. The headline and navigation do not disappear or get replaced by a typewriter animation.

   | Lens | Candidate case-study emphasis | Proof angle to validate before copy is written |
   |---|---|---|
   | Product Architect & Engineer *(default)* | Credit risk + open banking | Connect the user workflow, product decisions, system shape, and delivery contribution. |
   | AI Engineer | Document intelligence + credit risk | Explain retrieval/model use, document context, and known evaluation or safety constraints. |
   | Forward Deployed Engineer | Network assurance + credit risk | Show integration and operational context, collaboration, and the owner’s actual field contribution. |
   | Data Scientist | Credit risk + network assurance | Show the question, data/analysis approach, limitations, and decision relevance. |
   | Full-Stack Engineer | Open banking + network assurance | Surface interface/API flow, backend services, deployment scope, and ownership. |

   These are navigation hypotheses, not additional job titles or claims. Confirm each emphasis against the resume/profile export and approved case-study evidence before publishing it.
3. **Scroll story.** Use native document scrolling. A sticky scene or diagram moves through bounded states—**frame the need → map the system → build the workflow → evaluate → deliver**—while the current chapter and explanation update. The viewer can click chapter links or just continue scrolling; no wheel capture, forced snapping, or hidden content.
4. **Project rooms.** Give each case a unique visual artifact rather than four copies of one 3D card: credit-risk flow as a model/risk landscape; document intelligence as layered pages and source citations; telecom assurance as a signal field and service path; open banking as an API design-to-request flow. Use approved assets where available and label invented demo data as synthetic.
5. **Personal close.** Add an animated profile panel near About. If Apratim supplies a real portrait, treat it as a restrained 2.5D editorial cutout with a soft parallax/contour reveal. If not, use the initials and the same abstract system object. Do not create a realistic AI likeness.

### Motion language

- Assemble the hero’s model once as the page appears, then keep it nearly still until the user interacts or scrolls.
- Use small pointer parallax on fine pointers; keyboard focus and role-lens buttons must produce the same highlighted states.
- On scroll, translate/rotate the inner model a bounded amount and update labeled chapter content. Keep the document’s native scroll position and browser history behavior.
- Use one short transition motif across role changes, case-study art, and chapter changes rather than unrelated effects.
- Default to no audio, no mandatory intro/loading sequence, no animated custom cursor, and no infinite particle field.

### 3D implementation choice

Prototype the same model in two ways before choosing:

- **Spline prototype:** fastest way to author lighting, layers, and state-based pointer interactions. Confirm the embed can be styled, keyboard interaction is adequate, loading is acceptable, and the static fallback remains easy to maintain. Spline’s docs describe web-published scenes and state-based interactivity: [official overview](https://docs.spline.design/basics/how-is-spline-different).
- **Three.js prototype:** choose this only if the scene needs tightly synchronized custom scroll/camera states or integration with the role lens that Spline cannot provide. Keep it as a lazy-loaded module, resize the drawing buffer to its actual display size, render on demand while idle, and explicitly dispose GPU resources. See the [responsive canvas](https://threejs.org/manual/pages/responsive.html), [render-on-demand](https://threejs.org/manual/pages/rendering-on-demand.html), and [cleanup](https://threejs.org/manual/pages/cleanup.html) guidance.

Do not migrate the current static HTML site to React just to host this visual. First compare the prototypes against the existing HTML/CSS/JS page and the project’s actual hosting constraints. The lighter fallback is a designed SVG/poster with the same chapter labels and links.

### Staged work and decision gates

| Stage | Work | Exit gate |
|---|---|---|
| A. Story and asset brief | Confirm headline, role-lens wording, project-to-role mapping, portrait preference, and publishable artifacts. Request an approved portrait only if the personal cutout direction is wanted. | Every label and visual maps to verified profile/project information. |
| B. Art direction | Sketch a four-layer model, a profile panel, the case-art motifs, and a reduced-motion/mobile frame. Build one color and type system across the full homepage. | A reviewer can describe the concept and identify the Work and Contact paths in five seconds. |
| C. Motion prototype | Prototype one Spline scene and one lightweight Three.js scene (or a static SVG if neither is justified); test the role lenses and scroll states at desktop and phone sizes. | Choose the version that is clearer and responsive without delaying the hero text or blocking project navigation. |
| D. Site redesign | Recompose the homepage around hero → role lenses → featured project chapters → product delivery story → profile/experience → contact. Update all case studies to share chapter progress and art direction, but vary each project’s diagram. | Home, all four cases, and mobile fallbacks use one coherent visual system. |
| E. Quality pass | Check keyboard, screen reader names, reduced motion, no-WebGL fallback, small/slow device behavior, canvas resizing, and GPU cleanup. Compare lab performance to the current static page. | The content remains complete and navigable with motion disabled and WebGL unavailable; performance stays within the Section 1 targets. |

### Asset and performance dependencies

- No portrait, 3D-model, or video asset is present in the current repository. The 3D model and profile image would be new creative assets.
- Budget the hero scene before production: start with no photoreal textures, few materials, a single camera, and on-demand rendering. Load the model after critical text and defer it below the fold where possible.
- Use a static SVG/WebP fallback for small screens, reduced motion, WebGL failure, and slow loading. Do not make the visitor wait for the 3D scene to use the site.
- Set a prototype asset-size target and verify on a low-powered phone rather than assuming a scene is light because it looks simple. Track the scene’s download cost and render smoothness against the current page.
- Preserve the current motion toggle and honor `prefers-reduced-motion` using a reduced/static experience, not only shorter animation durations. See [MDN’s motion preference guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

### Defer until the prototype proves value

Do not start with a full driveable portfolio world, talking avatar, AI resume chatbot, sound design, continuous particle simulation, or multiple WebGL canvases. These are separate features with added content, performance, accessibility, and maintenance costs. A single clear model and useful role lenses are the first major change to prove.
