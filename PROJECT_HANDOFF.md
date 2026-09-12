# Project Handoff: Prompt & Agent Generation Platform
**Prepared for: import into Antigravity IDE (or any dev environment/AI coding tool)**

This document contains the full project context, architecture decisions, and
requirements so a build can proceed without missing details or re-deriving
decisions already made. Read this in full before writing code.

---

## 1. Project Identity

- **Name**: Prompt by Niti
- **Domain**: promptbyniti.in
- **Founder/Builder**: Nitin
- **What it is**: An AI prompt + AI agent generation platform. NOT a static
  prompt-text marketplace (that model is commoditized/low-value as of 2026
  market research) — the product generates structured, reusable AI agent
  files, with prompt generation as the low-friction entry point.

## 2. Existing System (already built — do not discard)

### 2.1 Core platform stack
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Backend**: React 19 (client), Express.js (API), MongoDB (data)
- **AI**: Gemini API (primary), Grok API (secondary/being integrated)
- **Payments**: Razorpay
- **Media storage**: Cloudinary
- **Core features already live**: credit-based generation engine, prompt
  marketplace, community chat, admin dashboard

### 2.2 Current UI (see attached screenshot reference: "Prompt Generator" hero)
- Hero: "Prompt Generator" — "Describe your vision and our AI will craft the
  perfect prompt for you"
- Credit balance shown top-center (e.g. "100000 credits remaining")
- Two top-level modes: **Prompt Mode** / **Example Mode**
- Three content-type tabs: **Image** / **Video** / **Text**
- Controls per generation: description textarea (char-limited), Upload
  Image, "Same Scene" toggle (character/scene consistency), aspect ratio
  selector, model selector (currently Google Gemini), credit cost indicator
  ("Normal (1 Credit)")

### 2.3 Character consistency system (core differentiator — do not remove)
- Locked character identity block + 3 swappable variables: clothes,
  background, action
- Three reference-image modes:
  - **Mode 1**: same character, small changes
  - **Mode 2**: fixed style, swapped character
  - **Mode 3**: fixed character, changed background
- 82 complete prompt packs across 12 categories already generated for the
  text generation system
- Full architecture documented in a 35-page internal Word doc with 7
  Graphviz diagrams (exists already — not attached here, referenced for
  context only)

## 3. Direction Decided in Planning (this is the agreed pivot — build toward this)

**Old plan**: pure prompt marketplace (sell prompt text/packs)
**New plan**: prompt generation (front door) + agent generation (paid
differentiator), same generation engine powering both

### Why (market research conducted during planning, informs pricing/positioning)
- AI prompt marketplace market: $1.94B (2025) → projected $2.51B (2026) →
  $7.01B (2030), but raw single-prompt sales ($1.99-style) are commoditized
- Money has moved to: packaged, reusable "skill" files (structured workflow
  files, not raw prompt strings) and niche professional bundles ($29-69)
  rather than one-off text
- PromptBase itself added an "Agent Skills" category in May 2026, alongside
  dedicated ChatGPT Skill / Claude Skill categories — market is actively
  shifting from prompts to packaged agent logic
- Reference: skill-based sellers cited earning $436+ from a single $7 skill
  with ~89 installs; niche professional bundles priced $29-69 outperform
  $1.99 one-liners

### Agreed product structure
1. **Prompt Mode** (existing, keep as-is) — free/cheap entry point, instant
   gratification, matches user expectations from free AI tools, drives
   trust and retention
2. **Agent Mode** (NEW — add as a third top-level mode next to Prompt
   Mode/Example Mode) — the paid differentiator. Takes the same underlying
   generation logic but outputs a portable, reusable file instead of a
   single prompt
3. Same Image/Video/Text sub-tabs apply inside Agent Mode too
4. Same credit system — Agent Mode costs more credits than a single prompt
   (more backend work: structuring + file assembly)
