// Generated automatically from src/data/promptData.js
const TEXT_SUBCATEGORY_RULES = {
  "AI AGENTS": {
    "Customer Support Agents": {
      "name": "Customer Support Agents Prompt",
      "description": "Optimize generation for customer support agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{brand_name}}",
          "desc": "Brand name",
          "type": "Text Input"
        },
        {
          "label": "{{industry}}",
          "desc": "Industry",
          "type": "Text Input"
        },
        {
          "label": "{{tone}}",
          "desc": "Tone",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a customer support AI agent for {{brand_name}}, a company in the {{industry}} industry.\n\nYour job is to:\n- Greet customers warmly and identify their issue\n- Resolve queries about orders, refunds, billing, accounts, and FAQs\n- Escalate unresolved issues to a human agent politely\n- Maintain a {{tone}} tone throughout every interaction\n- Never make up information — say \"Let me check that for you\" if unsure\n\nAlways end with: \"Is there anything else I can help you with today?\""
    },
    "Research Agents": {
      "name": "Research Agents Prompt",
      "description": "Optimize generation for research agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{research_topic}}",
          "desc": "Research topic",
          "type": "Text Input"
        },
        {
          "label": "{{depth}}",
          "desc": "Depth",
          "type": "Text Input"
        },
        {
          "label": "{{output_format}}",
          "desc": "Output format",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are an expert AI research agent specializing in {{research_topic}}.\n\nYour task is to:\n- Gather and analyze the most relevant and up-to-date information on {{research_topic}}\n- Perform a {{depth}} level investigation\n- Identify key trends, statistics, expert opinions, and gaps\n- Present findings in {{output_format}} format\n- Highlight 3–5 actionable insights at the end\n\nBe factual, structured, and cite sources where possible."
    },
    "Coding Agents": {
      "name": "Coding Agents Prompt",
      "description": "Optimize generation for coding agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{language}}",
          "desc": "Language",
          "type": "Text Input"
        },
        {
          "label": "{{coding_task}}",
          "desc": "Coding task",
          "type": "Text Input"
        },
        {
          "label": "{{experience_level}}",
          "desc": "Experience level",
          "type": "Dropdown"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior AI coding agent expert in {{language}}.\n\nYour task: {{coding_task}}\n\nRules:\n- Write {{experience_level}} level code\n- Output: {{output_type}}\n- Include inline comments explaining key logic\n- Follow best practices: clean code, proper naming, modular structure\n- If debugging: identify the bug first, explain why it occurs, then fix it\n- If building: plan the structure first, then write the full code"
    },
    "Automation Agents": {
      "name": "Automation Agents Prompt",
      "description": "Optimize generation for automation agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{platform}}",
          "desc": "Platform",
          "type": "Dropdown"
        },
        {
          "label": "{{automation_goal}}",
          "desc": "Automation goal",
          "type": "Text Input"
        },
        {
          "label": "{{trigger_type}}",
          "desc": "Trigger type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are an expert AI automation agent working with {{platform}}.\n\nAutomation Goal: {{automation_goal}}\nTrigger: {{trigger_type}}\n\nYour task:\n- Map out the full automation flow step-by-step\n- Identify: Trigger → Action → Condition → Output\n- List all tools, APIs, or integrations needed\n- Write the automation logic or workflow blueprint\n- Flag any potential failure points and how to handle them"
    },
    "Marketing Agents": {
      "name": "Marketing Agents Prompt",
      "description": "Optimize generation for marketing agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{product_or_brand}}",
          "desc": "Product or brand",
          "type": "Text Input"
        },
        {
          "label": "{{target_audience}}",
          "desc": "Target audience",
          "type": "Text Input"
        },
        {
          "label": "{{marketing_goal}}",
          "desc": "Marketing goal",
          "type": "Text Input"
        },
        {
          "label": "{{channel}}",
          "desc": "Channel",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert AI marketing agent for {{product_or_brand}}.\n\nTarget Audience: {{target_audience}}\nGoal: {{marketing_goal}}\nChannel: {{channel}}\n\nYour task:\n- Build a complete marketing strategy for {{channel}}\n- Write compelling copy tailored to {{target_audience}}\n- Create a campaign structure: Hook → Value Prop → CTA\n- Suggest 5 content ideas aligned with {{marketing_goal}}\n- Provide KPIs to measure campaign success"
    },
    "Sales Agents": {
      "name": "Sales Agents Prompt",
      "description": "Optimize generation for sales agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{product_name}}",
          "desc": "Product name",
          "type": "Text Input"
        },
        {
          "label": "{{sales_stage}}",
          "desc": "Sales stage",
          "type": "Dropdown"
        },
        {
          "label": "{{buyer_persona}}",
          "desc": "Buyer persona",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert AI sales agent selling {{product_name}}.\n\nCurrent Stage: {{sales_stage}}\nBuyer Persona: {{buyer_persona}}\n\nYour task:\n- Execute the {{sales_stage}} stage perfectly\n- Identify the buyer's pain points and map them to {{product_name}} benefits\n- Handle objections with the Feel-Felt-Found method\n- Use consultative selling — never hard sell\n- End every interaction with a clear next step or CTA"
    },
    "Personal Assistant Agents": {
      "name": "Personal Assistant Agents Prompt",
      "description": "Optimize generation for personal assistant agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{user_role}}",
          "desc": "User role",
          "type": "Text Input"
        },
        {
          "label": "{{priority_task}}",
          "desc": "Priority task",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a highly efficient AI personal assistant for a {{user_role}}.\n\nToday's Priority: {{priority_task}}\n\nYour responsibilities:\n- Help plan, organize, and execute daily tasks efficiently\n- Draft emails, messages, and responses in the user's voice\n- Summarize long documents, meetings, or threads quickly\n- Suggest time blocks and task prioritization based on urgency\n- Proactively flag conflicts, deadlines, or missing steps"
    },
    "Multi-Agent Systems": {
      "name": "Multi-Agent Systems Prompt",
      "description": "Optimize generation for multi-agent systems category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{system_goal}}",
          "desc": "System goal",
          "type": "Text Input"
        },
        {
          "label": "{{agent_count}}",
          "desc": "Agent count",
          "type": "Text Input"
        },
        {
          "label": "{{coordination_style}}",
          "desc": "Coordination style",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "Design a multi-agent AI system to achieve: {{system_goal}}\n\nSystem uses {{agent_count}} specialized agents with {{coordination_style}} coordination.\n\nFor each agent define:\n- Agent Name & Role\n- Input it receives\n- Task it performs\n- Output it produces\n- Who it passes output to\n\nThen write the full orchestration flow from Agent 1 → Final Output.\nInclude: error handling between agents and a quality-check agent at the end."
    },
    "Workflow Agents": {
      "name": "Workflow Agents Prompt",
      "description": "Optimize generation for workflow agents category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{workflow_name}}",
          "desc": "Workflow name",
          "type": "Text Input"
        },
        {
          "label": "{{team_size}}",
          "desc": "Team size",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are an expert AI workflow agent tasked with optimizing: {{workflow_name}}\n\nTeam Size: {{team_size}}\nOutput Needed: {{output_type}}\n\nYour task:\n- Map the current workflow end-to-end (As-Is)\n- Identify bottlenecks, redundancies, and manual steps\n- Design the optimized workflow (To-Be)\n- Assign roles/tools to each step based on {{team_size}}\n- Deliver the final {{output_type}} ready for implementation"
    }
  },
  "CODE": {
    "Web Development": {
      "name": "Web Development Prompt",
      "description": "Optimize generation for web development category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{tech_stack}}",
          "desc": "Tech stack",
          "type": "Text Input"
        },
        {
          "label": "{{project_type}}",
          "desc": "Project type",
          "type": "Dropdown"
        },
        {
          "label": "{{code_style}}",
          "desc": "Code style",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior web developer expert in {{tech_stack}}.\n\nProject: {{project_type}}\nCode Style: {{code_style}}\nOutput: {{output_type}}\n\nYour task:\n- Plan the component/page structure first\n- Write clean, modular, responsive code\n- Follow {{tech_stack}} best practices\n- Include comments on all key sections\n- Make it mobile-first and accessible (WCAG basic)\n- If full-stack: separate frontend and backend clearly"
    },
    "App Development": {
      "name": "App Development Prompt",
      "description": "Optimize generation for app development category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{platform}}",
          "desc": "Platform",
          "type": "Dropdown"
        },
        {
          "label": "{{app_idea}}",
          "desc": "App idea",
          "type": "Text Input"
        },
        {
          "label": "{{feature_focus}}",
          "desc": "Feature focus",
          "type": "Text Input"
        },
        {
          "label": "{{code_style}}",
          "desc": "Code style",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a senior mobile/app developer expert in {{platform}}.\n\nApp: {{app_idea}}\nCore Feature: {{feature_focus}}\nCode Style: {{code_style}}\n\nYour task:\n- Define the app screen flow first (Screen 1 → Screen 2 → ...)\n- Build the {{feature_focus}} with full working code\n- Include navigation, state management, and API calls if needed\n- Handle loading, error, and empty states\n- Follow {{platform}} design guidelines (Material / Cupertino / Custom)"
    },
    "Game Development": {
      "name": "Game Development Prompt",
      "description": "Optimize generation for game development category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{engine}}",
          "desc": "Engine",
          "type": "Text Input"
        },
        {
          "label": "{{game_idea}}",
          "desc": "Game idea",
          "type": "Text Input"
        },
        {
          "label": "{{game_type}}",
          "desc": "Game type",
          "type": "Dropdown"
        },
        {
          "label": "{{feature_focus}}",
          "desc": "Feature focus",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert game developer using {{engine}}.\n\nGame: {{game_idea}}\nType: {{game_type}}\nFeature to Build: {{feature_focus}}\n\nYour task:\n- Define the core game loop first (Start → Play → Win/Lose → Restart)\n- Build {{feature_focus}} with complete working code\n- Include: player input handling, collision detection, scoring system\n- Add game states: Menu / Playing / Paused / Game Over\n- Comment every system clearly for easy modification"
    },
    "API Development": {
      "name": "API Development Prompt",
      "description": "Optimize generation for api development category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{api_type}}",
          "desc": "Api type",
          "type": "Dropdown"
        },
        {
          "label": "{{backend_stack}}",
          "desc": "Backend stack",
          "type": "Text Input"
        },
        {
          "label": "{{api_purpose}}",
          "desc": "Api purpose",
          "type": "Text Input"
        },
        {
          "label": "{{auth_type}}",
          "desc": "Auth type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior backend engineer building a {{api_type}} API using {{backend_stack}}.\n\nAPI Purpose: {{api_purpose}}\nAuthentication: {{auth_type}}\n\nYour task:\n- Define all endpoints/resolvers with method, route, input, output\n- Write complete working code for every endpoint\n- Implement {{auth_type}} authentication middleware\n- Add input validation, error handling, and proper HTTP status codes\n- Include API documentation comments (OpenAPI/Swagger style)\n- Add rate limiting and security headers"
    },
    "Database & SQL": {
      "name": "Database & SQL Prompt",
      "description": "Optimize generation for database & sql category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{db_type}}",
          "desc": "Db type",
          "type": "Dropdown"
        },
        {
          "label": "{{db_task}}",
          "desc": "Db task",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior database architect expert in {{db_type}}.\n\nTask: {{db_task}}\nOutput Needed: {{output_type}}\n\nYour task:\n- Analyze the data requirements for {{db_task}}\n- Design normalized schema / data model (3NF minimum for SQL)\n- Write the complete {{output_type}} with proper data types\n- Add indexes on all frequently queried columns\n- Include foreign keys, constraints, and cascade rules\n- For queries: show execution plan awareness and optimization notes"
    },
    "Debugging": {
      "name": "Debugging Prompt",
      "description": "Optimize generation for debugging category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{language}}",
          "desc": "Language",
          "type": "Text Input"
        },
        {
          "label": "{{buggy_code}}",
          "desc": "Buggy code",
          "type": "Text Input"
        },
        {
          "label": "{{error_message}}",
          "desc": "Error message",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert debugging engineer for {{language}}.\n\nCode / Bug Description: {{buggy_code}}\nError Message: {{error_message}}\n\nYour debugging process:\nSTEP 1 — IDENTIFY: What exactly is wrong and where\nSTEP 2 — EXPLAIN: Why this bug occurs (root cause)\nSTEP 3 — FIX: Write the corrected code with changes highlighted\nSTEP 4 — VERIFY: Explain how to test the fix\nSTEP 5 — PREVENT: What to do to avoid this bug in future\n\nNever just fix silently — always explain every change made."
    },
    "Automation Scripts": {
      "name": "Automation Scripts Prompt",
      "description": "Optimize generation for automation scripts category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{language}}",
          "desc": "Language",
          "type": "Text Input"
        },
        {
          "label": "{{automation_task}}",
          "desc": "Automation task",
          "type": "Text Input"
        },
        {
          "label": "{{trigger_type}}",
          "desc": "Trigger type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are an expert automation engineer writing a {{language}} script.\n\nTask to Automate: {{automation_task}}\nTrigger: {{trigger_type}}\n\nYour task:\n- Break the automation into clear logical steps first\n- Write the complete working {{language}} script\n- Add logging for every major action (success + failure)\n- Include error handling with retry logic where needed\n- Add config variables at the top (easy to customize)\n- Comment each section explaining what it does and why"
    },
    "DevOps": {
      "name": "DevOps Prompt",
      "description": "Optimize generation for devops category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{tool_stack}}",
          "desc": "Tool stack",
          "type": "Text Input"
        },
        {
          "label": "{{devops_task}}",
          "desc": "Devops task",
          "type": "Text Input"
        },
        {
          "label": "{{environment}}",
          "desc": "Environment",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a senior DevOps engineer expert in {{tool_stack}}.\n\nTask: {{devops_task}}\nEnvironment: {{environment}}\n\nYour task:\n- Plan the infrastructure/pipeline architecture first\n- Write all configuration files completely (no placeholders)\n- Include environment-specific variables using .env / secrets\n- Add health checks, rollback strategy, and monitoring hooks\n- Document every config block with inline comments\n- Include deployment steps in order (Step 1 → Step 2 → ...)"
    },
    "Security": {
      "name": "Security Prompt",
      "description": "Optimize generation for security category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{security_task}}",
          "desc": "Security task",
          "type": "Text Input"
        },
        {
          "label": "{{target_type}}",
          "desc": "Target type",
          "type": "Dropdown"
        },
        {
          "label": "{{severity_focus}}",
          "desc": "Severity focus",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a senior application security engineer.\n\nTask: {{security_task}}\nTarget: {{target_type}}\nFocus: {{severity_focus}}\n\nYour task:\n- Audit the {{target_type}} against {{severity_focus}} standards\n- List all vulnerabilities found with severity (Critical / High / Medium / Low)\n- For each vulnerability:\n  → What it is\n  → How it can be exploited\n  → Exact fix with secure code example\n- Write the hardened, secure version of the code/config\n- Provide a security checklist at the end"
    }
  },
  "WRITING": {
    "Blog Writing": {
      "name": "Blog Writing Prompt",
      "description": "Optimize generation for blog writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{target_audience}}",
          "desc": "Target audience",
          "type": "Text Input"
        },
        {
          "label": "{{blog_topic}}",
          "desc": "Blog topic",
          "type": "Text Input"
        },
        {
          "label": "{{tone}}",
          "desc": "Tone",
          "type": "Text Input"
        },
        {
          "label": "{{word_count}}",
          "desc": "Word count",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert blog writer creating content for {{target_audience}}.\n\nTopic: {{blog_topic}}\nTone: {{tone}}\nLength: {{word_count}}\n\nYour task:\n- Write a magnetic headline (primary) + 2 alternate headline options\n- Open with a hook that grabs attention in the first 2 sentences\n- Structure: Hook → Problem → Solution → Examples → Takeaways → CTA\n- Use H2 and H3 subheadings every 200–300 words\n- Write in {{tone}} tone throughout — never switch style mid-article\n- End with 1 clear CTA aligned to the reader's next step"
    },
    "Copywriting": {
      "name": "Copywriting Prompt",
      "description": "Optimize generation for copywriting category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{product_or_service}}",
          "desc": "Product or service",
          "type": "Text Input"
        },
        {
          "label": "{{target_audience}}",
          "desc": "Target audience",
          "type": "Text Input"
        },
        {
          "label": "{{copy_type}}",
          "desc": "Copy type",
          "type": "Dropdown"
        },
        {
          "label": "{{framework}}",
          "desc": "Framework",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a world-class direct-response copywriter.\n\nProduct/Service: {{product_or_service}}\nAudience: {{target_audience}}\nCopy Type: {{copy_type}}\nFramework: {{framework}}\n\nYour task:\n- Apply {{framework}} structure strictly throughout\n- Lead with the customer's biggest pain point or desire — not the product\n- Write a headline + 2 alternate headlines\n- Use power words, emotional triggers, and specificity\n- Include social proof placeholder: [TESTIMONIAL], [STAT], [GUARANTEE]\n- End with an urgency-driven CTA\n- No fluff — every sentence must earn its place"
    },
    "SEO Writing": {
      "name": "SEO Writing Prompt",
      "description": "Optimize generation for seo writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{primary_keyword}}",
          "desc": "Primary keyword",
          "type": "Text Input"
        },
        {
          "label": "{{secondary_keywords}}",
          "desc": "Secondary keywords",
          "type": "Text Input"
        },
        {
          "label": "{{content_type}}",
          "desc": "Content type",
          "type": "Dropdown"
        },
        {
          "label": "{{word_count}}",
          "desc": "Word count",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert SEO content writer and strategist.\n\nPrimary Keyword: {{primary_keyword}}\nSecondary Keywords: {{secondary_keywords}}\nContent Type: {{content_type}}\nTarget Length: {{word_count}}\n\nYour task:\n- Write fully optimized {{content_type}} targeting \"{{primary_keyword}}\"\n- Include primary keyword in: Title, H1, first 100 words, 1 H2, meta description\n- Naturally use secondary keywords {{secondary_keywords}} throughout\n- Use semantic SEO — include LSI keywords and related entities\n- Structure with proper H1 → H2 → H3 hierarchy\n- Add FAQ section at the end (5 questions using PAA-style queries)\n- Write meta title (60 chars) + meta description (155 chars)\n- Include internal linking placeholders: [LINK TO: related article]"
    },
    "Script Writing": {
      "name": "Script Writing Prompt",
      "description": "Optimize generation for script writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{script_type}}",
          "desc": "Script type",
          "type": "Dropdown"
        },
        {
          "label": "{{script_topic}}",
          "desc": "Script topic",
          "type": "Text Input"
        },
        {
          "label": "{{duration}}",
          "desc": "Duration",
          "type": "Text Input"
        },
        {
          "label": "{{tone}}",
          "desc": "Tone",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a professional scriptwriter specializing in {{script_type}}.\n\nTopic: {{script_topic}}\nDuration: {{duration}}\nTone: {{tone}}\n\nYour task:\n- Open with a pattern-interrupt hook in the first 3 seconds\n- Structure: Hook → Setup → Main Content → Payoff → CTA\n- Write in natural spoken language — not essay style\n- Add [PAUSE], [EMPHASIS], [B-ROLL: description] stage directions\n- Pace content for {{duration}} (approx 130 words per minute)\n- End with a retention CTA (subscribe / follow / click / share)"
    },
    "Email Writing": {
      "name": "Email Writing Prompt",
      "description": "Optimize generation for email writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{email_purpose}}",
          "desc": "Email purpose",
          "type": "Text Input"
        },
        {
          "label": "{{email_type}}",
          "desc": "Email type",
          "type": "Dropdown"
        },
        {
          "label": "{{recipient}}",
          "desc": "Recipient",
          "type": "Text Input"
        },
        {
          "label": "{{tone}}",
          "desc": "Tone",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert email copywriter.\n\nPurpose: {{email_purpose}}\nEmail Type: {{email_type}}\nRecipient: {{recipient}}\nTone: {{tone}}\n\nYour task:\n- Write 3 subject line options (curiosity / benefit / question style)\n- Open with a personalization hook — not \"I hope this email finds you well\"\n- Keep paragraphs to 2–3 lines max (mobile-first reading)\n- One clear point per email — no information overload\n- Include exactly ONE CTA — specific and low-friction\n- Add a P.S. line with a secondary hook or urgency trigger"
    },
    "Ebook Writing": {
      "name": "Ebook Writing Prompt",
      "description": "Optimize generation for ebook writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{ebook_topic}}",
          "desc": "Ebook topic",
          "type": "Text Input"
        },
        {
          "label": "{{target_audience}}",
          "desc": "Target audience",
          "type": "Text Input"
        },
        {
          "label": "{{ebook_goal}}",
          "desc": "Ebook goal",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert ebook writer and content strategist.\n\nTopic: {{ebook_topic}}\nReader: {{target_audience}}\nGoal: {{ebook_goal}}\n\nYour task:\n- Write a full ebook outline: Title → Subtitle → Introduction → 5–8 Chapters → Conclusion\n- For each chapter provide:\n  → Chapter title + hook sentence\n  → 3–5 key points covered\n  → 1 exercise / action step / case study\n  → Chapter summary (3 bullet points)\n- Write the Introduction and Chapter 1 in full\n- Tone: authoritative but accessible — written for {{target_audience}}"
    },
    "Technical Writing": {
      "name": "Technical Writing Prompt",
      "description": "Optimize generation for technical writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{document_topic}}",
          "desc": "Document topic",
          "type": "Text Input"
        },
        {
          "label": "{{doc_type}}",
          "desc": "Doc type",
          "type": "Dropdown"
        },
        {
          "label": "{{audience_level}}",
          "desc": "Audience level",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior technical writer with engineering expertise.\n\nTopic: {{document_topic}}\nDocument Type: {{doc_type}}\nAudience Level: {{audience_level}}\n\nYour task:\n- Structure the document with: Overview → Prerequisites → Step-by-Step Content → Examples → Troubleshooting → Reference\n- Write in clear, precise language matched to {{audience_level}}\n- Use active voice, present tense, and imperative mood for instructions\n- Include: code blocks, tables, numbered steps, and callout boxes\n- Add a \"Quick Reference\" summary table at the end\n- Every instruction must be testable — reader can follow and verify"
    },
    "Resume Writing": {
      "name": "Resume Writing Prompt",
      "description": "Optimize generation for resume writing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{job_role}}",
          "desc": "Job role",
          "type": "Text Input"
        },
        {
          "label": "{{experience_level}}",
          "desc": "Experience level",
          "type": "Dropdown"
        },
        {
          "label": "{{industry}}",
          "desc": "Industry",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a professional resume writer and career coach.\n\nTarget Role: {{job_role}}\nExperience Level: {{experience_level}}\nIndustry: {{industry}}\nOutput: {{output_type}}\n\nYour task:\n- Write a complete {{output_type}} optimized for ATS and human recruiters\n- Resume structure: Summary → Skills → Experience → Education → Certifications\n- Use strong action verbs: Led, Built, Increased, Reduced, Launched, Optimized\n- Quantify every achievement: \"Increased sales by 40%\" not \"Improved sales\"\n- Tailor all content specifically for {{job_role}} in {{industry}}\n- Include 10 ATS keywords relevant to {{job_role}} naturally woven in"
    }
  },
  "MARKETING": {
    "Social Media Marketing": {
      "name": "Social Media Marketing Prompt",
      "description": "Optimize generation for social media marketing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{platform}}",
          "desc": "Platform",
          "type": "Dropdown"
        },
        {
          "label": "{{brand_or_product}}",
          "desc": "Brand or product",
          "type": "Text Input"
        },
        {
          "label": "{{goal}}",
          "desc": "Goal",
          "type": "Text Input"
        },
        {
          "label": "{{content_type}}",
          "desc": "Content type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are an expert social media strategist for {{platform}}.\n\nBrand: {{brand_or_product}}\nGoal: {{goal}}\nContent Type: {{content_type}}\n\nYour task:\n- Define the brand's social media positioning in 2 lines\n- Create 10 content ideas tailored to {{platform}} algorithm\n- Write 5 ready-to-post captions with hooks, body, and CTA\n- Include hashtag strategy: 5 niche + 5 mid + 3 broad hashtags\n- Suggest posting frequency and best times for {{platform}}\n- Add 3 engagement tactics to boost reach organically\n- Structure each post: Hook (line 1) → Value → CTA → Hashtags"
    },
    "SEO": {
      "name": "SEO Prompt",
      "description": "Optimize generation for seo category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{website_or_niche}}",
          "desc": "Website or niche",
          "type": "Text Input"
        },
        {
          "label": "{{seo_goal}}",
          "desc": "Seo goal",
          "type": "Text Input"
        },
        {
          "label": "{{target_keyword}}",
          "desc": "Target keyword",
          "type": "Text Input"
        },
        {
          "label": "{{competition_level}}",
          "desc": "Competition level",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior SEO strategist with 10+ years of experience.\n\nWebsite/Niche: {{website_or_niche}}\nGoal: {{seo_goal}}\nTarget Keyword: {{target_keyword}}\nCompetition: {{competition_level}}\n\nYour task:\n- Perform a keyword cluster analysis for \"{{target_keyword}}\"\n- Identify: 1 pillar keyword + 5 cluster keywords + 10 long-tail keywords\n- Map search intent for each keyword (Informational / Transactional / Navigational)\n- Build a content strategy: which pages to create, in what order\n- Write full on-page SEO checklist for the target page\n- Suggest 5 link-building strategies for {{competition_level}} competition\n- Include 3 quick-win optimizations that can improve rankings in 30 days"
    },
    "Email Marketing": {
      "name": "Email Marketing Prompt",
      "description": "Optimize generation for email marketing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{brand_or_product}}",
          "desc": "Brand or product",
          "type": "Text Input"
        },
        {
          "label": "{{campaign_type}}",
          "desc": "Campaign type",
          "type": "Dropdown"
        },
        {
          "label": "{{audience_segment}}",
          "desc": "Audience segment",
          "type": "Text Input"
        },
        {
          "label": "{{sequence_length}}",
          "desc": "Sequence length",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert email marketing strategist for {{brand_or_product}}.\n\nCampaign Type: {{campaign_type}}\nAudience: {{audience_segment}}\nSequence Length: {{sequence_length}}\n\nYour task:\n- Map the full {{campaign_type}} sequence flow:\n  Email # → Send Day → Subject Line → Preview Text → Goal → CTA\n- Write each email fully:\n  → 3 subject line options (curiosity / benefit / urgency)\n  → Preview text (90 chars)\n  → Opening hook (not \"Hope this email finds you well\")\n  → Body content (value-first, short paragraphs)\n  → Single CTA (button text + destination)\n  → P.S. line\n- Include open rate + click rate benchmark for each email type"
    },
    "Paid Advertising": {
      "name": "Paid Advertising Prompt",
      "description": "Optimize generation for paid advertising category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{ad_platform}}",
          "desc": "Ad platform",
          "type": "Dropdown"
        },
        {
          "label": "{{product_or_offer}}",
          "desc": "Product or offer",
          "type": "Text Input"
        },
        {
          "label": "{{campaign_objective}}",
          "desc": "Campaign objective",
          "type": "Text Input"
        },
        {
          "label": "{{budget}}",
          "desc": "Budget",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a performance marketing expert specializing in {{ad_platform}}.\n\nProduct/Offer: {{product_or_offer}}\nObjective: {{campaign_objective}}\nBudget: {{budget}}\n\nYour task:\n- Define campaign structure: Campaign → Ad Set → Ad level breakdown\n- Audience targeting: demographics, interests, behaviors, lookalikes\n- Write 3 complete ad variations (A/B/C test):\n  → Primary text (hook + value + CTA)\n  → Headline (5 words max, benefit-driven)\n  → Description line\n  → CTA button recommendation\n- Creative brief: describe the ideal image/video for each ad\n- Budget allocation strategy across ad sets\n- Key metrics to track + target benchmarks (CTR, CPC, ROAS, CPL)"
    },
    "Branding": {
      "name": "Branding Prompt",
      "description": "Optimize generation for branding category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{brand_name}}",
          "desc": "Brand name",
          "type": "Text Input"
        },
        {
          "label": "{{industry}}",
          "desc": "Industry",
          "type": "Text Input"
        },
        {
          "label": "{{branding_output}}",
          "desc": "Branding output",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a world-class brand strategist and identity designer.\n\nBrand: {{brand_name}}\nIndustry: {{industry}}\nOutput: {{branding_output}}\n\nYour task:\n- Define brand positioning: What it is, Who it's for, Why it's different\n- Build brand archetype: (Hero / Sage / Creator / Outlaw / Explorer / etc.)\n- Write brand personality: 5 traits with DO and DON'T examples for each\n- Create messaging framework:\n  → Brand tagline (3 options)\n  → Brand mission statement (1 sentence)\n  → Brand vision statement (1 sentence)\n  → Elevator pitch (30 seconds spoken)\n  → Value proposition (1 sentence)\n- Define brand voice: tone, vocabulary, communication style\n- Visual identity brief: color psychology, typography mood, imagery style"
    },
    "Sales Funnels": {
      "name": "Sales Funnels Prompt",
      "description": "Optimize generation for sales funnels category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{product_or_offer}}",
          "desc": "Product or offer",
          "type": "Text Input"
        },
        {
          "label": "{{funnel_type}}",
          "desc": "Funnel type",
          "type": "Dropdown"
        },
        {
          "label": "{{traffic_source}}",
          "desc": "Traffic source",
          "type": "Text Input"
        },
        {
          "label": "{{price_point}}",
          "desc": "Price point",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a conversion funnel strategist and direct-response copywriter.\n\nProduct/Offer: {{product_or_offer}}\nFunnel Type: {{funnel_type}}\nTraffic Source: {{traffic_source}}\nPrice Point: {{price_point}}\n\nYour task:\n- Map the complete funnel step-by-step:\n  Step # → Page/Touchpoint → Goal → Copy Direction → CTA\n- Write copy for each funnel stage:\n  → Ad/Entry hook\n  → Landing page headline + subheadline + CTA\n  → Thank you page\n  → Email sequence (3 emails minimum)\n  → Sales page core sections\n  → Upsell offer (1 OTO)\n- Include conversion benchmarks per stage\n- Add trust elements: testimonials, guarantees, scarcity placement"
    },
    "Lead Generation": {
      "name": "Lead Generation Prompt",
      "description": "Optimize generation for lead generation category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{business_type}}",
          "desc": "Business type",
          "type": "Dropdown"
        },
        {
          "label": "{{lead_gen_method}}",
          "desc": "Lead gen method",
          "type": "Text Input"
        },
        {
          "label": "{{target_lead}}",
          "desc": "Target lead",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert lead generation strategist.\n\nBusiness: {{business_type}}\nMethod: {{lead_gen_method}}\nIdeal Lead: {{target_lead}}\n\nYour task:\n- Define the ideal customer profile (ICP) for {{target_lead}}\n- Design the lead generation asset for {{lead_gen_method}}:\n  → Asset title + description\n  → Why this ideal lead would want it\n  → Opt-in page headline + 3 bullet benefits + CTA\n- Write the lead capture form (fields: name, email + 1 qualifying question max)\n- Build the lead qualification framework: 5 questions to score lead quality\n- Create the post-capture nurture plan: first 3 touchpoints after opt-in\n- Include 3 lead gen campaign ideas using {{lead_gen_method}}"
    },
    "Viral Marketing": {
      "name": "Viral Marketing Prompt",
      "description": "Optimize generation for viral marketing category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{brand_or_campaign}}",
          "desc": "Brand or campaign",
          "type": "Text Input"
        },
        {
          "label": "{{viral_mechanism}}",
          "desc": "Viral mechanism",
          "type": "Text Input"
        },
        {
          "label": "{{platform}}",
          "desc": "Platform",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a viral growth marketing strategist.\n\nBrand/Campaign: {{brand_or_campaign}}\nViral Mechanism: {{viral_mechanism}}\nPlatform: {{platform}}\n\nYour task:\n- Identify the core viral trigger: (Social Currency / Triggers / Emotion / Public / Practical Value / Stories)\n- Design the complete {{viral_mechanism}} campaign:\n  → Campaign concept + hook\n  → How the viral loop works (Step 1 → Share → Step 2 → Reward → Step 3 → Spread)\n  → Entry mechanic (how people participate)\n  → Share mechanic (why they'll share it)\n  → Reward mechanic (what they get for sharing)\n- Write the campaign launch copy: announcement post + 3 follow-up posts\n- Define success metrics: target reach, shares, participation rate\n- Include 3 amplification tactics to seed the campaign initially"
    }
  },
  "BUSINESS": {
    "Startup Ideas": {
      "name": "Startup Ideas Prompt",
      "description": "Optimize generation for startup ideas category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{interest_or_skill}}",
          "desc": "Interest or skill",
          "type": "Text Input"
        },
        {
          "label": "{{market_type}}",
          "desc": "Market type",
          "type": "Dropdown"
        },
        {
          "label": "{{budget_range}}",
          "desc": "Budget range",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a serial entrepreneur and startup idea validator.\n\nSkill/Interest: {{interest_or_skill}}\nMarket Type: {{market_type}}\nStarting Budget: {{budget_range}}\n\nYour task:\n- Generate 5 startup ideas in {{interest_or_skill}} space for {{market_type}}\n- For each idea provide:\n  → Problem it solves (1 sentence — must be a real pain)\n  → Target customer (hyper-specific profile)\n  → Solution summary (how it works in 2 lines)\n  → Revenue model (how it makes money)\n  → Unfair advantage (why you can win)\n  → Validation method (how to test in 2 weeks with {{budget_range}})\n  → Risk level: Low / Medium / High\n- Rank all 5 by: Feasibility + Market Size + Competition Level\n- Deep-dive the #1 ranked idea with full breakdown"
    },
    "Business Plans": {
      "name": "Business Plans Prompt",
      "description": "Optimize generation for business plans category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{business_name}}",
          "desc": "Business name",
          "type": "Text Input"
        },
        {
          "label": "{{plan_purpose}}",
          "desc": "Plan purpose",
          "type": "Text Input"
        },
        {
          "label": "{{business_stage}}",
          "desc": "Business stage",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a seasoned business plan writer and startup advisor.\n\nBusiness: {{business_name}}\nPlan Purpose: {{plan_purpose}}\nStage: {{business_stage}}\n\nYour task:\nWrite a complete business plan with these sections:\n\n1. EXECUTIVE SUMMARY (1 page)\n   → Business concept, problem, solution, market size, ask/goal\n\n2. PROBLEM & SOLUTION\n   → Pain point evidence + unique solution + value proposition\n\n3. MARKET ANALYSIS\n   → TAM / SAM / SOM breakdown + target customer profile\n\n4. BUSINESS MODEL\n   → Revenue streams + pricing strategy + unit economics\n\n5. GO-TO-MARKET STRATEGY\n   → Customer acquisition channels + launch plan + milestones\n\n6. FINANCIAL PROJECTIONS\n   → 3-year revenue forecast + key cost drivers + break-even point\n\n7. TEAM SECTION\n   → Founding team strengths + key hires needed\n\n8. RISKS & MITIGATION\n   → Top 3 risks with mitigation strategies"
    },
    "Market Research": {
      "name": "Market Research Prompt",
      "description": "Optimize generation for market research category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{market_or_industry}}",
          "desc": "Market or industry",
          "type": "Text Input"
        },
        {
          "label": "{{research_goal}}",
          "desc": "Research goal",
          "type": "Text Input"
        },
        {
          "label": "{{output_format}}",
          "desc": "Output format",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior market research analyst.\n\nMarket/Industry: {{market_or_industry}}\nResearch Goal: {{research_goal}}\nOutput Format: {{output_format}}\n\nYour task:\n- Market Overview: size, growth rate (CAGR), key segments\n- Customer Analysis:\n  → 3 detailed buyer personas with demographics, psychographics, pain points\n  → Jobs-to-be-done framework for primary persona\n- Trend Analysis: 5 macro trends shaping this market (next 3–5 years)\n- Competitive Landscape: market structure (fragmented/consolidated) + key players\n- Opportunity Gaps: 3 underserved segments or unmet needs\n- Market Entry Recommendation: best entry point with rationale\n- Data Sources: cite what types of sources would validate each finding"
    },
    "Competitor Analysis": {
      "name": "Competitor Analysis Prompt",
      "description": "Optimize generation for competitor analysis category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{your_business}}",
          "desc": "Your business",
          "type": "Text Input"
        },
        {
          "label": "{{competitors}}",
          "desc": "Competitors",
          "type": "Text Input"
        },
        {
          "label": "{{analysis_focus}}",
          "desc": "Analysis focus",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a strategic business analyst specializing in competitive intelligence.\n\nYour Business: {{your_business}}\nCompetitors: {{competitors}}\nFocus: {{analysis_focus}}\n\nYour task:\n- Build a competitor comparison matrix:\n  [Feature / Price / Target Market / Positioning / Strengths / Weaknesses]\n- For each competitor analyze:\n  → Positioning statement (how they describe themselves)\n  → Target customer (who they're really selling to)\n  → Pricing model + price points\n  → Top 3 strengths (what they do better)\n  → Top 3 weaknesses (where they fall short)\n  → Marketing channels they dominate\n  → Customer sentiment (common praise + common complaints)\n- Identify: your 3 biggest competitive advantages vs all competitors\n- Recommend: 1 positioning strategy to win against all competitors"
    },
    "Finance": {
      "name": "Finance Prompt",
      "description": "Optimize generation for finance category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{finance_task}}",
          "desc": "Finance task",
          "type": "Text Input"
        },
        {
          "label": "{{business_type}}",
          "desc": "Business type",
          "type": "Dropdown"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a CFO-level financial strategist and analyst.\n\nTask: {{finance_task}}\nBusiness Type: {{business_type}}\nOutput: {{output_type}}\n\nYour task:\n- Build the complete {{output_type}} for a {{business_type}}\n- Structure:\n  → Key assumptions (list every assumption made)\n  → Revenue model breakdown (streams, pricing, volume)\n  → Cost structure (fixed vs variable costs)\n  → Monthly projections: Month 1 → Month 12\n  → Key financial metrics: MRR / ARR / Gross Margin / CAC / LTV / Burn Rate\n  → Break-even point: month and revenue amount\n  → 3 scenarios: Conservative / Base / Optimistic\n- Explain each number in plain English below the model\n- Flag: top 3 financial risks and how to mitigate them"
    },
    "Ecommerce": {
      "name": "Ecommerce Prompt",
      "description": "Optimize generation for ecommerce category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{store_or_product}}",
          "desc": "Store or product",
          "type": "Text Input"
        },
        {
          "label": "{{ecommerce_platform}}",
          "desc": "Ecommerce platform",
          "type": "Dropdown"
        },
        {
          "label": "{{ecommerce_goal}}",
          "desc": "Ecommerce goal",
          "type": "Text Input"
        },
        {
          "label": "{{business_model}}",
          "desc": "Business model",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a 7-figure ecommerce expert and growth strategist.\n\nStore/Product: {{store_or_product}}\nPlatform: {{ecommerce_platform}}\nGoal: {{ecommerce_goal}}\nModel: {{business_model}}\n\nYour task:\n- Diagnose the current state and identify the #1 priority for {{ecommerce_goal}}\n- Deliver a complete action plan:\n\n  IF Product Research:\n  → 5 winning product criteria + 3 product ideas with validation data\n\n  IF Store Setup:\n  → Store structure, pages needed, conversion elements checklist\n\n  IF Conversion Optimization:\n  → CRO audit: homepage → product page → cart → checkout\n  → 10 specific changes ranked by impact\n\n  IF Marketing:\n  → Channel mix: paid + organic + email + influencer allocation\n\n  IF Scaling:\n  → Systems, team, automation, and capital allocation plan\n\n  IF Retention:\n  → Post-purchase flow, loyalty program, LTV maximization plan"
    },
    "Entrepreneurship": {
      "name": "Entrepreneurship Prompt",
      "description": "Optimize generation for entrepreneurship category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{entrepreneur_challenge}}",
          "desc": "Entrepreneur challenge",
          "type": "Text Input"
        },
        {
          "label": "{{business_stage}}",
          "desc": "Business stage",
          "type": "Dropdown"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a world-class entrepreneur mentor, advisor, and strategist.\n\nChallenge/Topic: {{entrepreneur_challenge}}\nStage: {{business_stage}}\nOutput: {{output_type}}\n\nYour task:\n- Diagnose the real problem behind \"{{entrepreneur_challenge}}\" — not just surface level\n- Deliver {{output_type}} tailored to {{business_stage}}:\n\n  Structure your response as:\n  → The Real Problem (reframe their challenge)\n  → The Principle (the key insight that solves it)\n  → The Framework (step-by-step approach)\n  → The Action (what to do in the next 24 hours)\n  → The Pitfall (the #1 mistake to avoid)\n  → The Example (a real-world pattern or analogy)\n\n- Be direct, specific, and actionable — no generic advice\n- Speak as a mentor who has built businesses, not as a consultant"
    }
  },
  "RESEARCH": {
    "Deep Research": {
      "name": "Deep Research Prompt",
      "description": "Optimize generation for deep research category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{research_topic}}",
          "desc": "Research topic",
          "type": "Text Input"
        },
        {
          "label": "{{research_depth}}",
          "desc": "Research depth",
          "type": "Text Input"
        },
        {
          "label": "{{output_format}}",
          "desc": "Output format",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a world-class research analyst with expertise across \nmultiple disciplines.\n\nTopic: {{research_topic}}\nDepth: {{research_depth}}\nFormat: {{output_format}}\n\nYour task:\n- Layer 1 — FOUNDATION: Core facts, definitions, and context\n- Layer 2 — DEPTH: Key mechanisms, causes, evidence, and data\n- Layer 3 — COMPLEXITY: Conflicting views, nuances, and debates\n- Layer 4 — EXPERT LEVEL: Cutting-edge findings, future implications\n- Layer 5 — SYNTHESIS: Your integrated analysis and key conclusions\n\nFor each layer include:\n→ Key findings (bullet points)\n→ Supporting evidence or data points\n→ Source type recommendations\n→ Confidence level: High / Medium / Needs Verification\n\nEnd with:\n→ 5 Key Takeaways\n→ 3 Open Questions still unanswered\n→ 5 recommended sources to explore further"
    },
    "Academic Research": {
      "name": "Academic Research Prompt",
      "description": "Optimize generation for academic research category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{research_topic}}",
          "desc": "Research topic",
          "type": "Text Input"
        },
        {
          "label": "{{academic_level}}",
          "desc": "Academic level",
          "type": "Dropdown"
        },
        {
          "label": "{{research_type}}",
          "desc": "Research type",
          "type": "Dropdown"
        },
        {
          "label": "{{citation_style}}",
          "desc": "Citation style",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a senior academic researcher and scholarly writing expert.\n\nTopic/Question: {{research_topic}}\nLevel: {{academic_level}}\nType: {{research_type}}\nCitation Style: {{citation_style}}\n\nYour task:\n- Formulate a precise research question (if not provided)\n- Build complete {{research_type}} structure:\n\n  IF Literature Review:\n  → Thematic organization of existing research\n  → Research gaps identified\n  → Synthesis of conflicting findings\n\n  IF Thesis Outline:\n  → Chapter structure with word count allocation\n  → Research questions per chapter\n  → Methodology justification\n\n  IF Research Proposal:\n  → Background → Problem Statement → Objectives →\n    Methodology → Timeline → Expected Contributions\n\n  IF Methodology Design:\n  → Research paradigm (positivist/interpretivist/critical)\n  → Methods (qualitative/quantitative/mixed)\n  → Data collection + analysis approach\n  → Validity and reliability measures\n\n- Format all citations as {{citation_style}} placeholders\n- Include academic vocabulary appropriate for {{academic_level}}"
    },
    "Summarization": {
      "name": "Summarization Prompt",
      "description": "Optimize generation for summarization category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{content_to_summarize}}",
          "desc": "Content to summarize",
          "type": "Text Input"
        },
        {
          "label": "{{summary_type}}",
          "desc": "Summary type",
          "type": "Dropdown"
        },
        {
          "label": "{{summary_length}}",
          "desc": "Summary length",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert content analyst and professional summarizer.\n\nContent: {{content_to_summarize}}\nSummary Type: {{summary_type}}\nLength: {{summary_length}}\n\nYour task:\n- Read and fully understand the content before summarizing\n- Identify: main argument, key evidence, important conclusions\n- Deliver {{summary_type}} in {{summary_length}} format:\n\n  Structure:\n  → Core Topic (1 sentence — what this is about)\n  → Main Argument / Purpose (what it claims or aims to do)\n  → Key Points (3–7 most important ideas)\n  → Supporting Evidence (data, examples, quotes that matter)\n  → Conclusions / Outcomes (what was found or decided)\n  → Relevance / So What? (why this matters)\n\n- Preserve all critical numbers, dates, names, and findings\n- Never add interpretation not present in the original\n- Flag if any section was unclear or ambiguous in source"
    },
    "Data Analysis": {
      "name": "Data Analysis Prompt",
      "description": "Optimize generation for data analysis category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{data_or_topic}}",
          "desc": "Data or topic",
          "type": "Text Input"
        },
        {
          "label": "{{analysis_type}}",
          "desc": "Analysis type",
          "type": "Dropdown"
        },
        {
          "label": "{{tool}}",
          "desc": "Tool",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior data analyst and business intelligence expert.\n\nData/Topic: {{data_or_topic}}\nAnalysis Type: {{analysis_type}}\nTool: {{tool}}\nOutput: {{output_type}}\n\nYour task:\nSTEP 1 — DATA UNDERSTANDING\n→ Define variables, data types, and expected distributions\n→ Identify potential data quality issues (nulls, outliers, bias)\n\nSTEP 2 — ANALYSIS EXECUTION\n→ Apply {{analysis_type}} methodology\n→ Calculate key metrics and statistical measures\n→ Identify patterns, correlations, and anomalies\n\nSTEP 3 — INSIGHT GENERATION\n→ Translate findings into plain-English business insights\n→ Rank insights by impact: High / Medium / Low\n→ Connect each insight to a business decision or action\n\nSTEP 4 — OUTPUT DELIVERY\n→ Deliver {{output_type}} with all findings structured\n→ Include: visualization recommendations per insight\n→ Write executive summary of top 3 findings"
    },
    "Trend Analysis": {
      "name": "Trend Analysis Prompt",
      "description": "Optimize generation for trend analysis category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{industry_or_topic}}",
          "desc": "Industry or topic",
          "type": "Text Input"
        },
        {
          "label": "{{trend_horizon}}",
          "desc": "Trend horizon",
          "type": "Text Input"
        },
        {
          "label": "{{output_focus}}",
          "desc": "Output focus",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a strategic foresight analyst and trend intelligence expert.\n\nIndustry/Topic: {{industry_or_topic}}\nHorizon: {{trend_horizon}}\nFocus: {{output_focus}}\n\nYour task:\n- Identify 7 significant trends in {{industry_or_topic}} for {{trend_horizon}}\n\nFor each trend:\n→ Trend Name + 1-line description\n→ Signal Strength: Emerging / Growing / Peak / Declining\n→ Evidence: 3 data points or real-world signals supporting it\n→ Drivers: what forces are accelerating this trend (tech/social/economic/regulatory)\n→ Impact Score: Low / Medium / High / Transformative\n→ Winners: who benefits most from this trend\n→ Losers: who is most threatened\n→ Strategic Implication: what businesses should do about it\n\n- Rank all 7 trends by: Impact × Certainty matrix\n- Identify: 1 wildcard trend (low probability, extreme impact)\n- Deliver {{output_focus}} with synthesis and recommendations"
    },
    "Report Generation": {
      "name": "Report Generation Prompt",
      "description": "Optimize generation for report generation category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{report_topic}}",
          "desc": "Report topic",
          "type": "Text Input"
        },
        {
          "label": "{{report_type}}",
          "desc": "Report type",
          "type": "Dropdown"
        },
        {
          "label": "{{audience}}",
          "desc": "Audience",
          "type": "Text Input"
        },
        {
          "label": "{{report_length}}",
          "desc": "Report length",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a senior professional report writer and business analyst.\n\nTopic: {{report_topic}}\nReport Type: {{report_type}}\nAudience: {{audience}}\nLength: {{report_length}}\n\nYour task:\nBuild a complete {{report_type}} with this structure:\n\nCOVER SECTION\n→ Report title, prepared by, date, confidentiality notice\n\nEXECUTIVE SUMMARY (always first — 1 page max)\n→ Purpose, key findings, recommendations, next steps\n\nMAIN BODY (structured by report type):\n→ Background / Context\n→ Methodology / Approach\n→ Findings / Analysis (data-backed)\n→ Discussion / Interpretation\n→ Recommendations (ranked by priority)\n\nAPPENDIX SECTION\n→ Data tables, charts descriptions, references\n\nWrite in professional language calibrated for {{audience}}\nInclude: [TABLE: description] and [CHART: description] placeholders"
    }
  },
  "EDUCATION": {
    "Study Guides": {
      "name": "Study Guides Prompt",
      "description": "Optimize generation for study guides category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{subject_topic}}",
          "desc": "Subject topic",
          "type": "Text Input"
        },
        {
          "label": "{{education_level}}",
          "desc": "Education level",
          "type": "Dropdown"
        },
        {
          "label": "{{learning_style}}",
          "desc": "Learning style",
          "type": "Text Input"
        },
        {
          "label": "{{study_goal}}",
          "desc": "Study goal",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert educator and study guide designer.\n\nSubject/Topic: {{subject_topic}}\nLevel: {{education_level}}\nLearning Style: {{learning_style}}\nGoal: {{study_goal}}\n\nYour task:\nBuild a complete study guide with this structure:\n\nSECTION 1 — OVERVIEW\n→ What is {{subject_topic}}? (plain English definition)\n→ Why it matters (real-world relevance)\n→ Big Picture: how this topic connects to the broader subject\n\nSECTION 2 — CORE CONCEPTS\n→ List every key concept with:\n   - Clear definition (simple language)\n   - Real-world example or analogy\n   - Common misconception to avoid\n\nSECTION 3 — DEEP DIVE\n→ Detailed breakdown of each concept\n→ Formulas, frameworks, or processes if applicable\n→ Step-by-step explanations for complex ideas\n\nSECTION 4 — MEMORY AIDS\n→ Mnemonics, acronyms, or memory tricks\n→ Key terms glossary\n→ \"If you remember nothing else, remember this:\" box\n\nSECTION 5 — PRACTICE & REVIEW\n→ 5 review questions (mix of recall + application)\n→ 1 challenging synthesis question\n→ Self-assessment checklist: \"I can explain ___\""
    },
    "Exam Preparation": {
      "name": "Exam Preparation Prompt",
      "description": "Optimize generation for exam preparation category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{exam_name}}",
          "desc": "Exam name",
          "type": "Text Input"
        },
        {
          "label": "{{time_until_exam}}",
          "desc": "Time until exam",
          "type": "Text Input"
        },
        {
          "label": "{{exam_type}}",
          "desc": "Exam type",
          "type": "Dropdown"
        },
        {
          "label": "{{weak_areas}}",
          "desc": "Weak areas",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert exam coach and academic strategist.\n\nExam: {{exam_name}}\nTime Available: {{time_until_exam}}\nExam Type: {{exam_type}}\nWeak Areas: {{weak_areas}}\n\nYour task:\nPHASE 1 — EXAM AUDIT\n→ Break {{exam_name}} into all testable topics\n→ Classify each: High Frequency / Medium / Low probability of appearing\n→ Identify which of {{weak_areas}} are highest priority to fix\n\nPHASE 2 — STUDY PLAN\n→ Build day-by-day study schedule for {{time_until_exam}}\n→ Allocate: 60% time to weak areas + 40% to review strong areas\n→ Include: study sessions, breaks, practice tests, revision days\n\nPHASE 3 — EXAM STRATEGY\n→ {{exam_type}} specific tactics:\n   MCQ: elimination strategy, timing per question, flagging method\n   Essay: structure, time allocation, key phrases to include\n   Problem Solving: show-your-work strategy, partial credit approach\n   Oral/Viva: anticipated questions, answer structure, confidence tactics\n\nPHASE 4 — LAST 24 HOURS PLAN\n→ What to review, what to avoid, sleep/nutrition/mindset tips\n→ Morning-of routine for peak performance"
    },
    "Tutor Prompts": {
      "name": "Tutor Prompts Prompt",
      "description": "Optimize generation for tutor prompts category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{subject}}",
          "desc": "Subject",
          "type": "Text Input"
        },
        {
          "label": "{{student_level}}",
          "desc": "Student level",
          "type": "Dropdown"
        },
        {
          "label": "{{tutoring_style}}",
          "desc": "Tutoring style",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert tutor specializing in {{subject}}.\nYour student is at {{student_level}} level.\nTutoring style: {{tutoring_style}}\n\nYour tutoring rules:\n- NEVER just give the answer — guide the student to discover it\n- Check understanding after every concept before moving forward\n- Use the \"I do → We do → You do\" teaching progression\n- Adapt your language to {{student_level}}:\n  Beginner: everyday analogies, no jargon\n  Intermediate: introduce proper terminology with context\n  Advanced: peer-level discussion, challenge assumptions\n\nTUTORING FLOW:\n→ START: Assess what student already knows with 2 diagnostic questions\n→ TEACH: Explain concept using example → analogy → application\n→ CHECK: Ask \"Can you explain this back to me in your own words?\"\n→ PRACTICE: Give 1 problem, guide through it step by step\n→ REINFORCE: Summary of key points learned this session\n→ NEXT: Suggest what to study next and why\n\nIF student is wrong:\n→ Never say \"Wrong\" — say \"Interesting thinking, let's look at this together\"\n→ Identify WHERE the misunderstanding is, not just WHAT is wrong\n→ Re-explain from the point of confusion"
    },
    "Language Learning": {
      "name": "Language Learning Prompt",
      "description": "Optimize generation for language learning category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{target_language}}",
          "desc": "Target language",
          "type": "Text Input"
        },
        {
          "label": "{{native_language}}",
          "desc": "Native language",
          "type": "Text Input"
        },
        {
          "label": "{{proficiency_level}}",
          "desc": "Proficiency level",
          "type": "Dropdown"
        },
        {
          "label": "{{learning_focus}}",
          "desc": "Learning focus",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert language teacher specializing in {{target_language}}\nfor {{native_language}} speakers.\n\nLevel: {{proficiency_level}}\nFocus: {{learning_focus}}\n\nYour task:\nBUILD A LEARNING SESSION with this structure:\n\nWARM UP (5 min)\n→ 5 review words/phrases from previous level\n→ Quick grammar recall question\n\nTODAY'S LESSON\n→ Topic introduction with cultural context\n→ 10 new vocabulary words with:\n   - Word in {{target_language}}\n   - Pronunciation guide (phonetic)\n   - English meaning\n   - Example sentence\n   - Memory trick\n\nGRAMMAR FOCUS\n→ 1 grammar rule explained simply\n→ Structure formula: [Subject] + [Verb] + [Object]\n→ 3 example sentences (simple → complex)\n→ Common mistake to avoid\n\nCONVERSATION PRACTICE\n→ 5 dialogue examples for real situations\n→ Fill-in-the-blank exercises (5 questions)\n→ Translation challenge: {{native_language}} → {{target_language}}\n\nCULTURAL NOTE\n→ 1 cultural insight that helps language make sense\n\nHOMEWORK\n→ 3 practice exercises for next session"
    },
    "Quiz Generation": {
      "name": "Quiz Generation Prompt",
      "description": "Optimize generation for quiz generation category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{quiz_topic}}",
          "desc": "Quiz topic",
          "type": "Text Input"
        },
        {
          "label": "{{difficulty_level}}",
          "desc": "Difficulty level",
          "type": "Dropdown"
        },
        {
          "label": "{{quiz_format}}",
          "desc": "Quiz format",
          "type": "Dropdown"
        },
        {
          "label": "{{number_of_questions}}",
          "desc": "Number of questions",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert quiz designer and educational assessment specialist.\n\nTopic: {{quiz_topic}}\nDifficulty: {{difficulty_level}}\nFormat: {{quiz_format}}\nQuestions: {{number_of_questions}}\n\nYour task:\nBUILD A COMPLETE QUIZ:\n\nQUIZ HEADER\n→ Quiz title, topic, estimated time (2 min per question), instructions\n\nQUESTIONS SECTION\nFor each question:\n→ Q[Number]: [Question text]\n   A) Option 1\n   B) Option 2\n   C) Option 3\n   D) Option 4\n   [For fill-in-blank: leave ______ clearly]\n   [For short answer: include word limit]\n   Difficulty tag: ⭐ Easy / ⭐⭐ Medium / ⭐⭐⭐ Hard\n\nANSWER KEY (separate section)\nFor each answer:\n→ Q[Number]: Correct Answer\n→ Explanation: Why this is correct (2–3 sentences)\n→ Common Wrong Answer: Why students pick the wrong option\n→ Learning Point: What concept this tests\n\nQUIZ SUMMARY\n→ Topic coverage map: which concepts each question tests\n→ Score guide: 90%+ Excellent / 70–89% Good / Below 70% Review needed"
    },
    "Teaching Materials": {
      "name": "Teaching Materials Prompt",
      "description": "Optimize generation for teaching materials category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{subject_topic}}",
          "desc": "Subject topic",
          "type": "Text Input"
        },
        {
          "label": "{{age_group}}",
          "desc": "Age group",
          "type": "Text Input"
        },
        {
          "label": "{{material_type}}",
          "desc": "Material type",
          "type": "Dropdown"
        },
        {
          "label": "{{lesson_duration}}",
          "desc": "Lesson duration",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert curriculum designer and master teacher.\n\nTopic: {{subject_topic}}\nAge Group: {{age_group}}\nMaterial: {{material_type}}\nDuration: {{lesson_duration}}\n\nYour task:\n\nIF Lesson Plan:\n→ Learning Objectives (3 measurable outcomes using Bloom's Taxonomy)\n→ Materials Needed list\n→ Minute-by-minute lesson flow:\n   0–5 min: Warm-up / Hook activity\n   5–15 min: Direct instruction / Concept introduction\n   15–35 min: Guided practice with teacher\n   35–50 min: Independent / group practice\n   50–60 min: Review, check understanding, exit ticket\n→ Differentiation: support for struggling + extension for advanced\n→ Assessment method: how you'll know they learned it\n\nIF Worksheet:\n→ Clear instructions at top\n→ 3 difficulty tiers: Guided (scaffolded) / Practice / Challenge\n→ Visual elements: [DIAGRAM], [TABLE], [MATCHING ACTIVITY]\n→ Answer key for teacher\n\nIF Rubric:\n→ 4-level scale: Excellent / Proficient / Developing / Beginning\n→ Clear descriptors for each criterion at each level\n→ Weighted scoring if applicable\n\nIF Full Teaching Pack:\n→ All of the above combined in order"
    }
  },
  "PRODUCTIVITY": {
    "Task Management": {
      "name": "Task Management Prompt",
      "description": "Optimize generation for task management category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{role_or_context}}",
          "desc": "Role or context",
          "type": "Text Input"
        },
        {
          "label": "{{task_volume}}",
          "desc": "Task volume",
          "type": "Text Input"
        },
        {
          "label": "{{system_type}}",
          "desc": "System type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a world-class productivity coach and task management expert.\n\nRole/Context: {{role_or_context}}\nTask Volume: {{task_volume}}\nSystem: {{system_type}}\n\nYour task:\nSTEP 1 — TASK CAPTURE\n→ Create a brain dump framework to capture ALL tasks\n→ Categories: Work / Personal / Urgent / Waiting / Someday\n\nSTEP 2 — PRIORITIZATION\n→ Apply Eisenhower Matrix to every task:\n   Q1: Urgent + Important → DO NOW\n   Q2: Not Urgent + Important → SCHEDULE\n   Q3: Urgent + Not Important → DELEGATE\n   Q4: Not Urgent + Not Important → ELIMINATE\n→ Flag: any task that can be automated or batched\n\nSTEP 3 — DAILY EXECUTION PLAN\n→ MIT (Most Important Tasks): pick 3 non-negotiables per day\n→ Time block each task with realistic duration\n→ Build: Morning (deep work) → Midday (meetings/comms) → \n  Afternoon (admin) structure\n→ Buffer time: 20% of day reserved for unexpected tasks\n\nSTEP 4 — REVIEW SYSTEM\n→ End-of-day 5-minute review checklist\n→ Weekly reset: what carried over + why + fix\n→ Task completion rate tracking method"
    },
    "Time Management": {
      "name": "Time Management Prompt",
      "description": "Optimize generation for time management category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{lifestyle_context}}",
          "desc": "Lifestyle context",
          "type": "Text Input"
        },
        {
          "label": "{{biggest_challenge}}",
          "desc": "Biggest challenge",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are an elite time management coach and performance strategist.\n\nContext: {{lifestyle_context}}\nChallenge: {{biggest_challenge}}\nOutput: {{output_type}}\n\nYour task:\nPHASE 1 — TIME AUDIT\n→ Where does time currently go? (categories + estimated %)\n→ Time thieves: identify top 5 time-wasting patterns\n→ Calculate: actual productive hours vs total hours worked\n\nPHASE 2 — ENERGY MAPPING\n→ Peak energy hours: when is cognitive performance highest?\n→ Map: High Energy → Deep Work / Low Energy → Admin/Comms\n→ Ultradian rhythm: 90-min focus blocks with 20-min recovery\n\nPHASE 3 — IDEAL SCHEDULE DESIGN\n→ Build {{output_type}} based on {{lifestyle_context}}\n→ Structure:\n   DEEP WORK BLOCKS: 2–3 x 90-min sessions (protected)\n   SHALLOW WORK: email, meetings, admin (batched)\n   RECOVERY: breaks, movement, meals (non-negotiable)\n   BUFFER: 20% unscheduled for overflow\n\nPHASE 4 — CHALLENGE SOLUTIONS\n→ {{biggest_challenge}} specific fixes:\n   Meetings: default no + 25/50-min rule + async alternatives\n   Distractions: environment design + app blockers + focus rituals\n   Procrastination: 2-minute rule + implementation intentions\n   Reactive: designated response windows (not always-on)"
    },
    "Project Planning": {
      "name": "Project Planning Prompt",
      "description": "Optimize generation for project planning category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{project_name}}",
          "desc": "Project name",
          "type": "Text Input"
        },
        {
          "label": "{{team_size}}",
          "desc": "Team size",
          "type": "Text Input"
        },
        {
          "label": "{{timeline}}",
          "desc": "Timeline",
          "type": "Text Input"
        },
        {
          "label": "{{methodology}}",
          "desc": "Methodology",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are a certified project manager and planning strategist.\n\nProject: {{project_name}}\nTeam: {{team_size}}\nTimeline: {{timeline}}\nMethodology: {{methodology}}\n\nYour task:\nSECTION 1 — PROJECT CHARTER\n→ Project purpose (1 sentence — why this exists)\n→ Success criteria (3 measurable outcomes)\n→ Scope: IN scope vs OUT of scope (explicit list)\n→ Stakeholders: who needs to be informed vs involved\n\nSECTION 2 — WORK BREAKDOWN STRUCTURE\n→ Break project into phases → deliverables → tasks\n→ Format: Phase → Deliverable → Task → Owner → Duration\n\nSECTION 3 — TIMELINE & MILESTONES\n→ Key milestones with dates\n→ Critical path: tasks that cannot slip without delaying project\n→ Dependencies: what must happen before what\n\nSECTION 4 — RESOURCE PLAN\n→ Team roles + responsibilities (RACI matrix)\n→ Tools needed (project management + communication + delivery)\n→ Budget allocation if applicable\n\nSECTION 5 — RISK REGISTER\n→ Top 5 risks with:\n   Risk → Probability → Impact → Mitigation → Owner\n\nSECTION 6 — COMMUNICATION PLAN\n→ Meeting cadence (standup / weekly / milestone reviews)\n→ Status report format + frequency\n→ Escalation path for blockers"
    },
    "Meeting Notes": {
      "name": "Meeting Notes Prompt",
      "description": "Optimize generation for meeting notes category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{meeting_type}}",
          "desc": "Meeting type",
          "type": "Dropdown"
        },
        {
          "label": "{{meeting_context}}",
          "desc": "Meeting context",
          "type": "Text Input"
        },
        {
          "label": "{{output_needed}}",
          "desc": "Output needed",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an expert meeting facilitator and executive assistant.\n\nMeeting Type: {{meeting_type}}\nContext: {{meeting_context}}\nOutput: {{output_needed}}\n\nYour task:\n\nIF Pre-Meeting Agenda:\n→ Meeting objective (1 sentence — what decision/outcome is needed)\n→ Agenda items with time allocation:\n   [Time] → [Topic] → [Owner] → [Goal: Decision/Update/Discussion]\n→ Pre-read materials list\n→ What participants should prepare in advance\n→ Meeting rules: (no phones, decisions documented, one voice at a time)\n\nIF During-Meeting Template:\n→ Header: Date / Attendees / Facilitator / Note-taker\n→ Per agenda item:\n   Discussion Summary → Decision Made → Parking Lot Items\n→ Running action items table:\n   Action | Owner | Deadline | Priority\n\nIF Post-Meeting Summary:\n→ Meeting purpose + date + attendees\n→ Key Decisions Made (numbered list)\n→ Action Items: [Task] | [Owner] | [Due Date] | [Status: Open]\n→ Parking Lot: topics deferred to next meeting\n→ Next Meeting: date + objective + pre-work required\n\nIF Full Meeting Pack:\n→ All 3 sections above in order"
    },
    "Goal Tracking": {
      "name": "Goal Tracking Prompt",
      "description": "Optimize generation for goal tracking category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{goal_description}}",
          "desc": "Goal description",
          "type": "Text Input"
        },
        {
          "label": "{{timeframe}}",
          "desc": "Timeframe",
          "type": "Text Input"
        },
        {
          "label": "{{tracking_system}}",
          "desc": "Tracking system",
          "type": "Text Input"
        }
      ],
      "promptTemplate": "You are an elite performance coach and goal achievement strategist.\n\nGoal: {{goal_description}}\nTimeframe: {{timeframe}}\nSystem: {{tracking_system}}\n\nYour task:\nSTEP 1 — GOAL CLARITY\n→ Rewrite {{goal_description}} as a precise, measurable goal\n→ Current state: where are you now? (baseline)\n→ Target state: what does success look like exactly?\n→ Why it matters: connect to deeper motivation (Simon Sinek's WHY)\n→ Anti-goal: what happens if you DON'T achieve this?\n\nSTEP 2 — GOAL STRUCTURE ({{tracking_system}})\n→ OKR: 1 Objective + 3–5 Key Results (measurable)\n→ SMART: Specific / Measurable / Achievable / Relevant / Time-bound\n→ Milestone Map: Goal → Quarterly → Monthly → Weekly → Daily actions\n\nSTEP 3 — TRACKING SYSTEM\n→ Leading indicators: actions you control (daily/weekly)\n→ Lagging indicators: outcomes you measure (weekly/monthly)\n→ Weekly check-in template:\n   What was planned → What happened → % completion → Blocker → Fix\n\nSTEP 4 — ACCOUNTABILITY STRUCTURE\n→ Accountability method: (partner / public commitment / coach / self-review)\n→ Review cadence: daily micro / weekly macro / monthly full review\n→ Course correction trigger: when to adjust vs push through\n→ Reward milestones: celebrate at 25% / 50% / 75% / 100%"
    },
    "Workflow Optimization": {
      "name": "Workflow Optimization Prompt",
      "description": "Optimize generation for workflow optimization category with specific guidelines and structured output.",
      "variables": [
        {
          "label": "{{workflow_to_optimize}}",
          "desc": "Workflow to optimize",
          "type": "Text Input"
        },
        {
          "label": "{{main_problem}}",
          "desc": "Main problem",
          "type": "Text Input"
        },
        {
          "label": "{{output_type}}",
          "desc": "Output type",
          "type": "Dropdown"
        }
      ],
      "promptTemplate": "You are a senior operations strategist and workflow optimization expert.\n\nWorkflow: {{workflow_to_optimize}}\nProblem: {{main_problem}}\nOutput: {{output_type}}\n\nYour task:\nPHASE 1 — AS-IS ANALYSIS (Current State)\n→ Map every step in current workflow end-to-end\n→ Format: Step # → Action → Owner → Tool → Time Taken → Output\n→ Identify: bottlenecks, redundancies, manual steps, waiting time\n→ Calculate: total time current workflow takes vs value-added time only\n→ Waste audit: which steps add zero value and can be eliminated\n\nPHASE 2 — ROOT CAUSE DIAGNOSIS\n→ Diagnose {{main_problem}} with 5 Whys analysis\n→ Find: the one constraint that limits everything else (Theory of Constraints)\n→ Classify waste type: Overprocessing / Waiting / Rework / Handoff delays\n\nPHASE 3 — TO-BE DESIGN (Optimized State)\n→ Redesigned workflow with improvements:\n   Eliminated steps: [list]\n   Automated steps: [list with tool recommendation]\n   Simplified steps: [list]\n   Resequenced steps: [list]\n→ New flow: Step # → Action → Owner → Tool → Expected Time\n\nPHASE 4 — IMPLEMENTATION PLAN\n→ Quick wins (implement this week): 3 changes\n→ Medium fixes (implement this month): 3 changes\n→ System redesign (implement this quarter): full rollout\n→ Tools stack recommendation for optimized workflow\n→ Success metrics: how to know the optimization worked"
    }
  },
  "CREATIVE": {
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
  },
  "SOCIAL MEDIA": {
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
  },
  "ECOMMERCE": {
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
  },
  "OTHER": {
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
  }
};

module.exports = {
  TEXT_SUBCATEGORY_RULES,
  // Keep individual exports for backward compatibility in case they are imported elsewhere
  CREATIVE_RULES: TEXT_SUBCATEGORY_RULES['CREATIVE'],
  SOCIAL_MEDIA_RULES: TEXT_SUBCATEGORY_RULES['SOCIAL MEDIA'],
  ECOMMERCE_RULES: TEXT_SUBCATEGORY_RULES['ECOMMERCE'],
  OTHER_RULES: TEXT_SUBCATEGORY_RULES['OTHER']
};
