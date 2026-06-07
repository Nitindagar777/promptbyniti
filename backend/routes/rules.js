const CREATIVE_RULES = {
  "Story Creation": {
    "name": "Story Creation Prompt",
    "description": "Optimize generation for story creation category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{story_concept}}",
        "desc": "Story concept",
        "type": "Text Input"
      },
      {
        "label": "{{genre}}",
        "desc": "Genre",
        "type": "Dropdown"
      },
      {
        "label": "{{story_length}}",
        "desc": "Story length",
        "type": "Text Input"
      },
      {
        "label": "{{narrative_style}}",
        "desc": "Narrative style",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a master storyteller and published fiction author.\n\nConcept: {{story_concept}}\nGenre: {{genre}}\nLength: {{story_length}}\nStyle: {{narrative_style}}\n\nYour task:\nSTORY ARCHITECTURE FIRST:\n→ Logline: 1 sentence — [Protagonist] must [Goal] \n  before [Stakes] or else [Consequence]\n→ Theme: the deeper truth this story explores\n→ Core conflict: Internal (character vs self) + \n  External (character vs world)\n\nSTORY STRUCTURE (3-Act):\nACT 1 — SETUP (25%)\n→ Ordinary world established\n→ Inciting incident that disrupts everything\n→ First plot point: hero commits to the journey\n\nACT 2 — CONFRONTATION (50%)\n→ Rising obstacles and complications\n→ Midpoint shift: everything changes direction\n→ Dark night of the soul: lowest point for protagonist\n→ Second plot point: decision that leads to climax\n\nACT 3 — RESOLUTION (25%)\n→ Climax: final confrontation\n→ Resolution: new normal established\n→ Thematic payoff: show don't tell the message\n\nWRITE THE STORY in {{narrative_style}} for {{story_length}}\n→ Every scene must: advance plot OR reveal character — ideally both\n→ Show emotions through action and dialogue — never tell\n→ End each chapter/section on a micro-hook"
  },
  "Character Creation": {
    "name": "Character Creation Prompt",
    "description": "Optimize generation for character creation category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{character_concept}}",
        "desc": "Character concept",
        "type": "Text Input"
      },
      {
        "label": "{{story_genre}}",
        "desc": "Story genre",
        "type": "Dropdown"
      },
      {
        "label": "{{character_role}}",
        "desc": "Character role",
        "type": "Text Input"
      },
      {
        "label": "{{depth_level}}",
        "desc": "Depth level",
        "type": "Dropdown"
      }
    ],
    "promptTemplate": "You are a master character designer and narrative psychologist.\n\nCharacter Concept: {{character_concept}}\nGenre: {{story_genre}}\nRole: {{character_role}}\nDepth: {{depth_level}}\n\nYour task:\nLAYER 1 — SURFACE (Who they appear to be)\n→ Name + age + physical description (3 defining features only)\n→ Occupation + social status + world position\n→ First impression: what strangers think of them\n\nLAYER 2 — CHARACTER CORE\n→ Want: what they consciously pursue\n→ Need: what they actually need (often opposite of want)\n→ Wound: the past event that shaped everything\n→ Lie they believe: the false belief driving bad decisions\n→ Truth they must learn: the character arc destination\n\nLAYER 3 — PSYCHOLOGY\n→ Personality: 3 dominant traits + 2 contradictory traits\n→ Strengths: what makes them compelling and capable\n→ Fatal flaw: the one thing that will be their undoing\n→ Fear: what they avoid at all costs\n→ Coping mechanism: how they handle stress and pain\n\nLAYER 4 — VOICE & BEHAVIOR\n→ How they speak: sentence length, vocabulary, verbal tics\n→ Body language tells: what they do when nervous/happy/angry\n→ Decision-making style: impulsive / calculated / emotional / logical\n→ Relationship patterns: how they treat people they love vs hate\n\nLAYER 5 — CHARACTER ARC\n→ Where they start (beginning belief)\n→ What challenges that belief (story pressures)\n→ Who they become (end state — changed or tragically unchanged)"
  },
  "Brainstorming": {
    "name": "Brainstorming Prompt",
    "description": "Optimize generation for brainstorming category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{brainstorm_topic}}",
        "desc": "Brainstorm topic",
        "type": "Text Input"
      },
      {
        "label": "{{brainstorm_mode}}",
        "desc": "Brainstorm mode",
        "type": "Text Input"
      },
      {
        "label": "{{output_goal}}",
        "desc": "Output goal",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a world-class creative director and ideation facilitator.\n\nTopic: {{brainstorm_topic}}\nMode: {{brainstorm_mode}}\nGoal: {{output_goal}}\n\nYour task:\nPHASE 1 — REFRAME THE CHALLENGE\n→ Restate the problem in 3 different ways\n→ Ask: \"What if we couldn't do it the obvious way?\"\n→ Identify hidden assumptions baked into the challenge\n\nPHASE 2 — IDEATION ({{brainstorm_mode}})\n→ Free Ideation: quantity over quality — generate 100 ideas, no filters\n→ SCAMPER: Substitute / Combine / Adapt / Modify / \n  Put to other use / Eliminate / Reverse\n→ Reverse Brainstorm: how to make this WORSE? Then flip each answer\n→ Six Hats: White (facts) / Red (emotion) / Black (risks) / \n  Yellow (benefits) / Green (creativity) / Blue (process)\n→ Worst Possible Idea: generate terrible ideas → \n  mine them for hidden gold\n\nPHASE 3 — FILTER & REFINE\n→ Sort ideas into clusters by theme\n→ Score top ideas: Originality × Feasibility × Impact\n→ Identify: 1 safe idea / 1 bold idea / 1 wild card idea\n\nPHASE 4 — DEVELOP TOP 3\n→ For each top idea:\n   Core concept → Why it works → \n   How to execute → Potential obstacles"
  },
  "Roleplay": {
    "name": "Roleplay Prompt",
    "description": "Optimize generation for roleplay category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{roleplay_scenario}}",
        "desc": "Roleplay scenario",
        "type": "Text Input"
      },
      {
        "label": "{{roleplay_type}}",
        "desc": "Roleplay type",
        "type": "Dropdown"
      },
      {
        "label": "{{player_role}}",
        "desc": "Player role",
        "type": "Text Input"
      },
      {
        "label": "{{tone}}",
        "desc": "Tone",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a master roleplay narrator, game master, and interactive storyteller.\n\nScenario: {{roleplay_scenario}}\nType: {{roleplay_type}}\nYour Role: {{player_role}}\nTone: {{tone}}\n\nWORLD SETUP:\n→ Setting description (time, place, atmosphere in 3 sentences)\n→ Current situation: what has just happened before scene opens\n→ Stakes: what is at risk in this scenario\n→ Rules of this world: any special mechanics or limitations\n\nCHARACTER BRIEFING:\n→ Who I am playing (AI character): name, personality, motivation, \n  speech pattern\n→ Who you are playing: context clues for your role as {{player_role}}\n→ Our relationship: how do we know each other, what is the dynamic\n\nSCENE OPENING:\n→ Set the scene vividly in 2–3 paragraphs\n→ Open with your character in the middle of an action or line of dialogue\n→ End the opening on a decision point or question directed at the player\n\nINTERACTION RULES:\n→ I will respond in character to your every action\n→ I will advance the story based on your choices\n→ I will introduce complications when the scene needs tension\n→ I will never break character unless you type [OOC: message]\n→ Stakes escalate every 3–4 exchanges"
  },
  "Fiction Writing": {
    "name": "Fiction Writing Prompt",
    "description": "Optimize generation for fiction writing category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{fiction_request}}",
        "desc": "Fiction request",
        "type": "Text Input"
      },
      {
        "label": "{{genre}}",
        "desc": "Genre",
        "type": "Dropdown"
      },
      {
        "label": "{{writing_element}}",
        "desc": "Writing element",
        "type": "Text Input"
      },
      {
        "label": "{{prose_style}}",
        "desc": "Prose style",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a celebrated fiction author with mastery of literary craft.\n\nRequest: {{fiction_request}}\nGenre: {{genre}}\nFocus: {{writing_element}}\nStyle: {{prose_style}}\n\nCRAFT RULES FOR THIS PIECE:\n→ Show don't tell — emotions through action, not narration\n→ Every line of dialogue must: reveal character OR advance plot\n→ Sensory detail: at least 3 senses per scene (not just visual)\n→ Sentence variety: mix short punchy sentences with longer flowing ones\n→ Subtext: what characters DON'T say is as important as what they do\n→ Scene structure: every scene needs a beginning tension + \n  shift + new situation\n\nPROSE STYLE GUIDE:\n→ Minimalist: short sentences, white space, implication over explanation\n→ Lyrical: rhythm matters — read aloud to test, use imagery and metaphor\n→ Cinematic: scene before thought — describe what camera would see first\n→ Atmospheric: environment reflects character's inner state (pathetic fallacy)\n→ Intimate: close third person — deep in character's sensory experience\n\nWRITE THE {{writing_element}}:\n→ Open in media res — in the middle of something happening\n→ Establish: who / where / what is at stake within first paragraph\n→ Build to: a moment of change, decision, revelation, or impact\n→ End on: an image, line of dialogue, or thought that lingers"
  },
  "World Building": {
    "name": "World Building Prompt",
    "description": "Optimize generation for world building category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{world_concept}}",
        "desc": "World concept",
        "type": "Text Input"
      },
      {
        "label": "{{genre}}",
        "desc": "Genre",
        "type": "Dropdown"
      },
      {
        "label": "{{build_focus}}",
        "desc": "Build focus",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a legendary world builder — the architect of fictional universes.\n\nWorld Concept: {{world_concept}}\nGenre: {{genre}}\nFocus: {{build_focus}}\n\nYOUR WORLD BUILDING BIBLE:\n\nSECTION 1 — THE WORLD AT A GLANCE\n→ World name + 3-sentence elevator pitch\n→ The ONE thing that makes this world completely unique\n→ The central conflict baked into the world's design\n→ Tone: (dark / hopeful / ambiguous / mythic / gritty)\n\nSECTION 2 — PHYSICAL WORLD\n→ Geography: continents, regions, key locations\n→ Climate and environment: how it shapes the people\n→ Notable locations: 5 places the reader must visit\n→ [MAP DESCRIPTION: describe what the map would show]\n\nSECTION 3 — SOCIETY & PEOPLE\n→ Major groups/races/species: 3 with distinct culture + worldview\n→ Social structure: class, hierarchy, power dynamics\n→ Daily life: what ordinary people eat, believe, fear, celebrate\n→ Cultural tensions: what groups are in conflict and why\n\nSECTION 4 — POWER SYSTEMS\n→ Magic System (Fantasy): source / rules / cost / limits\n→ Technology System (Sci-Fi): what exists / what doesn't / who controls it\n→ The ONE rule of this system that can NEVER be broken\n\nSECTION 5 — HISTORY & MYTHOLOGY\n→ 3 world-shaping historical events and their lasting effects\n→ Creation myth: how this world's people believe it began\n→ The wound in this world's past that still bleeds into the present\n\nSECTION 6 — STORY HOOKS\n→ 5 stories that could only happen in THIS world\n→ The question this world forces every character to answer"
  }
};

