# Prompt templates for RAG processing

RESUME_ANALYSIS_PROMPT = """You are a career intelligence system. Analyze the following resume context alongside the user's declared skills and relevant industry knowledge.

RESUME CONTENT:
{resume_text}

USER DECLARED SKILLS:
{user_skills}

CAREER GOALS:
{career_goals}

RELEVANT INDUSTRY KNOWLEDGE:
{retrieved_contexts}

Analyze the resume and output a JSON response. You MUST return ONLY a valid JSON object matching the following structure:
{{
  "inferred_skills": [
    {{
      "name": "Skill Name",
      "confidence": 0.85,
      "evidence": "Mention of building X in job role Y"
    }}
  ],
  "hidden_skills": [
    {{
      "name": "Implied Skill Name",
      "confidence": 0.75,
      "evidence": "Inferred from usage of Docker and AWS which implies container deployment"
    }}
  ],
  "strengths": [
    {{
      "area": "Area of strength",
      "score": 90,
      "evidence": "Details of the strength and projects"
    }}
  ],
  "weaknesses": [
    {{
      "area": "Skill gap or area needing improvement",
      "score": 40,
      "evidence": "Lacks mention of testing methodologies"
    }}
  ],
  "career_suitability": [
    {{
      "role": "Role Name",
      "score": 85,
      "reasoning": "Detailed fit justification"
    }}
  ],
  "summary": "High-level summary of the analysis."
}}

Do not include any explanation or markdown formatting outside of the JSON block. Verify the JSON is syntactically correct.
"""


GITHUB_ANALYSIS_PROMPT = """You are an engineering portfolio intelligence system. Analyze the user's GitHub repository summary alongside the industry knowledge to assess project complexity, engineering maturity, and verified skills.

GITHUB DATA:
Repositories: {repositories}
Languages: {languages}
Total Stars: {total_stars}
Contribution Score: {contribution_score}

RELEVANT INDUSTRY KNOWLEDGE:
{retrieved_contexts}

Analyze this technical portfolio and output a JSON response. You MUST return ONLY a valid JSON object matching the following structure:
{{
  "verified_skills": [
    {{
      "name": "Language or framework",
      "confidence": 0.90,
      "evidence": "Used in repositories A and B with complex integration code"
    }}
  ],
  "project_complexity": {{
    "score": 75,
    "level": "Intermediate",
    "reasoning": "Reasoning based on directory structure, configuration depth, database usage, and stars."
  }},
  "engineering_maturity": {{
    "score": 80,
    "level": "Mature",
    "indicators": [
      "Use of version control ignores (.gitignore)",
      "Standard config files present",
      "Code documentation/README quality"
    ]
  }},
  "missing_portfolio_skills": [
    {{
      "name": "Skill name",
      "importance": "High",
      "suggestion": "Recommendation on what kind of project to build to demonstrate this skill."
    }}
  ],
  "summary": "High-level summary of the GitHub portfolio analysis."
}}

Do not include any explanation or markdown formatting outside of the JSON block. Verify the JSON is syntactically correct.
"""


LEETCODE_ANALYSIS_PROMPT = """You are a technical interview preparation advisor. Analyze the user's LeetCode stats against the interview benchmark data to assess problem-solving capabilities, readiness for different categories of companies, and compile an improvement checklist.

LEETCODE STATS:
Total Solved: {total_solved}
Easy Solved: {easy_solved}
Medium Solved: {medium_solved}
Hard Solved: {hard_solved}
Contest Rating: {contest_rating}
Ranking: {ranking}
Self-reported Strengths: {strengths}
Self-reported Weaknesses: {weaknesses}

INTERVIEW BENCHMARK DATA:
{retrieved_contexts}

Analyze the stats and output a JSON response. You MUST return ONLY a valid JSON object matching the following structure:
{{
  "problem_solving_score": 75,
  "algorithm_strengths": [
    {{
      "topic": "Array / Hash Maps",
      "score": 85,
      "assessment": "Detailed assessment of their level"
    }}
  ],
  "algorithm_weaknesses": [
    {{
      "topic": "Dynamic Programming",
      "score": 45,
      "recommendation": "Detailed recommendation on patterns to solve"
    }}
  ],
  "interview_readiness": {{
    "service_companies": 90,
    "product_companies": 70,
    "faang_level": 45,
    "reasoning": "Detailed readiness assessment reasoning for each segment"
  }},
  "improvement_plan": [
    "Specific action item 1 (e.g. solve 15 BFS questions)",
    "Specific action item 2"
  ],
  "summary": "Overall summary of interview readiness."
}}

Do not include any explanation or markdown formatting outside of the JSON block. Verify the JSON is syntactically correct.
"""


