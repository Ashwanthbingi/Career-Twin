import os
import json
import logging
import re
import requests
from config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    def generate(self, prompt: str) -> str:
        raise NotImplementedError("Subclasses must implement generate()")

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            # Standard flash model
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            logger.info("Gemini provider initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini SDK: {e}")
            raise e

    def generate(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            raise e

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.api_key)
            logger.info("OpenAI provider initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI SDK: {e}")
            raise e

    def generate(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            raise e

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url
        self.model = model
        logger.info(f"Ollama provider initialized with url: {base_url}, model: {model}")

    def generate(self, prompt: str) -> str:
        try:
            url = f"{self.base_url}/api/generate"
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2
                }
            }
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            return response.json().get("response", "")
        except Exception as e:
            logger.error(f"Error calling Ollama API: {e}")
            raise e

class MockProvider(LLMProvider):
    def __init__(self, reason: str = ""):
        self.reason = reason
        logger.warning(f"MockProvider initialized because: {reason or 'requested'}. Will return simulated data.")

    def generate(self, prompt: str) -> str:
        # Inspect prompt to see what kind of response is requested
        # and generate structured JSON simulation
        prompt_lower = prompt.lower()
        
        # Resume Analysis
        if "resume_text" in prompt_lower or "resume analysis" in prompt_lower:
            return json.dumps({
                "inferred_skills": [
                    {"name": "Microservices", "confidence": 0.88, "evidence": "Implied by design of distributed transaction flows and backend refactoring"},
                    {"name": "Docker", "confidence": 0.85, "evidence": "Mentioned deployment containerization and multi-stage builds"}
                ],
                "hidden_skills": [
                    {"name": "REST API Design", "confidence": 0.78, "evidence": "Created and optimized multiple Spring Boot endpoint mappings"}
                ],
                "strengths": [
                    {"area": "Backend Systems Integration", "score": 90, "evidence": "Architected Spring Boot services connecting with multiple databases"},
                    {"area": "Problem Solving", "score": 85, "evidence": "Refactored high-load SQL queries reducing execution time by 40%"}
                ],
                "weaknesses": [
                    {"area": "Frontend Responsive Design", "score": 40, "evidence": "Experience is heavily backend focused, lacks React hooks depth"}
                ],
                "career_suitability": [
                    {"role": "Backend Engineer", "score": 92, "reasoning": "Deep Java and Spring Boot backend knowledge aligns perfectly with core expectations"},
                    {"role": "Software Engineer", "score": 88, "reasoning": "Solid general programming, database, and system integration skills"},
                    {"role": "Cloud Architect", "score": 68, "reasoning": "Possesses baseline infrastructure ideas but needs cloud provider certifications"}
                ],
                "summary": "The candidate shows an excellent backend-heavy software engineering profile. They have proven capabilities with Java/Spring Boot ecosystems, API design, and system refactoring. Main development opportunities include frontend client integration and structured cloud system architectures."
            })
            
        # GitHub Analysis
        elif "repositories" in prompt_lower or "github-analysis" in prompt_lower:
            return json.dumps({
                "verified_skills": [
                    {"name": "Java", "confidence": 0.95, "evidence": "Found in 5 active repositories with extensive backend commits"},
                    {"name": "TypeScript", "confidence": 0.75, "evidence": "Main codebase and config files written in TypeScript"}
                ],
                "project_complexity": {
                    "score": 78,
                    "level": "Intermediate-Advanced",
                    "reasoning": "Multiple multi-component projects containing integration testing, config profiles, and service separation."
                },
                "engineering_maturity": {
                    "score": 72,
                    "level": "Mature",
                    "indicators": [
                        "Consistent usage of .gitignore and formatting configs",
                        "Clean commits showing evolutionary progress",
                        "Usage of standard design patterns"
                    ]
                },
                "missing_portfolio_skills": [
                    {"name": "Automated Testing", "importance": "High", "suggestion": "Add JUnit/Mockito tests in backend or Jest tests in frontend"}
                ],
                "summary": "GitHub repositories demonstrate a clean programming style with solid backend structures. Commit hygiene is good. Adding unit testing suites and complete README instructions would elevate portfolio maturity."
            })
            
        # LeetCode Analysis
        elif "leetcode" in prompt_lower or "interview_readiness" in prompt_lower:
            return json.dumps({
                "problem_solving_score": 75,
                "algorithm_strengths": [
                    {"topic": "Arrays", "score": 88, "assessment": "Fast implementation of windowing and pointer algorithms"},
                    {"topic": "Binary Search", "score": 82, "assessment": "Correct handling of boundary conditions in search tasks"}
                ],
                "algorithm_weaknesses": [
                    {"topic": "Dynamic Programming", "score": 45, "recommendation": "Practice classical 1D and 2D DP patterns like Knapsack or LCS"}
                ],
                "interview_readiness": {
                    "service_companies": 90,
                    "product_companies": 75,
                    "faang_level": 55,
                    "reasoning": "Strong fundamental programming logic allows clearing baseline technical interviews. Dynamic programming and advanced graph traversals need sharpening for top-tier product/FAANG rounds."
                },
                "improvement_plan": [
                    "Solve 20 medium-level Dynamic Programming problems",
                    "Study DFS/BFS graph patterns and topological sort",
                    "Participate in weekly LeetCode contests to build speed under pressure"
                ],
                "summary": "Solid problem-solving baseline. The candidate is ready for service-oriented technical interviews and competitive for entry-to-mid level product companies. Focus should now turn to advanced topics and speed."
            })
            
        # Career Recommendation
        elif "career" in prompt_lower or "recommendation" in prompt_lower:
            return json.dumps({
                "recommendations": [
                    {
                        "role": "Backend Engineer",
                        "score": 92,
                        "reasoning": "Strong evidence of Java, RESTful services, and database configuration across resume and GitHub.",
                        "evidence": {
                            "resume": "5 years development experience with Spring Boot",
                            "github": "Active Java repositories with database structures",
                            "leetcode": "Moderate-high problem-solving score demonstrating algorithmic logic"
                        },
                        "gaps": ["Cloud deployment", "CI/CD pipelines"],
                        "next_steps": ["Deploy a project to AWS or GCP", "Write a GitHub Actions CI/CD workflow"]
                    },
                    {
                        "role": "Fullstack Engineer",
                        "score": 80,
                        "reasoning": "Solid backend profile supplemented by TypeScript configurations in frontend UI repositories.",
                        "evidence": {
                            "resume": "Familiarity with frontend frameworks listed",
                            "github": "Some UI components visible",
                            "leetcode": "N/A"
                        },
                        "gaps": ["React hooks mastery", "State management expertise"],
                        "next_steps": ["Build a React project using TanStack Query and Context API"]
                    }
                ],
                "summary": "The candidate's profile is highly suited for backend engineering roles, showing high-confidence Java skills and database integration. Fullstack roles are secondary but highly viable with target learning."
            })
            
        # Skill Validation
        elif "skill_validation" in prompt_lower or "evidence_summary" in prompt_lower:
            return json.dumps({
                "skill": "Java",
                "confidence": 95,
                "evidence_summary": [
                    {"source": "Resume", "strength": 90, "detail": "Lists 5+ years of active development. Details Spring Boot API microservices built from scratch."},
                    {"source": "GitHub", "strength": 95, "detail": "Multiple active repositories containing spring-boot frameworks and advanced database connections."},
                    {"source": "LeetCode", "strength": 80, "detail": "Submissions completed in Java, reflecting solid language core semantics."}
                ],
                "industry_context": "Java remains a primary language in enterprise environments. It is highly valued for scale, security, and microservices architecture.",
                "related_skills": ["Spring Boot", "Hibernate", "Maven", "JUnit", "SQL"],
                "growth_suggestions": [
                    "Explore modern Java features (Java 21 Virtual Threads)",
                    "Implement a reactive web flow using Spring WebFlux"
                ]
            })
            
        # Roadmap
        elif "roadmap" in prompt_lower or "phases" in prompt_lower:
            return json.dumps({
                "target_role": "Cloud Architect",
                "estimated_timeline": "12-18 months",
                "phases": [
                    {
                        "phase": 1,
                        "title": "Cloud Computing Fundamentals",
                        "duration": "3 months",
                        "skills_to_learn": ["AWS Core Services (EC2, S3, RDS)", "Cloud IAM", "VPC & Networking"],
                        "actions": [
                            "Study and pass the AWS Certified Cloud Practitioner exam",
                            "Deploy a basic web application on AWS EC2 behind an ALB with a RDS database"
                        ],
                        "resources": ["AWS Skill Builder", "Stephane Maarek's AWS Course on Udemy"],
                        "milestones": ["AWS Certified Cloud Practitioner certification obtained", "Deployed 3-tier architecture sandbox project"]
                    },
                    {
                        "phase": 2,
                        "title": "Infrastructure as Code & DevOps",
                        "duration": "4 months",
                        "skills_to_learn": ["Terraform", "Docker", "GitHub Actions CI/CD"],
                        "actions": [
                            "Convert your manual AWS infrastructure into Terraform code",
                            "Build containerized Docker images and automate deployments via GitHub Actions"
                        ],
                        "resources": ["HashiCorp Learn portal", "Nana Janashia's DevOps bootcamp"],
                        "milestones": ["All dev infrastructure managed via git-tracked IaC templates"]
                    },
                    {
                        "phase": 3,
                        "title": "Advanced Design Patterns & Security",
                        "duration": "5 months",
                        "skills_to_learn": ["AWS Solutions Architect Assoc topics", "Serverless (Lambda, DynamoDB)", "Microservices at Scale"],
                        "actions": [
                            "Migrate web app components to Serverless architectures",
                            "Study and pass the AWS Certified Solutions Architect - Associate exam"
                        ],
                        "resources": ["Adrian Cantrill's AWS Solutions Architect course"],
                        "milestones": ["AWS Solutions Architect Associate certification obtained"]
                    }
                ],
                "summary": "A structured transition roadmap leveraging existing backend expertise to master AWS services, DevOps principles, and scalable system design."
            })
            
        # Generic Response
        else:
            return json.dumps({
                "response": "Simulation complete.",
                "input_detected": prompt_lower[:100]
            })

