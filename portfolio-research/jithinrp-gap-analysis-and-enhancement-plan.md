# End-to-End Audit: `jithinrp.com` vs. Local Portfolio (`:4175`) & Enhancement Plan

**Date:** 28 October 2026  
**Local Server:** Running at [`http://127.0.0.1:4175/`](http://127.0.0.1:4175/)  
**Reference Site:** [`https://jithinrp.com/`](https://jithinrp.com/) & [`https://jithinrp.com/slot-booking`](https://jithinrp.com/slot-booking) ([Awwwards Nominee Page](https://www.awwwards.com/sites/jithin-rp-portfolio) · [Wall of Portfolios](https://www.wallofportfolios.in/portfolios/jithin-rp/))

---

## 1. Executive Summary: What `jithinrp.com` Does End-to-End

An end-to-end inspection of [`jithinrp.com`](https://jithinrp.com/), its [Slot Booking case study](https://jithinrp.com/slot-booking), and its 7 highlighted [Awwwards interactive elements](https://www.awwwards.com/sites/jithin-rp-portfolio) shows how every layer of the site works together:

1. **Entry & Performance Gate (`Draw a Z to enter` + `?lite`)**: Opens with an interactive black-and-white WebGL/canvas gesture loader where visitors draw a `"Z"` on water to enter, paired with a `"Skip intro"` button, a `"Slow connection? Open the light version (?lite)"` fallback link, and a friendly mobile viewport banner (`"Hey Mate, 9 years of work deserves a little more screen space..."`).
2. **Header, Navigation & Playable Easter Egg**: Fixed hairline header with an animated SVG signature on the left, direct links (`About Me`, `Contact`, `Works`, `Play Game` → `/memory/`, and `Resume` PDF) in the center, and a circular sine-wave sound button with a gooey drip tooltip on the right.
3. **Hero & Melting Pixel Typography (`Melting Pixel Title`)**: Left-aligned impact statement (`5M+ people`), right-aligned metadata strip with `+` dividers, and an oversized pixel display title (`Jithin RP`) with a bottom-right LinkedIn badge. Hovering and scrolling apply a liquid pixel-melt displacement (`feTurbulence` + `feDisplacementMap` + blur) to individual characters.
4. **3 Capabilities Pillars & Scroll-Velocity Marquee**: Three hairline-separated value pillars followed by a giant pixel-type marquee (`Product design + Design systems + Research + Interaction + Motion +`) whose speed, direction, and `skewX` respond in real time to scroll velocity.
5. **Selected Works (`Project Cards on Water` + `Hold to Open: Bubble Burst`)**:
   - **3-Column Triptych Layout**: Project narrative and `Project Timeline` on the left; a tall dark monolith card (`436 × 650`) suspended over a live **Three.js / WebGL water-ripple field** in the center; `Role` and `Tools` icon chips on the right.
   - **Gooey Tool-Chip Drip Tooltips (`.liquid-tip`)**: Hovering any tool icon drops an anchored metaball tooltip (`feGaussianBlur` + `feColorMatrix`) showing the tool's name and role context.
   - **Hold-to-Open Bubble Burst**: Pressing and holding on a project row swells a liquid bubble around the cursor pill with rising audio pitch, then bursts into a full-screen WebGL SDF metaball liquid sheet (`liquidSheet` shader + `000 → 100` counter) before navigating to the case study.
6. **Gen AI & Side Projects Carousel**: Horizontal drag-to-scroll track with prev/next arrows and scroll-velocity jelly skew (`--card-skew`), mixing rich multi-section story modals (`Australia Post Parcel Sorter`, `Stickskate`, `UNDO`) with live playable web apps (`CandiTracker`, `Looped`, `LogoPlay`).
7. **About Me (`Glitch Portrait and Photo Trail`)**: Two-column layout pairing a concise personal story with a CRT scanline/glitch portrait frame and a **cursor-spawned liquid photo trail** (`#trail-liquid-0..5`) that drops rotating, liquid-warped snapshots as you move across the section.
8. **Recognition Band & Infinite Testimonials Strip**: Three-column recognition band followed by a **seamless infinite-loop marquee** of 5 colleague/CEO testimonials (cloned `3×` with `aria-hidden="true"` so it never stops or reverses).
9. **Web Audio Lofi & Liquid Synthesizer**: Synthesizes water `drop()`, `bubble()`, `tick()`, `pop()`, and `unpop()` transients through a convolution reverb + lowpass filter alongside a warm lofi chord loop, controlled by the navbar button or the `M` key.
10. **Deep Case Study Pages (`/slot-booking`, `/squads`, `/design-system`)**: Open with `Back to home` + `Next project` top navigation, 3–4 headline impact metric cards, a sticky chapter bar, and a visual-first narrative (`Context & Problem` → `The Insight` → `Exploring Directions` → `The Breakthrough` with numbered `01–04` interactive feature blocks → `The Outcome` → `After Launch` → `Takeaway`).

---

## 2. Gap Analysis: `jithinrp.com` vs. Your Site (`http://127.0.0.1:4175/`)

Your local portfolio (`index.html`, `styles.css`, `script.js`, `work/*.html`) already implements a strong foundation of the `jrp-landing` architecture. Below is the exact section-by-section audit of **what is working**, **what has bugs/wiring gaps**, and **what is missing**:

| Area / Feature | `jithinrp.com` Reference | Your Site (`:4175`) Current State | Gap / Bug to Fix |
|---|---|---|---|
| **Entry Loader & Gesture Gate** | Interactive **"Draw a Z to enter"** WebGL/canvas water gesture loader + `"Skip intro"` + `"?lite"` low-motion link + mobile desktop-hint banner | None (loads directly into page) | **Missing**: No `"Draw an A to enter"` (or `"Skip intro"`) gesture loader, no `?lite` query param support, and no compact mobile desktop-experience notice |
| **Navbar & Primary Links** | Signature SVG + `About Me`, `Contact`, `Works`, **`Play Game` (`/memory/`)**, **`Resume` (PDF)** + Sound wave button | Signature SVG + `Works`, `Projects`, `Approach`, `Journey`, `About`, `Contact` + Sound wave button | **Bug + Missing**: (1) `script.js:1266` queries `.jrp-navbar__link[href^="#"]`, which matches `0` elements because links lack `.jrp-navbar__link`; (2) Missing direct **`Resume`** link in navbar & contact; (3) Missing **`Play Game` / Interactive Lab** route |
| **Hero & Melting Pixel Title** | Per-character liquid pixel melt (`feTurbulence` + `feDisplacementMap` + blur) on **both pointer hover and scroll** | `.jrp-char` lifts `-16px` and scales `1.065` on hover; `script.js:2690` mutates `#liquid-melt-disp` on scroll | **Broken Filter Wiring**: `#liquid-melt` is defined in `index.html:41` and updated in `script.js:2690`, but **`url(#liquid-melt)` is never applied in `styles.css`**, so the pixel title never melts on hover or scroll |
| **Selected Works: Water & Hold-to-Open** | Three.js/WebGL water surface under monoliths + visible **Bubble Burst** inflation on hold + `unpop()` sound on early release | CSS `.jrp-work__pond` rings + SVG `feDisplacementMap` ripple + `680ms` hold-to-open + WebGL `liquidSheet` cover | **Enhancement Gap**: (1) Hold-to-open only scales a `1.5px` underline on `.jrp-cursor-pill::after` instead of inflating a radial bubble/ring around the cursor & monolith; (2) Releasing hold early does not trigger `soundApi.unpop()`; (3) Pond rings are CSS-only rather than an interactive canvas water-ripple field |
| **More Projects (`#more-work`)** | Carousel + jelly skew + rich story modals with visual diagrams & live app links (`canditracker.vercel.app`, etc.) | 7-card carousel + jelly skew + 7 `<dialog>` text modals | **CSS Bug + Visual Gap**: (1) `styles.css:13922` styles `#genai .jrp-display`, but the section ID in `index.html:776` is `#more-work`; (2) Modals are text-only without architecture diagrams, interactive previews, or GitHub/demo links |
| **About Section & Photo Trail** | CRT glitch portrait + cursor liquid photo trail (`#trail-liquid-0..5`) | 5-photo switcher + CRT overlay + slice glitch + cursor liquid photo trail | **Polish Gap**: Trail images use relative `photo.src` without `basePrefix` (`script.js:2566`) and can overlap interactive controls if fast-moved near the boundary |
| **Recognition & Quotes Strip** | 3-item Recognition row + **seamless infinite marquee** (5 testimonials cloned `3×` with `aria-hidden="true"`) | 3-item `.jrp-awards` row + 4-item `.jrp-track--quotes` with ping-pong `scrollLeft` reversal | **Motion & Content Gap**: (1) Ping-pong `scrollLeft` stops and reverses at ends instead of a cloned seamless infinite loop; (2) The 4 quotes duplicate the same awards shown in `.jrp-awards` instead of highlighting distinct peer/mentor quotes & engineering impact |
| **Web Audio Sound Engine (`soundApi`)** | Reliable first-gesture unlock + hover `drop`/`bubble`/`tick` + hold pitch ramp + modal `pop`/`unpop` + ambient lofi loop | Full Web Audio graph (`drop`, `bubble`, `tick`, `pop`, `unpop`, 4-chord Rhodes loop) | **Audio Unlock Bug**: `script.js:2100` sets `unlocked = audioCtx.state === "running" || true;` with `{ once: true }` listeners—if the first gesture doesn't resume `AudioContext`, `unlocked` becomes `true` while audio stays permanently suspended |
| **Case Study Pages (`work/*.html`)** | `Back to home` + `Next project` topbar, headline metric cards, sticky chapter tracker, `01–04` visual feature blocks, full cursor/sound/filter parity | 4 pages (`commercial-lending-risk`, `document-intelligence`, `network-assurance`, `open-banking-apis`) with `body.jrp-landing.jrp-case-page` | **Missing DOM & Visual Gaps on `work/*.html`**: (1) Missing `<svg class="jrp-svg-defs">`, `<div class="jrp-progress">`, `<div class="jrp-cursor-pill">`, `<div class="jrp-liquid-tip">`, and `.jrp-sound-tip` across all 4 case pages; (2) Missing top-right `Next Case Study →` quick link in the case hero topbar; (3) `commercial-lending-risk` & `open-banking-apis` lack visual before/after comparison blocks |

---

## 3. Step-by-Step Implementation Plan to Fill the Gaps & Enhance Your Portfolio

### Phase 1: Fix Core Wiring Bugs (Immediate High-Impact Fixes)
1. **Wire `#liquid-melt` + Per-Character Pixel Melt on Hover & Scroll (`styles.css` & `script.js`)**
   - Apply `filter: url(#liquid-melt)` to `.jrp-hero__name` when pointer is active in the hero or when scrolling past the hero.
   - Add per-character liquid blur/stretch and turbulence frequency modulation (`feTurbulence` + `feDisplacementMap`) on `.jrp-char` hover so hovering across `"Apratim Sarkar"` produces the signature Awwwards "Melting Pixel Title" effect.
2. **Fix Audio Unlock State Machine (`script.js`)**
   - Replace `unlocked = audioCtx.state === "running" || true;` at `script.js:2100` with a real state check (`audioCtx.resume().then(() => { unlocked = audioCtx.state === "running"; syncUI(); })`) and keep gesture listeners active until `audioCtx.state === "running"` is genuinely achieved.
3. **Fix Navbar Active Link Selector & Section ID Mismatch (`index.html`, `script.js`, `styles.css`)**
   - Update `script.js:1266` to query `.jrp-nav__links a[href^="#"]` so navbar active-section highlighting works natively in the `jrp-landing` runtime.
   - Fix `styles.css:13922` from `#genai .jrp-display` to `#more-work .jrp-display`.
4. **Fix Case Study Pages (`work/*.html`) Missing SVG Filters, Cursor Pill, Progress Bar & Sound Tooltip**
   - Inject the shared `<svg class="jrp-svg-defs">`, `<div class="jrp-progress">`, `<div class="jrp-cursor-pill">`, `<div class="jrp-liquid-tip">`, and navbar `.jrp-sound-tip` into all 4 `work/*.html` files so cursor pills, right-edge reading progress, sound tooltips, and liquid SVG filters (`#work-liquid-0..3`) work identically on case study pages.

### Phase 2: Complete the Signature `jithinrp.com` Interactive Elements
5. **Add "Draw an A to Enter" Interactive Liquid Gesture Intro + `?lite` Mode (`index.html`, `styles.css`, `script.js`)**
   - Create a sleek, optional first-visit overlay (`sessionStorage`-guarded so it never annoys returning navigations) with a 2D water-ripple canvas where drawing an `"A"` (for Apratim) or clicking `"Skip intro"` ripples open the page with a WebGL/canvas liquid reveal and unlocks Web Audio naturally on the gesture.
   - Support `?lite` URL parameter (and a `"Slow connection? Open light version"` button on the loader) to disable heavy filters/WebGL when requested.
6. **Upgrade "Hold to Open: Bubble Burst" & Interactive Water Surface (`styles.css` & `script.js`)**
   - Add a radial expanding bubble ring and gooey scale morph to `.jrp-cursor-pill` and `.jrp-monolith` driven by `--hold` (`0 → 1`), paired with a continuous rising pitch in `soundApi` during the hold and `soundApi.unpop()` if the user releases before `680ms`.
   - Enhance `.jrp-work__pond` with an interactive 2D canvas water-wave meniscus around the monolith cards that reacts to pointer velocity and scroll touchdown.
7. **Add "Play Game" Interactive Systems Mini-Game / Playground (`memory/` or Modal Drawer)**
   - Add a `"Play Game"` button in the navbar (matching `jithinrp.com`'s `Play Game` link) that opens an interactive **"AI & Systems Architecture Memory Match"** (matching pairs of ML/RAG/System icons—Python, GRAG, FastAPI, Kubernetes, Credit Risk, Time-Series, OpenAPI, Vision OCR—with flip animations, move counter, best-time tracker, and Web Audio water/bubble sound effects).
8. **Add Direct Resume Action in Navbar & Contact (`index.html`)**
   - Add a clean `Resume` link/action in the navbar and in the 3-cell Contact grid (`Email` · `LinkedIn` · `Resume / Selected Works`) so recruiters can reach your CV in one click just like on `jithinrp.com`.

### Phase 3: Content, Carousel & Case-Study Visual Upgrades
9. **Convert `.jrp-track--quotes` into a True Seamless Infinite Loop & Diversify Proof (`index.html` & `script.js`)**
   - Clone the quote figures with `aria-hidden="true"` and drive the strip with a continuous `translate3d` loop (pausing on hover/drag/focus) instead of ping-pong `scrollLeft` reversal.
   - Differentiate `.jrp-quotes` from `.jrp-awards` so `.jrp-awards` highlights the 3 formal honors while `.jrp-quotes` showcases concrete engineering & leadership impact narratives.
10. **Enrich the 7 Secondary Project Modals & Case Study Visual Chapters (`index.html` & `work/*.html`)**
    - Add compact SVG system-flow diagrams and stack badges inside each of the 7 `<dialog class="jrp-modal">` popups so clicking a card in `#more-work` reveals a visual architecture breakdown, not just 3 paragraphs of text.
    - Add `Next Case Study →` top-right navigation and visual before/after workflow comparison blocks to `work/commercial-lending-risk.html`, `work/network-assurance.html`, and `work/open-banking-apis.html` to match the visual pacing of `jithinrp.com/slot-booking`.