const SOCIAL_MEDIA_RULES = {
  "Content Creation": {
    "name": "Content Creation Prompt",
    "description": "Optimize generation for content creation category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{brand_or_creator}}",
        "desc": "Brand or creator",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{content_pillar}}",
        "desc": "Content pillar",
        "type": "Text Input"
      },
      {
        "label": "{{content_format}}",
        "desc": "Content format",
        "type": "Dropdown"
      }
    ],
    "promptTemplate": "You are an expert social media content strategist and creator.\n\nBrand/Creator: {{brand_or_creator}}\nPlatform: {{platform}}\nPillar: {{content_pillar}}\nFormat: {{content_format}}\n\nYour task:\nCONTENT BRIEF:\n→ Content angle: the specific idea within {{content_pillar}}\n→ Target emotion: what should the viewer FEEL after consuming this?\n→ Core message: 1 sentence — what do they take away?\n\nHOOK (First 3 seconds — most critical):\n→ Hook Option 1: Curiosity-based\n→ Hook Option 2: Shock or bold claim\n→ Hook Option 3: Relatable pain point\n→ Visual hook direction: [what appears on screen in frame 1]\n\nCONTENT STRUCTURE for {{content_format}}:\n→ Single Post: Hook → Value → CTA (3-layer structure)\n→ Carousel: Slide 1 (hook) → Slides 2–8 (value) → \n  Last slide (CTA + save prompt)\n→ Reel/Video: Hook → Setup → Payoff → CTA (pacing notes included)\n→ Story: Frame 1 (hook) → Frame 2–4 (value) → Frame 5 (CTA)\n\nCOPY:\n→ Full post copy written and ready to publish\n→ Caption (platform-appropriate length)\n→ CTA (specific and low-friction)\n\nVISUAL DIRECTION:\n→ [VISUAL: describe exactly what to show/film/design]\n→ Color/mood direction\n→ Text overlay suggestions if applicable"
  },
  "Post Generation": {
    "name": "Post Generation Prompt",
    "description": "Optimize generation for post generation category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{topic_or_idea}}",
        "desc": "Topic or idea",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{brand_voice}}",
        "desc": "Brand voice",
        "type": "Text Input"
      },
      {
        "label": "{{post_goal}}",
        "desc": "Post goal",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are an expert social media copywriter and growth strategist.\n\nTopic: {{topic_or_idea}}\nPlatform: {{platform}}\nVoice: {{brand_voice}}\nGoal: {{post_goal}}\n\nYour task:\nWrite 3 POST VARIATIONS for A/B testing:\n\nFOR EACH VARIATION:\n\nVERSION A — [Strategy Name]:\n→ Hook (Line 1 — must stop the scroll)\n→ Body copy (platform-appropriate length and format)\n→ CTA (one specific action — comment / save / click / share)\n→ Hashtags: 3 niche + 3 mid + 2 broad (only for Instagram/TikTok)\n→ Best time to post: [day + time recommendation]\n→ Predicted engagement type: (comments / shares / saves / clicks)\n\nVERSION B — [Different angle]:\n[Same structure, completely different hook and angle]\n\nVERSION C — [Bold/experimental]:\n[Same structure, most daring or unconventional approach]\n\nAFTER ALL 3 VERSIONS:\n→ Recommended version for {{post_goal}} and why\n→ What to test first if running A/B\n→ Repurposing tip: how to turn this into 3 more posts"
  },
  "Caption Writing": {
    "name": "Caption Writing Prompt",
    "description": "Optimize generation for caption writing category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{post_visual_description}}",
        "desc": "Post visual description",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{caption_style}}",
        "desc": "Caption style",
        "type": "Text Input"
      },
      {
        "label": "{{brand_voice}}",
        "desc": "Brand voice",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are an expert caption writer and social media brand voice specialist.\n\nPost/Visual: {{post_visual_description}}\nPlatform: {{platform}}\nStyle: {{caption_style}}\nVoice: {{brand_voice}}\n\nYour task:\nWrite 3 CAPTION OPTIONS:\n\nCAPTION 1 — Primary ({{caption_style}}):\n→ LINE 1: Hook — the sentence that makes them tap \"more\"\n→ BODY: Caption in {{caption_style}} format and {{brand_voice}} voice\n→ WHITE SPACE: Line breaks used strategically for readability\n→ CTA: Specific engagement prompt (comment / save / share / tag)\n→ HASHTAGS: If applicable — placed at end or first comment\n→ EMOJI USAGE: Sparingly and purposefully — not decorative\n\nCAPTION 2 — Alternative angle:\n[Same visual, completely different emotional angle or story]\n\nCAPTION 3 — Minimalist version:\n[Maximum 3 lines — for audiences who prefer brevity]\n\nFOR EACH CAPTION:\n→ Estimated read time\n→ Primary emotion it triggers\n→ Best use case: (feed post / story / reel caption / pin description)"
  },
  "Community Growth": {
    "name": "Community Growth Prompt",
    "description": "Optimize generation for community growth category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{community_or_brand}}",
        "desc": "Community or brand",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{growth_goal}}",
        "desc": "Growth goal",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a community growth strategist and social media growth expert.\n\nCommunity/Brand: {{community_or_brand}}\nPlatform: {{platform}}\nGoal: {{growth_goal}}\n\nYour task:\nPHASE 1 — COMMUNITY AUDIT & FOUNDATION\n→ Define: who is this community FOR (hyper-specific ICP)\n→ Define: what transformation does this community provide?\n→ Define: community identity — the \"we believe...\" statement\n→ Current state assessment checklist\n\nPHASE 2 — GROWTH STRATEGY for {{growth_goal}}\n→ 0–1K: Seed strategy — manual outreach, collaborations, \n  niche hashtags, daily engagement hours\n→ 1K–10K: Amplification — viral content formula, \n  collab posts, share-worthy formats\n→ 10K–100K: Systemize — content calendar, team, \n  algorithm optimization, paid amplification\n→ Re-engage: Win-back campaign — pattern interrupt \n  content, exclusive offer, direct outreach to top fans\n\nPHASE 3 — ENGAGEMENT SYSTEM\n→ Comment strategy: how to respond to drive more comments\n→ Engagement pods: how to set up without being spammy\n→ Community rituals: weekly recurring content that builds habit\n→ Superfan identification: how to spot and nurture them\n→ UGC strategy: get community to create content for you\n\nPHASE 4 — 30-DAY GROWTH SPRINT\n→ Week 1: Foundation and seed content\n→ Week 2: Engagement and collaboration push\n→ Week 3: Viral attempt — highest effort content\n→ Week 4: Analyze, double down on what worked\n→ Daily minimum actions: (engagement / posting / outreach)"
  },
  "Thread Writing": {
    "name": "Thread Writing Prompt",
    "description": "Optimize generation for thread writing category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{thread_topic}}",
        "desc": "Thread topic",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{thread_goal}}",
        "desc": "Thread goal",
        "type": "Text Input"
      },
      {
        "label": "{{thread_length}}",
        "desc": "Thread length",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a viral thread writer and social media growth expert.\n\nTopic: {{thread_topic}}\nPlatform: {{platform}}\nGoal: {{thread_goal}}\nLength: {{thread_length}}\n\nYour task:\nTHREAD ARCHITECTURE:\n\nTWEET 1 — THE HOOK (Most Important):\n→ Bold claim, surprising stat, or counterintuitive statement\n→ Must create: curiosity gap — reader MUST click to see more\n→ Format: [Hook statement] + \"Here's [what/how/why]:\" + 🧵\n→ Write 3 hook options — choose the strongest\n\nTWEET 2 — THE SETUP:\n→ Establish credibility or context\n→ Make a promise: \"By the end of this thread you'll know...\"\n\nTWEETS 3 to [N-2] — THE VALUE BODY:\n→ One idea per tweet — no compound tweets\n→ Each tweet must: stand alone AND connect to the thread\n→ Use: numbers, frameworks, examples, contrasts, stories\n→ Cliffhanger every 3 tweets: \"But here's where it gets interesting...\"\n→ Format variety: some as lists, some as paragraphs, some as 1-liners\n\nTWEET [N-1] — THE PIVOT:\n→ Zoom out — connect all points to the bigger insight\n→ \"If you take nothing else from this thread, take this:\"\n\nTWEET [N] — THE CTA:\n→ Follow prompt (reason why, not just \"follow me\")\n→ Retweet/share ask with social proof angle\n→ Link to deeper resource if applicable"
  },
  "Content Calendars": {
    "name": "Content Calendars Prompt",
    "description": "Optimize generation for content calendars category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{brand_or_creator}}",
        "desc": "Brand or creator",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{calendar_duration}}",
        "desc": "Calendar duration",
        "type": "Text Input"
      },
      {
        "label": "{{niche_or_industry}}",
        "desc": "Niche or industry",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are an expert content strategist and editorial calendar designer.\n\nBrand/Creator: {{brand_or_creator}}\nPlatform: {{platform}}\nDuration: {{calendar_duration}}\nNiche: {{niche_or_industry}}\n\nYour task:\nSTEP 1 — CONTENT STRATEGY FOUNDATION\n→ Define 4–5 content pillars for {{brand_or_creator}}:\n   Pillar 1: Educate (builds authority)\n   Pillar 2: Entertain (builds audience)\n   Pillar 3: Inspire (builds emotion)\n   Pillar 4: Sell (converts)\n   Pillar 5: Community (builds loyalty)\n→ Pillar ratio: 40% Educate / 30% Entertain / \n  20% Inspire / 10% Sell\n\nSTEP 2 — POSTING SCHEDULE\n→ Optimal posting frequency for {{platform}}:\n   Instagram: 4–5x/week (3 feed + 2 Reels)\n   LinkedIn: 3–4x/week\n   TikTok: 5–7x/week\n   Twitter/X: 1–3x/day\n→ Best days and times per platform\n→ Content batching recommendation: when to create\n\nSTEP 3 — CALENDAR BUILD\nFor each post slot:\nDATE | DAY | PILLAR | FORMAT | TOPIC | HOOK IDEA | CTA\n\n→ Fill every slot for {{calendar_duration}}\n→ Include: seasonal moments, trending topics, \n  recurring series, promotional posts\n→ Mark: evergreen content vs time-sensitive content\n\nSTEP 4 — CONTENT SERIES IDEAS\n→ 3 recurring weekly series concepts:\n   Series name → format → day → what it delivers\n→ Monthly campaign idea that ties content together\n→ Repurposing plan: 1 piece of content → 5 platforms"
  }
};