def get_llm_provider() -> LLMProvider:
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "gemini":
        if settings.GEMINI_API_KEY:
            try:
                return GeminiProvider(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.error(f"Fallback to MockProvider due to Gemini initialization error: {e}")
                return MockProvider(reason=f"Gemini initialization error: {e}")
        else:
            return MockProvider(reason="GEMINI_API_KEY is not configured")
            
    elif provider == "openai":
        if settings.OPENAI_API_KEY:
            try:
                return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                logger.error(f"Fallback to MockProvider due to OpenAI initialization error: {e}")
                return MockProvider(reason=f"OpenAI initialization error: {e}")
        else:
            return MockProvider(reason="OPENAI_API_KEY is not configured")
            
    elif provider == "ollama":
        return OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL)
        
    else:
        logger.warning(f"Unknown LLM provider '{settings.LLM_PROVIDER}'. Defaulting to MockProvider.")
        return MockProvider(reason=f"Unknown provider '{settings.LLM_PROVIDER}'")

def clean_json_response(text: str) -> dict:
    """
    Cleans markdown wraps from code blocks (e.g. ```json ... ```) 
    and parses the text as JSON.
    """
    # Regex to find ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    cleaned_text = match.group(1) if match else text
    cleaned_text = cleaned_text.strip()
    
    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from text: {cleaned_text[:500]}")
        # Try to search for a JSON dictionary block { ... } in the text
        dict_match = re.search(r"({[\s\S]*})", cleaned_text)
        if dict_match:
            try:
                return json.loads(dict_match.group(1))
            except Exception:
                pass
        raise e

