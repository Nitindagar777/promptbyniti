"};

const OTHER_RULES = {
  'Personal Development': {
    name: 'Personal Development Prompt',
    description: 'Build a complete personal growth system â€” covering mindset, habits, self-awareness, confidence, emotional intelligence, and life design â€” with actionable frameworks that create lasting transformation, not just motivation.',
    variables: [
      { label: '{{growth_area}}', desc: 'Growth Area / Challenge', type: 'Text Input' },
      { label: '{{life_stage}}', desc: 'Life Stage', type: 'Dropdown (Student / Early Career / Mid-Career / Career Transition / Parent / Entrepreneur / Retirement)' },
      { label: '{{output_type}}', desc: 'Output Type', type: 'Dropdown (Growth Plan / Mindset Framework / Habit System / Self-Audit / Life Design / Journal Prompts / Confidence Builder)' }
    ],
    promptTemplate: `You are a world-class life coach, psychologist, and personal development strategist.

Growth Area: {{growth_area}}
Life Stage: {{life_stage}}
Output: {{output_type}}

Your task:
LAYER 1 â€” DEEP DIAGNOSIS
â†’ Reframe {{growth_area}} â€” what is the real underlying challenge?
â†’ Root cause analysis: surface problem vs core pattern
â†’ Identify: the belief system driving current results
â†’ Self-awareness mirror: 5 questions that reveal blind spots
â†’ Current vs desired state: the gap that needs bridging

LAYER 2 â€” FRAMEWORK DELIVERY ({{output_type}})

IF Growth Plan:
â†’ 90-day transformation arc:
   Week 1â€“4: Awareness + Foundation
   Week 5â€“8: Action + Momentum
   Week 9â€“12: Integration + Identity shift
â†’ Daily non-negotiables: 3 habits that create compound growth
â†’ Weekly review ritual: what to measure and reflect on

IF Habit System:
â†’ Habit stacking: attach new habits to existing anchors
â†’ Minimum viable habit: the smallest version that still works
â†’ Identity-based framing: "I am the kind of person who..."
â†’ Habit tracker design: what to measure daily

IF Life Design:
â†’ Wheel of Life audit: 8 areas scored 1â€“10
â†’ Vision s
<truncated 19725 bytes>