CAREER_RECOMMENDATION_PROMPT = """You are a career coaching RAG system. Synthesize the user's complete profile—including resume, GitHub code data, and LeetCode algorithmic stats—with industry knowledge, salary ranges, and job roles to provide optimal, data-backed career recommendation paths.

USER PROFILE DETAILS:
Resume Text: {resume_text}
Core Skills: {skills}
GitHub Data: {github_data}
LeetCode Stats: {leetcode_data}
Career Goals: {career_goals}

RELEVANT INDUSTRY & ROLE KNOWLEDGE:
{retrieved_contexts}

Analyze the profile and output a JSON response. You MUST return ONLY a valid JSON object matching the following structure:
{{
  "recommendations": [
    {{
      "role": "Role Name (e.g. Backend Engineer)",
      "score": 92,
      "reasoning": "Justification for the fit",
      "evidence": {{
        "resume": "Evidence of experience in resume",
        "github": "Evidence of code and projects in github",
        "leetcode": "Evidence of problem solving"
      }},
      "gaps": [
        "Identified skill gap 1",
        "Identified skill gap 2"
      ],
      "next_steps": [
        "Immediate actionable next step 1",
        "Immediate actionable next step 2"
      ]
    }}
  ],
  "summary": "Summary of the general career outlook and advice."
}}

Do not include any explanation or markdown formatting outside of the JSON block. Verify the JSON is syntactically correct.
"""


SKILL_VALIDATION_PROMPT = """You are a skill verification system. Validate the user's expertise level in a specific skill by analyzing evidence gathered from their resume, GitHub repository portfolio, and LeetCode benchmarks.

TARGET SKILL: {skill_name}

GATHERED PROFILE EVIDENCE:
Resume Evidence: {resume_evidence}
GitHub Evidence: {github_evidence}
LeetCode Evidence: {leetcode_evidence}

RELEVANT INDUSTRY KNOWLEDGE ON THIS SKILL:
{retrieved_contexts}

Assess the skill and output a JSON response. You MUST return ONLY a valid JSON object matching the following structure:
{{
  "skill": "{skill_name}",
  "confidence": 85,
  "evidence_summary": [
    {{
      "source": "Resume",
      "strength": 80,
      "detail": "Detailed evaluation of resume evidence"
    }},
    {{
      "source": "GitHub",
      "strength": 90,
      "detail": "Detailed evaluation of repository usage and code"
    }},
    {{
      "source": "LeetCode",
      "strength": 60,
      "detail": "Detailed evaluation of algorithmic implementations"
    }}
  ],
  "industry_context": "How important and in-demand this skill is in the market today.",
  "related_skills": [
    "Related Skill 1",
    "Related Skill 2"
  ],
  "growth_suggestions": [
    "Advanced topic to study",
    "Project suggestion to build"
  ]
}}

Do not include any explanation or markdown formatting outside of the JSON block. Verify the JSON is syntactically correct.
"""


ROADMAP_PROMPT = """You are a curriculum design specialist. Create a personalized learning roadmap that bridges the user's current skill profile with a target career role, incorporating estimated timelines, study resource recommendations, and milestones.

USER PROFILE:
Current Skills: {current_skills}
Target Role: {target_role}
Experience Level: {experience_years} years
Career Goals: {career_goals}

RELEVANT LEARNING PATHS & ROLE DATA:
{retrieved_contexts}

Create the step-by-step roadmap and output a JSON response. You MUST return ONLY a valid JSON object matching the following structure:
{{
  "target_role": "{target_role}",
  "estimated_timeline": "6-9 months",
  "phases": [
    {{
      "phase": 1,
      "title": "Phase Title (e.g. AWS Core Services)",
      "duration": "2 months",
      "skills_to_learn": ["AWS S3", "IAM", "EC2"],
      "actions": [
        "Deploy a web service on EC2",
        "Configure AWS IAM roles"
      ],
      "resources": [
        "AWS Skill Builder",
        "FreeCodeCamp AWS course"
      ],
      "milestones": [
        "Pass AWS Practitioner exam",
        "Sandbox app fully deployed"
      ]
    }}
  ],
  "summary": "Roadmap execution advice and career transition outlook summary."
}}

Do not include any explanation or markdown formatting outside of the JSON block. Verify the JSON is syntactically correct.
"""