5. Marketplace layer (future): users can sell agents they've built via the
   generator, revenue-share model (comparable to PromptBase's 80/20 or
   Agensi's 70/30 creator split — exact split TBD by Nitin)

### Heading/positioning direction (decided)
- Tagline direction: "AI Prompt & Agent Generation" (cleaner than "AI
  Prompts and AI Agents Generation" — avoids mixing noun/verb forms)
- Consider keeping "Prompt Generator" as the literal H1 (already recognizable,
  working hook) and adding a smaller subheading introducing Agent Mode,
  rather than replacing the whole hero

## 4. Agent File Generation Logic (decided, ready to implement)

### 4.1 Input → Output branching (exact decision tree)

| User input | Output format | Reason |
|---|---|---|
| Description only, no image | `.md` file | Lightweight, portable — pastes into ChatGPT custom instructions, Claude Projects, Cursor rules, etc. |
| Description + reference image | `.docx` file | Needs to embed the image inline — `.md` can't natively carry embedded images the way Word can |

**Refinement decided but not yet built**: even for image-based agents, also
generate a companion `.md` with a text-only description of the image (for
tools that can't ingest embedded images), so users get both formats bundled.

### 4.2 `.md` (text-only agent) — required sections
- Agent role/persona definition
- Task rules and constraints
- Output format spec
- Example input/output pair (few-shot)
- Any locked variables the user specified

### 4.3 `.docx` (image-referenced agent) — required sections
- Same structured sections as `.md` above
- Reference image embedded directly under a "Visual Reference" heading
- A written breakdown *of* the image (auto-generated — see Section 5) so
  even text-only AI tools downstream get equivalent context
- Locking instructions specific to the image (e.g. "maintain this exact
  character/style/framing — do not deviate")

### 4.4 Generation studio flow (backend logic)
1. Form/chat input captures description + optional image upload
2. Branch: image present → route to doc-builder; image absent → route to
   md-builder
3. Gemini API call structures the raw description into agent format
4. If image present: run image pre-analysis (Section 5) → auto-generate the
   "visual reference breakdown" text → embed original image + description
   into a `.docx` using a doc-generation library (e.g. `docx` npm package or
   python-docx if the doc-builder is a Python service)

## 5. Image Pre-Analysis Service (BUILT — code included in this handoff)

To prevent the AI (Gemini/Grok) from making mistakes when reading faces from
a reference image, a Python microservice was built to extract **structured,
verified facial data** and send it ALONGSIDE the image to Gemini — giving
the AI hard data to anchor to instead of only visual guessing. This is what
gets you toward reliable, repeatable character consistency.

### 5.1 What it does
- Uses **MediaPipe** (NOT `face_recognition`/dlib — faster, no heavy compile
  step, actively maintained, gives 478 landmarks + iris tracking)
- Extracts: face shape (geometric ratio classification), eye spacing,
  skin tone (hex, sampled from forehead/cheeks), eye color (hex, sampled
  from iris landmarks), top expression/blendshape features, precise face
  bounding box
- Returns compact JSON designed to be pasted directly into a Gemini prompt
  as structured context

### 5.2 Architecture
```
User uploads image
      |
      v
Node/Express backend (existing)
      |
      v
Python FastAPI service (NEW — port 8001, internal only)
  - MediaPipe face landmark analysis
  - Returns JSON in ~4-30ms once warm
      |
      v
Node backend combines: original image + JSON analysis
      |
      v
Gemini API call (image + structured JSON as context)
      |
      v
Output routed to .md or .docx per Section 4.1
```

### 5.3 Performance (measured during build, verified working)
- Model loads ONCE at service startup (lazy singleton) — not per request.
  This is the single biggest speed lever.
- Warm-request speed: **4-28ms** per image (measured directly against the
  analysis function in this environment)
- Images auto-downsized to max 1024px width before analysis (phone camera
  uploads can be 4000px+ — this keeps things fast without losing landmark
  accuracy)
- 8MB upload cap (adjustable)

### 5.4 Files delivered (see accompanying code bundle)
- `face_analyzer.py` — core MediaPipe analysis logic
- `main.py` — FastAPI HTTP wrapper (`POST /analyze-face` endpoint)
- `node-integration-example.js` — Express route showing exact integration:
  receive upload → call Python service → combine with Gemini call → branch
  to `.md`/`.docx` output
- `requirements.txt` — Python dependencies
- `README.md` — full setup instructions

### 5.5 One manual setup step required
The MediaPipe face landmark model file (`face_landmarker.task`, ~3.7MB) must
be downloaded once during deployment — it could not be bundled into this
handoff. Two working sources (both verified during build):
```bash
# Official source
curl -L -o face_landmarker.task \
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

# Mirror (if the above is blocked on your network) — verified same file, 3,758,596 bytes
curl -L -o face_landmarker.task \
  "https://github.com/sanderdesnaijer/mediapipe-model-mirrors/releases/download/v1/face_landmarker.task"
```

## 6. What Is NOT Yet Built (next steps for whoever picks this up)

1. **`.docx` generation step** — embedding the reference image + analysis
   breakdown + agent instructions into a downloadable Word file. Not yet
   built. (`python-docx` or Node `docx` package are the natural choices —
   decide based on whether the doc-builder lives in the Python service or
   the Node backend.)
2. **Agent Mode UI** — the third top-level mode button, the generation form,
   and the output preview/download screen. Not yet designed or built.
3. **Auto-generated "visual reference breakdown" text** — using Gemini
   vision to turn the image + MediaPipe JSON into a written paragraph
   description for the `.docx`. Not yet built (logic is described in
   Section 4.3 but no code exists yet).
4. **Marketplace revenue-share mechanics** for user-sold agents — exact
   split % undecided.
5. **Homepage hero copy update** — decided direction in Section 3 but not
   implemented in the actual Next.js codebase.

## 7. Explicit Constraints / Things Not To Do

- Do not remove or replace the existing Prompt Mode / Image-Video-Text tabs
  — Agent Mode is additive, not a replacement
- Do not replace Gemini/Grok API calls with the Python service — the Python
  service is a pre-processing step that runs BEFORE the AI call, never a
  substitute for it
- Do not use `face_recognition`/dlib — MediaPipe was specifically chosen for
  speed and deployment simplicity