def generate_with_context(prompt_template: str, variables: dict, retrieved_contexts: list[dict]) -> dict:
    """
    Combines prompt template with user variables and retrieved RAG context.
    Executes the prompt and returns a parsed JSON dictionary.
    """
    # Format retrieved contexts
    context_str = ""
    for i, ctx in enumerate(retrieved_contexts):
        metadata = ctx.get("metadata", {})
        col = ctx.get("collection", "general")
        name = metadata.get("item_name") or metadata.get("role") or metadata.get("name") or "Item"
        context_str += f"[{i+1}] Source: {col} ({name})\nContent:\n{ctx['text']}\n\n"
        
    if not context_str:
        context_str = "No specific reference documents found in knowledge base."

    # Format the prompt
    format_args = {**variables, "retrieved_contexts": context_str}
    
    # Use key substitution safely (handling curly brackets inside prompts if any)
    # We can perform simple replacement or safe formatting
    prompt = prompt_template.format(**format_args)
    
    provider = get_llm_provider()
    logger.info(f"Generating content using LLM provider: {type(provider).__name__}")
    
    raw_response = provider.generate(prompt)
    
    try:
        return clean_json_response(raw_response)
    except Exception as e:
        logger.error(f"Error parsing LLM response as JSON: {e}. Raw response: {raw_response[:1000]}")
        # Return fallback structures in case parsing failed completely
        raise ValueError(f"Invalid JSON returned by LLM: {e}")
