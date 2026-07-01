from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- Resume Analysis Sub-models ---
class InferredSkill(BaseModel):
    name: str
    confidence: float
    evidence: str

class Strength(BaseModel):
    area: str
    score: int
    evidence: str

class Weakness(BaseModel):
    area: str
    score: int
    evidence: str

class Suitability(BaseModel):
    role: str
    score: int
    reasoning: str

class ResumeAnalysisResponse(BaseModel):
    inferred_skills: List[InferredSkill]
    hidden_skills: List[InferredSkill]
    strengths: List[Strength]
    weaknesses: List[Weakness]
    career_suitability: List[Suitability]
    summary: str


# --- GitHub Analysis Sub-models ---
class VerifiedSkill(BaseModel):
    name: str
    confidence: float
    evidence: str

class Complexity(BaseModel):
    score: int
    level: str
    reasoning: str

class Maturity(BaseModel):
    score: int
    level: str
    indicators: List[str]

class PortfolioSkill(BaseModel):
    name: str
    importance: str
    suggestion: str

class GitHubAnalysisResponse(BaseModel):
    verified_skills: List[VerifiedSkill]
    project_complexity: Complexity
    engineering_maturity: Maturity
    missing_portfolio_skills: List[PortfolioSkill]
    summary: str


# --- LeetCode Analysis Sub-models ---
class AlgoTopic(BaseModel):
    topic: str
    score: int
    assessment: Optional[str] = None
    recommendation: Optional[str] = None

class Readiness(BaseModel):
    service_companies: int
    product_companies: int
    faang_level: int
    reasoning: str

class LeetCodeAnalysisResponse(BaseModel):
    problem_solving_score: int
    algorithm_strengths: List[AlgoTopic]
    algorithm_weaknesses: List[AlgoTopic]
    interview_readiness: Readiness
    improvement_plan: List[str]
    summary: str


# --- Career Recommendation Sub-models ---
class RecommendationEvidence(BaseModel):
    resume: Optional[str] = ""
    github: Optional[str] = ""
    leetcode: Optional[str] = ""

class Recommendation(BaseModel):
    role: str
    score: int
    reasoning: str
    evidence: RecommendationEvidence
    gaps: List[str]
    next_steps: List[str]

class CareerRecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    summary: str


# --- Skill Validation Sub-models ---
class EvidenceDetail(BaseModel):
    source: str
    strength: int
    detail: str

class SkillValidationResponse(BaseModel):
    skill: str
    confidence: int
    evidence_summary: List[EvidenceDetail]
    industry_context: str
    related_skills: List[str]
    growth_suggestions: List[str]


# --- Roadmap Sub-models ---
class PhaseDetail(BaseModel):
    phase: int
    title: str
    duration: str
    skills_to_learn: List[str]
    actions: List[str]
    resources: List[str]
    milestones: List[str]

class RoadmapResponse(BaseModel):
    target_role: str
    estimated_timeline: str
    phases: List[PhaseDetail]
    summary: str
