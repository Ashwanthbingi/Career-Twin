export interface DigitalTwinResponse {
  userId: number;
  userName: string;
  readinessScore: number;
  topCareer: string;
  topCareerRoleId: number | null;
  detectedSkills: SkillDto[];
  missingSkills: SkillDto[];
  strengths: string[];
  weaknesses: string[];
  projectedCareer: string;
  salaryProjection: string;
  skillsCount: number;
  projectsCount: number;
  lastUpdatedAt: string;
  skillGraph: SkillGraphDto[];
  careerMatches: CareerMatchDto[];
  skillGap: SkillGapResponse;
  roadmap: RoadmapResponse;
  hasResume: boolean;
  hasGitHubProfile: boolean;
  hasLeetCodeProfile: boolean;
}

export interface SkillGraphDto {
  skillId: number;
  name: string;
  category: string;
  strength: number;
  evidenceCount: number;
}

export interface SkillDto {
  id: number;
  name: string;
  category: string;
}

export interface CareerMatchDto {
  roleId: number;
  title: string;
  description: string;
  matchScore: number;
  matchedSkills: number;
  requiredSkills: number;
  matchedSkillDetails: SkillDto[];
}

export interface SkillGapResponse {
  userId: number;
  targetRoleId: number;
  targetRoleTitle: string;
  matchedSkills: SkillDto[];
  missingSkills: SkillDto[];
  recommendations: string[];
}

export interface RoadmapMilestoneDto {
  order: number;
  title: string;
  description: string;
  skills: string[];
  actions: string[];
}

export interface RoadmapResponse {
  userId: number;
  targetRoleId: number;
  targetRoleTitle: string;
  milestones: RoadmapMilestoneDto[];
}

export interface ResumeUploadResponse {
  userId: number;
  detectedSkillCount: number;
  detectedSkills: SkillDto[];
  extractedTextPreview: string;
  refresh: DigitalTwinRefreshResult;
}

export interface DigitalTwinRefreshResult {
  userId: number;
  targetRoleId: number | null;
  targetRoleTitle: string | null;
  careerMatchCount: number;
  matchedSkillCount: number;
  missingSkillCount: number;
  roadmapMilestoneCount: number;
  readinessScore: number;
  status: "REFRESHED";
}

export interface ResumeResponse {
  userId: number;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  storagePath: string;
  uploadedAt: string;
  updatedAt: string;
  detectedSkillCount: number;
  extractedTextPreview: string;
}

export interface GitHubProfileResponse {
  userId: number;
  githubUsername: string;
  repositories: number;
  stars: number;
  contributionScore: number;
  recommendedRole: string;
  languages: string[];
  detectedSkills: string[];
  updatedAt: string;
}

export interface GitHubAnalysisRequest {
  userId: number;
  githubUsername: string;
}

export interface GitHubAnalysisResponse {
  repositories: number;
  stars: number;
  languages: string[];
  detectedSkills: string[];
  contributionScore: number;
  recommendedRole: string;
}

export interface SkillEvidenceDto {
  source: string;
  evidence: string;
  confidenceScore: number;
  createdAt: string;
}

export interface ValidatedSkillResponse {
  skill: string;
  confidence: number;
  sources: string[];
  evidence: SkillEvidenceDto[];
}

export interface SkillConfidenceSummaryResponse {
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
}

export interface LeetCodeAnalysisRequest {
  userId: number;
  username: string;
}

export interface LeetCodeTopicScoreDto {
  topic: string;
  score: number;
  solved: number;
}

export interface InterviewReadinessDto {
  serviceCompanies: number;
  productCompanies: number;
  faangLevel: number;
}

export interface CodingTimelineDto {
  label: string;
  score: number;
}

export interface LeetCodeIntelligenceResponse {
  userId: number;
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number;
  ranking: number;
  problemSolvingScore: number;
  interviewReadiness: InterviewReadinessDto;
  topicBreakdown: LeetCodeTopicScoreDto[];
  strengths: string[];
  weaknesses: string[];
  growthTimeline: CodingTimelineDto[];
  updatedAt: string;
}

export interface RagInferredSkill {
  name: string;
  confidence: number;
  evidence: string;
}

export interface RagStrength {
  area: string;
  score: number;
  evidence: string;
}

export interface RagWeakness {
  area: string;
  score: number;
  evidence: string;
}

export interface RagSuitability {
  role: string;
  score: number;
  reasoning: string;
}

export interface RagResumeAnalysis {
  inferredSkills: RagInferredSkill[];
  hiddenSkills: RagInferredSkill[];
  strengths: RagStrength[];
  weaknesses: RagWeakness[];
  careerSuitability: RagSuitability[];
  summary: string;
}

export interface RagVerifiedSkill {
  name: string;
  confidence: number;
  evidence: string;
}

export interface RagComplexity {
  score: number;
  level: string;
  reasoning: string;
}

export interface RagMaturity {
  score: number;
  level: string;
  indicators: string[];
}

export interface RagPortfolioSkill {
  name: string;
  importance: string;
  suggestion: string;
}

export interface RagGitHubAnalysis {
  verifiedSkills: RagVerifiedSkill[];
  projectComplexity: RagComplexity;
  engineeringMaturity: RagMaturity;
  missingPortfolioSkills: RagPortfolioSkill[];
  summary: string;
}

export interface RagAlgoTopic {
  topic: string;
  score: number;
  assessment?: string;
  recommendation?: string;
}

export interface RagReadiness {
  serviceCompanies: number;
  productCompanies: number;
  faangLevel: number;
  reasoning: string;
}

export interface RagLeetCodeAnalysis {
  problemSolvingScore: number;
  algorithmStrengths: RagAlgoTopic[];
  algorithmWeaknesses: RagAlgoTopic[];
  interviewReadiness: RagReadiness;
  improvementPlan: string[];
  summary: string;
}

export interface RagRecommendationEvidence {
  resume?: string;
  github?: string;
  leetcode?: string;
}

export interface RagRecommendation {
  role: string;
  score: number;
  reasoning: string;
  evidence: RagRecommendationEvidence;
  gaps: string[];
  nextSteps: string[];
}

export interface RagCareerRecommendation {
  recommendations: RagRecommendation[];
  summary: string;
}

export interface RagEvidenceDetail {
  source: string;
  strength: number;
  detail: string;
}

export interface RagSkillValidation {
  skill: string;
  confidence: number;
  evidenceSummary: RagEvidenceDetail[];
  industryContext: string;
  relatedSkills: string[];
  growthSuggestions: string[];
}

export interface RagPhaseDetail {
  phase: number;
  title: string;
  duration: string;
  skillsToLearn: string[];
  actions: string[];
  resources: string[];
  milestones: string[];
}

export interface RagRoadmap {
  targetRole: string;
  estimatedTimeline: string;
  phases: RagPhaseDetail[];
  summary: string;
}
