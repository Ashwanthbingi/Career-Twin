from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    user_skills: List[str]
    career_goals: List[str]

class GitHubAnalysisRequest(BaseModel):
    repositories: List[Dict[str, Any]]
    languages: List[str]
    total_stars: int
    contribution_score: int

class LeetCodeAnalysisRequest(BaseModel):
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    contest_rating: Optional[float] = None
    ranking: Optional[int] = None
    strengths: List[str] = []
    weaknesses: List[str] = []

class CareerRecommendationRequest(BaseModel):
    resume_text: Optional[str] = ""
    skills: List[str] = []
    github_data: Optional[Dict[str, Any]] = None
    leetcode_data: Optional[Dict[str, Any]] = None
    career_goals: List[str] = []

class SkillValidationRequest(BaseModel):
    skill_name: str
    resume_evidence: Optional[str] = ""
    github_evidence: Optional[Optional[str]] = ""
    leetcode_evidence: Optional[Optional[str]] = ""

class RoadmapRequest(BaseModel):
    current_skills: List[str]
    target_role: str
    experience_years: int
    career_goals: List[str] = []
