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