const ECOMMERCE_RULES = {
  "Product Research": {
    "name": "Product Research Prompt",
    "description": "Optimize generation for product research category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{niche_or_market}}",
        "desc": "Niche or market",
        "type": "Text Input"
      },
      {
        "label": "{{business_model}}",
        "desc": "Business model",
        "type": "Text Input"
      },
      {
        "label": "{{research_output}}",
        "desc": "Research output",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a 7-figure ecommerce product researcher and sourcing expert.\n\nNiche/Market: {{niche_or_market}}\nModel: {{business_model}}\nOutput: {{research_output}}\n\nYour task:\nPHASE 1 — WINNING PRODUCT CRITERIA\n→ Define what a winning product looks like for {{business_model}}:\n   ✅ Demand: search volume, social proof, sales velocity\n   ✅ Margin: minimum 40% gross margin (60%+ for dropshipping)\n   ✅ Competition: not saturated, but proven demand exists\n   ✅ Problem-solving: solves a real pain or fulfills a strong desire\n   ✅ Visual appeal: looks great on video/image ads\n   ✅ Repeat purchase or upsell potential\n   ❌ Avoid: seasonal only, fragile, heavily branded, size-dependent\n\nPHASE 2 — PRODUCT DISCOVERY\n→ Generate 10 product ideas in {{niche_or_market}}\n→ For each product:\n   Product name → Problem it solves → Target buyer →\n   Estimated sell price → Estimated cost → Gross margin % →\n   Competition level (Low/Med/High) → Trend direction \n   (Rising/Stable/Declining)\n\nPHASE 3 — TOP 3 DEEP-DIVE\n→ For each top 3 product:\n   Market size estimate\n   Who is buying it and why (buyer psychology)\n   Top 3 competitors selling it + their weaknesses\n   Differentiation opportunity: how to make it better\n   Supplier sourcing strategy (where to find it)\n   Ad angle: what emotion or pain point to target\n\nPHASE 4 — GO / NO-GO SCORECARD\n→ Score each product 1–10 on:\n   Demand / Margin / Competition / Differentiation / Scalability\n→ Final recommendation with reasoning"
  },
  "Product Listings": {
    "name": "Product Listings Prompt",
    "description": "Optimize generation for product listings category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{product_name}}",
        "desc": "Product name",
        "type": "Text Input"
      },
      {
        "label": "{{platform}}",
        "desc": "Platform",
        "type": "Dropdown"
      },
      {
        "label": "{{target_buyer}}",
        "desc": "Target buyer",
        "type": "Text Input"
      },
      {
        "label": "{{listing_focus}}",
        "desc": "Listing focus",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are an expert ecommerce copywriter and listing optimization specialist.\n\nProduct: {{product_name}}\nPlatform: {{platform}}\nBuyer: {{target_buyer}}\nFocus: {{listing_focus}}\n\nYour task:\nPRODUCT LISTING COMPLETE PACK:\n\nTITLE (Platform-optimized):\n→ Amazon: [Brand] + [Main KW] + [Key Feature] + \n  [Size/Qty/Variant] — 200 chars max\n→ Etsy: [Adjective] + [Product] + [Occasion] + \n  [Material/Style] — 140 chars max\n→ Shopify: Benefit-led title + key differentiator\n→ Include: primary keyword naturally in first 5 words\n\nBULLET POINTS (5 bullets — Amazon/Shopify):\n→ Bullet 1: #1 BENEFIT — lead with the biggest customer win\n→ Bullet 2: KEY FEATURE + why it matters to {{target_buyer}}\n→ Bullet 3: PROBLEM SOLVED — paint the before/after\n→ Bullet 4: QUALITY/MATERIALS — build trust and justify price\n→ Bullet 5: GUARANTEE/CTA — reduce purchase anxiety\n\nFORMAT: ALL CAPS LEAD-IN → benefit explanation (2 sentences)\n\nPRODUCT DESCRIPTION:\n→ Opening hook: who this is for + the problem it solves\n→ Story section: imagine your life with this product\n→ Feature breakdown with benefit translation:\n   Feature → \"Which means you get...\" → Benefit\n→ Social proof placeholder: [X customers love this because...]\n→ Closing CTA: why buy now\n\nSEO KEYWORDS:\n→ 10 primary keywords + 20 long-tail keywords\n→ Backend search terms (Amazon): 250-byte string"
  },
  "Dropshipping": {
    "name": "Dropshipping Prompt",
    "description": "Optimize generation for dropshipping category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{dropshipping_focus}}",
        "desc": "Dropshipping focus",
        "type": "Text Input"
      },
      {
        "label": "{{store_stage}}",
        "desc": "Store stage",
        "type": "Dropdown"
      },
      {
        "label": "{{budget}}",
        "desc": "Budget",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a 7-figure dropshipping expert and ecommerce growth strategist.\n\nFocus: {{dropshipping_focus}}\nStage: {{store_stage}}\nBudget: {{budget}}\n\nYour task:\nSTAGE-SPECIFIC BLUEPRINT:\n\nIF Finding Niche:\n→ Niche evaluation criteria + 5 niche ideas with scoring\n→ Passion niches vs trend niches vs evergreen niches breakdown\n→ Red flags: niches to avoid and why\n\nIF Supplier Sourcing:\n→ Supplier tiers: AliExpress → CJ Dropshipping → \n  Private Agent → 3PL\n→ How to vet a supplier: 7-point checklist\n→ Sample order process + quality check system\n→ Backup supplier strategy (never single-source)\n\nIF Store Setup:\n→ Store structure: pages needed, layout priorities\n→ Conversion elements checklist per page\n→ Trust builders: reviews, badges, guarantees, policies\n→ Apps stack: essential 5 apps for dropshipping store\n\nIF First Sales:\n→ Testing strategy: $5–$10/day per product test\n→ Ad structure: CBO vs ABO testing framework\n→ Winner identification: metrics and thresholds\n→ First 30 days action plan (day-by-day)\n\nIF Scaling:\n→ Horizontal scaling: new ad sets, audiences, creatives\n→ Vertical scaling: budget increase rules (20% per 3 days)\n→ When to move to private label\n\nIF Automating:\n→ Tools for order processing, tracking, customer service\n→ VA hiring: what to delegate first\n→ SOPs for every repeatable task"
  },
  "Store Optimization": {
    "name": "Store Optimization Prompt",
    "description": "Optimize generation for store optimization category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{store_platform}}",
        "desc": "Store platform",
        "type": "Dropdown"
      },
      {
        "label": "{{optimization_focus}}",
        "desc": "Optimization focus",
        "type": "Text Input"
      },
      {
        "label": "{{current_cvr}}",
        "desc": "Current cvr",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a CRO (Conversion Rate Optimization) specialist \nand ecommerce growth expert.\n\nPlatform: {{store_platform}}\nFocus: {{optimization_focus}}\nCurrent CVR: {{current_cvr}}\n\nYour task:\nCRO AUDIT & OPTIMIZATION PLAN:\n\nSTEP 1 — BASELINE DIAGNOSIS\n→ Industry CVR benchmarks for {{store_platform}}\n→ Gap analysis: current {{current_cvr}} vs target CVR\n→ Revenue impact: what 1% CVR increase means in revenue\n\nSTEP 2 — PAGE-BY-PAGE AUDIT\n[For each page in {{optimization_focus}}]\n\nHOMEPAGE:\n→ Above the fold: clear value prop in 5 words or less?\n→ Navigation: can visitor find what they need in 3 clicks?\n→ Social proof: visible within first scroll?\n→ Hero section: benefit-led or feature-led?\n\nPRODUCT PAGE:\n→ Images: 6–8 images including lifestyle + detail shots?\n→ Title: benefit-led and keyword-rich?\n→ Price anchoring: original price vs sale price visible?\n→ Urgency elements: stock counter, countdown, limited offer?\n→ Reviews: visible above the fold + filter options?\n→ Add to Cart button: contrasting color, above fold?\n\nCART:\n→ Cart abandonment: exit intent popup active?\n→ Upsell: post-add-to-cart upsell offer present?\n→ Trust badges: visible at cart stage?\n\nCHECKOUT:\n→ Guest checkout available?\n→ Number of form fields: minimum possible?\n→ Payment options: includes buy-now-pay-later?\n\nSTEP 3 — PRIORITY FIX LIST\n→ Quick wins (fix today): 5 changes\n→ Medium effort (fix this week): 5 changes\n→ Long-term (fix this month): 3 strategic changes\n→ Each fix: [Problem] → [Fix] → [Expected CVR Impact]\n\nSTEP 4 — AOV OPTIMIZATION (if selected)\n→ Bundle offers + recommended price points\n→ Free shipping threshold calculation\n→ Post-purchase upsell sequence\n→ Subscription model opportunity"
  },
  "Customer Support": {
    "name": "Customer Support Prompt",
    "description": "Optimize generation for customer support category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{store_name}}",
        "desc": "Store name",
        "type": "Text Input"
      },
      {
        "label": "{{support_type}}",
        "desc": "Support type",
        "type": "Dropdown"
      },
      {
        "label": "{{issue_category}}",
        "desc": "Issue category",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a customer support expert and ecommerce operations specialist.\n\nStore: {{store_name}}\nSupport Type: {{support_type}}\nIssue Category: {{issue_category}}\n\nYour task:\nBUILD COMPLETE {{support_type}}:\n\nIF Response Templates:\nFor {{issue_category}} write 5 templates:\n\nTEMPLATE STRUCTURE:\n→ Subject line (for email)\n→ Opening: personalized, empathetic, never robotic\n→ Acknowledgment: validate their frustration first\n→ Resolution: clear, specific action being taken\n→ Timeline: exact timeframe (not \"soon\" — \"within 24 hours\")\n→ Closing: goodwill gesture + invitation to reply\n→ Sign-off: human name + store name\n\nTEMPLATE VARIATIONS:\n→ Template 1: First contact — issue just received\n→ Template 2: Follow-up — update on progress\n→ Template 3: Resolution — issue solved\n→ Template 4: Escalation — moving to senior team\n→ Template 5: Goodwill — apology + compensation offer\n\nIF Full Support System:\n→ Support tier structure: Bot → Agent → Senior → Manager\n→ SLA targets: response time per channel\n→ CSAT measurement system\n→ Knowledge base structure: 10 essential FAQ topics\n→ Refund authority levels: agent vs manager thresholds\n→ Reporting: weekly support metrics dashboard\n\nIF Chatbot Script:\n→ Welcome message + menu options\n→ Decision tree for top 5 issues\n→ Escalation trigger: when to hand to human\n→ Out-of-hours message + expectation setting"
  },
  "Sales Optimization": {
    "name": "Sales Optimization Prompt",
    "description": "Optimize generation for sales optimization category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{store_or_product}}",
        "desc": "Store or product",
        "type": "Text Input"
      },
      {
        "label": "{{sales_challenge}}",
        "desc": "Sales challenge",
        "type": "Text Input"
      },
      {
        "label": "{{optimization_lever}}",
        "desc": "Optimization lever",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are a revenue optimization specialist and ecommerce growth strategist.\n\nStore/Product: {{store_or_product}}\nChallenge: {{sales_challenge}}\nLever: {{optimization_lever}}\n\nYour task:\nSALES OPTIMIZATION BLUEPRINT:\n\nSTEP 1 — REVENUE LEAK DIAGNOSIS\n→ Identify where money is being lost in the funnel:\n   Traffic → Product Page View → Add to Cart → \n   Checkout Start → Purchase\n→ Calculate: revenue lost at each dropout stage\n→ Identify: the #1 leak to fix first\n\nSTEP 2 — CHALLENGE-SPECIFIC SOLUTIONS\n\nIF Low CVR:\n→ Product page audit: images, copy, trust signals\n→ Price positioning: too high, too low, or unclear value?\n→ Friction removal: checkout steps, payment options\n\nIF High Cart Abandonment:\n→ Exit intent popup: offer + copy template\n→ Abandoned cart email sequence: 3 emails in 24 hours\n→ Retargeting ad angle: what to show cart abandoners\n\nIF Low AOV:\n→ Bundle strategy: which products to bundle + pricing\n→ Free shipping threshold: calculate optimal amount\n→ Post-purchase upsell: timing + offer + copy\n→ Order bump: what to add at checkout\n\nIF Low Repeat Purchase:\n→ Post-purchase email sequence: 5-email win-back\n→ Loyalty program structure: points, tiers, rewards\n→ Subscription model: what to offer + discount level\n→ Win-back campaign: lapsed customer reactivation\n\nSTEP 3 — {{optimization_lever}} EXECUTION PLAN\n→ Step-by-step implementation guide\n→ Copy and messaging for each touchpoint\n→ Timeline: what to implement week 1, 2, 3, 4\n→ Success metrics: how to measure improvement\n\nSTEP 4 — REVENUE PROJECTION\n→ Current revenue baseline\n→ Projected revenue after optimization\n→ Timeline to see measurable results\n→ Priority ranking: highest ROI fix first"
  }
};

const OTHER_RULES = {
  "Personal Development": {
    "name": "Personal Development Prompt",
    "description": "Optimize generation for personal development category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{growth_area}}",
        "desc": "Growth area",
        "type": "Text Input"
      },
      {
        "label": "{{life_stage}}",
        "desc": "Life stage",
        "type": "Dropdown"
      },
      {
        "label": "{{output_type}}",
        "desc": "Output type",
        "type": "Dropdown"
      }
    ],
    "promptTemplate": "You are a world-class life coach, psychologist, and personal development strategist.\n\nGrowth Area: {{growth_area}}\nLife Stage: {{life_stage}}\nOutput: {{output_type}}\n\nYour task:\nLAYER 1 — DEEP DIAGNOSIS\n→ Reframe {{growth_area}} — what is the real underlying challenge?\n→ Root cause analysis: surface problem vs core pattern\n→ Identify: the belief system driving current results\n→ Self-awareness mirror: 5 questions that reveal blind spots\n→ Current vs desired state: the gap that needs bridging\n\nLAYER 2 — FRAMEWORK DELIVERY ({{output_type}})\n\nIF Growth Plan:\n→ 90-day transformation arc:\n   Week 1–4: Awareness + Foundation\n   Week 5–8: Action + Momentum\n   Week 9–12: Integration + Identity shift\n→ Daily non-negotiables: 3 habits that create compound growth\n→ Weekly review ritual: what to measure and reflect on\n\nIF Habit System:\n→ Habit stacking: attach new habits to existing anchors\n→ Minimum viable habit: the smallest version that still works\n→ Identity-based framing: \"I am the kind of person who...\"\n→ Habit tracker design: what to measure daily\n\nIF Life Design:\n→ Wheel of Life audit: 8 areas scored 1–10\n→ Vision statement: 5-year vivid description\n→ Anti-vision: what you are moving away from\n→ Design constraints: what is non-negotiable in your ideal life\n→ Next 12 months: what must change for vision to be possible\n\nIF Journal Prompts:\n→ 21 deep journal prompts organized by week:\n   Week 1: Self-awareness prompts\n   Week 2: Belief and pattern prompts\n   Week 3: Vision and possibility prompts\n→ Each prompt: question + why it matters + what to notice\n\nIF Confidence Builder:\n→ Confidence audit: where do you feel capable vs small?\n→ Evidence log: 10 past wins that prove your capability\n→ Exposure ladder: small → medium → big confidence challenges\n→ Inner critic reframe: identify the voice + replace the script\n\nLAYER 3 — MINDSET OPERATING SYSTEM\n→ Core belief to install: [new belief statement]\n→ Core belief to uninstall: [old limiting belief]\n→ Daily affirmation: specific, present-tense, personally relevant\n→ Trigger → Response reframe for top 3 emotional patterns\n→ Non-negotiable rule for {{life_stage}}: the one thing that changes everything\n\nLAYER 4 — ACCOUNTABILITY ARCHITECTURE\n→ Progress metrics: how to know growth is happening\n→ Review cadence: daily / weekly / monthly check-ins\n→ Course correction: what to do when motivation disappears\n→ Community / support: who needs to be in your corner"
  },
  "Career": {
    "name": "Career Prompt",
    "description": "Optimize generation for career category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{career_goal}}",
        "desc": "Career goal",
        "type": "Text Input"
      },
      {
        "label": "{{career_stage}}",
        "desc": "Career stage",
        "type": "Dropdown"
      },
      {
        "label": "{{output_type}}",
        "desc": "Output type",
        "type": "Dropdown"
      }
    ],
    "promptTemplate": "You are an elite career coach, recruiter, and personal branding strategist.\n\nGoal/Challenge: {{career_goal}}\nStage: {{career_stage}}\nOutput: {{output_type}}\n\nYour task:\nCAREER INTELLIGENCE BRIEF:\n\nSTEP 1 — CAREER AUDIT\n→ Current state: skills, experience, reputation, network strength\n→ Market value: what the market pays for your profile right now\n→ Competitive position: how you compare to others at your level\n→ Career capital: your most valuable transferable assets\n→ Blind spots: what is holding you back that you can't see\n\nSTEP 2 — STRATEGIC OUTPUT ({{output_type}})\n\nIF Job Search Plan:\n→ Target company list strategy: 3 tiers (dream/likely/safety)\n→ Application strategy: quality over quantity — 10 targeted > 100 spray\n→ Outreach templates: recruiter / hiring manager / warm intro\n→ Pipeline tracker: columns + weekly activity targets\n→ Timeline: 30/60/90 day job search milestones\n\nIF Interview Prep:\n→ Research framework: company / role / interviewer / market\n→ STAR story bank: 10 situation-action-result stories\n   covering: leadership / conflict / failure / success / \n   collaboration / innovation\n→ Question-by-question prep:\n   \"Tell me about yourself\" → 90-second elevator pitch\n   \"Why this company?\" → 3-layer answer framework\n   \"Biggest weakness?\" → honest + growth framing\n   \"Where do you see yourself?\" → ambitious + aligned answer\n→ Questions to ask them: 5 that make you memorable\n→ Post-interview follow-up: email template within 24 hours\n\nIF Salary Negotiation:\n→ Market research: how to find your true market rate\n→ Anchoring strategy: always give range, never single number first\n→ Scripts for: first offer / counter offer / final negotiation\n→ Non-salary negotiation: equity, PTO, flexibility, signing bonus\n→ Walk-away number: how to calculate your true minimum\n\nIF Career Pivot Plan:\n→ Skills gap analysis: what you have vs what the new role needs\n→ Bridge strategy: side projects, courses, volunteering to fill gaps\n→ Network bridge: who in your current network connects to new field\n→ Narrative reframing: how to tell your story as an asset not a liability\n→ Timeline: realistic 6–18 month pivot roadmap\n\nIF LinkedIn Optimization:\n→ Headline: [role] + [who you help] + [how/result]\n→ About section: 5-paragraph story arc + CTA\n→ Experience: achievement bullets, not job description bullets\n→ Featured section: what to put here and why\n→ Creator mode: content strategy for authority building\n\nSTEP 3 — 90-DAY CAREER ACTION PLAN\n→ Month 1: Foundation (clarity + positioning)\n→ Month 2: Momentum (action + outreach)\n→ Month 3: Opportunity (interview + negotiation + decision)\n→ Weekly non-negotiables: minimum actions per week"
  },
  "Fun Prompts": {
    "name": "Fun Prompts Prompt",
    "description": "Optimize generation for fun prompts category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{fun_context}}",
        "desc": "Fun context",
        "type": "Text Input"
      },
      {
        "label": "{{fun_type}}",
        "desc": "Fun type",
        "type": "Dropdown"
      },
      {
        "label": "{{group_size}}",
        "desc": "Group size",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are the world's most entertaining game master, party host, and creative challenge designer.\n\nContext: {{fun_context}}\nType: {{fun_type}}\nGroup: {{group_size}}\n\nYour task:\nCREATE A COMPLETE FUN EXPERIENCE:\n\nOPENING ENERGY SETTER:\n→ How to introduce this activity (30-second hype speech)\n→ Energy level: Calm / Lively / Chaotic / Competitive\n→ Materials needed (if any)\n\nMAIN CONTENT — 20 prompts for {{fun_type}}:\n\nIF Party Games:\n→ Rules explained simply (1 paragraph max)\n→ 20 game prompts/rounds ready to use\n→ Scoring system if competitive\n→ Winning condition + prize idea\n\nIF Icebreakers:\n→ 20 questions that go from safe → interesting → memorable\n→ Format: question + why it sparks connection\n→ Follow-up questions for each to go deeper\n\nIF Creative Challenges:\n→ 10 challenges with: brief + rules + time limit + judging criteria\n→ Difficulty: Easy / Medium / Wild Card\n\nIF Would You Rather:\n→ 20 dilemmas that are genuinely hard to choose\n→ Mix: funny / thought-provoking / deeply personal / absurd\n\nIF Storytelling Game:\n→ 10 opening lines that launch stories\n→ Prompts for each player's turn to continue\n→ Story ending challenge: most satisfying vs most absurd\n\nIF Debate Prompts:\n→ 15 topics that have no clear right answer\n→ Format: motion + for side + against side + wild card argument\n\nBONUS ROUND:\n→ 5 extra spicy/unexpected prompts for when energy drops\n→ Variation for online groups if applicable"
  },
  "Experimental": {
    "name": "Experimental Prompt",
    "description": "Optimize generation for experimental category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{experiment_idea}}",
        "desc": "Experiment idea",
        "type": "Text Input"
      },
      {
        "label": "{{experiment_type}}",
        "desc": "Experiment type",
        "type": "Dropdown"
      },
      {
        "label": "{{output_style}}",
        "desc": "Output style",
        "type": "Text Input"
      }
    ],
    "promptTemplate": "You are an experimental thinker, philosopher, avant-garde writer, and boundary-pushing creative intelligence.\n\nExperiment: {{experiment_idea}}\nType: {{experiment_type}}\nStyle: {{output_style}}\n\nYour task:\nBREAK THE EXPECTED FORMAT — this is an experimental prompt.\n\nBEFORE BEGINNING:\n→ Identify: what is the conventional response to this topic?\n→ Commit: to doing the OPPOSITE or UNEXPECTED\n→ State: the one assumption you are intentionally violating\n\nEXPERIMENTAL FRAMEWORK ({{experiment_type}}):\n\nIF Philosophical Exploration:\n→ Approach the idea from 4 philosophical traditions simultaneously\n→ Find the contradiction at the center of the idea\n→ End with a question that has no answer — only better questions\n\nIF Thought Experiment:\n→ Establish the imagined scenario with rigorous internal logic\n→ Follow the implications wherever they lead — no hedging\n→ Reveal: the insight hidden inside the absurd premise\n\nIF Paradox Analysis:\n→ State the paradox clearly\n→ Argue both sides are simultaneously true\n→ Find the third position that dissolves the paradox\n\nIF Constraint Writing:\n→ Apply the creative constraint absolutely — no exceptions\n→ Constraint examples: write without the letter E /\n  every sentence must contradict the previous one /\n  only questions allowed / each paragraph shorter than last\n\nIF Meta-Prompt:\n→ Write a prompt that generates better prompts than itself\n→ Include: the hidden assumptions in every prompt\n→ Reveal: what prompts can't capture that human intention can\n\nIF Dual Perspective:\n→ Present the EXACT SAME situation from 2 irreconcilable views\n→ Both must be equally true and equally incomplete\n→ Reader decides — no resolution offered\n\nDELIVER IN {{output_style}} FORMAT:\n→ Commit to the style completely — no hybrid hedging\n→ The form must reinforce the content\n→ End on an opening, not a closing — leave the reader somewhere new"
  },
  "Miscellaneous": {
    "name": "Miscellaneous Prompt",
    "description": "Optimize generation for miscellaneous category with specific guidelines and structured output.",
    "variables": [
      {
        "label": "{{request_description}}",
        "desc": "Request description",
        "type": "Text Input"
      },
      {
        "label": "{{context}}",
        "desc": "Context",
        "type": "Text Input"
      },
      {
        "label": "{{output_format}}",
        "desc": "Output format",
        "type": "Dropdown"
      }
    ],
    "promptTemplate": "You are an infinitely adaptable expert assistant capable of handling any request with intelligence, creativity, and precision.\n\nRequest: {{request_description}}\nContext: {{context}}\nFormat: {{output_format}}\n\nYour task:\nSTEP 1 — REQUEST INTELLIGENCE\n→ Understand the TRUE need behind \"{{request_description}}\"\n→ Identify: is this primarily a thinking / doing / creating / deciding / understanding task?\n→ Clarify: what does success look like for this request?\n→ Flag: any assumptions being made about the request\n\nSTEP 2 — EXPERT LENS SELECTION\n→ Identify the 1–3 most relevant domains of expertise for this request\n→ Apply: the mental model most useful for this situation\n→ Filter through: practicality / creativity / accuracy / relevance to {{context}}\n\nSTEP 3 — CORE RESPONSE DELIVERY\n→ Deliver the primary response in {{output_format}} format\n→ Lead with the most important thing first\n→ Include: specific, actionable content — not general advice\n→ Calibrate depth to the complexity of {{request_description}}\n→ Use examples, analogies, or frameworks where they add clarity\n\nSTEP 4 — VALUE ADD LAYER\n→ What the person probably didn't think to ask but should know\n→ The most common mistake people make with this type of request\n→ One unexpected angle or alternative approach worth considering\n→ Suggested next step after using this output\n\nADAPTIVE RULES:\n→ If the request is emotional: lead with empathy before solutions\n→ If the request is technical: precision over comprehensiveness\n→ If the request is creative: surprise over convention\n→ If the request is urgent: answer first, context second\n→ If the request is complex: framework first, details second"
  }
};

module.exports = {
  CREATIVE_RULES,
  SOCIAL_MEDIA_RULES,
  ECOMMERCE_RULES,
  OTHER_RULES
};
