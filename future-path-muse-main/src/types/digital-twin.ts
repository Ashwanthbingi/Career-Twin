export interface DigitalTwinResponse {
  name: string;
  readinessScore: number;
  skillsCount: number;
  projectsCount: number;
  topCareer: string;
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
}
