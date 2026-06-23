import {
  DigitalTwinResponse,
  CareerMatchDto,
  SkillGapResponse,
  RoadmapResponse,
  ResumeUploadResponse,
  GitHubAnalysisRequest,
  GitHubAnalysisResponse,
  GitHubProfileResponse,
  ResumeResponse,
  SkillGraphDto,
  ValidatedSkillResponse,
  SkillConfidenceSummaryResponse,
  LeetCodeAnalysisRequest,
  LeetCodeIntelligenceResponse,
  SkillDto,
  CodingTimelineDto,
  LeetCodeTopicScoreDto,
  RagResumeAnalysis,
  RagGitHubAnalysis,
  RagLeetCodeAnalysis,
  RagCareerRecommendation,
  RagSkillValidation,
  RagRoadmap,
} from "../types/digital-twin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const USE_MOCK_BACKEND = !import.meta.env.VITE_API_URL;

export interface UploadResumeOptions {
  onProgress?: (progress: number) => void;
}

// ==========================================
// CLIENT-SIDE LOCALSTORAGE MOCK DATA STORE
// ==========================================

interface LocalUserState {
  userId: number;
  userName: string;
  hasResume: boolean;
  resumeFilename: string | null;
  resumeSize: number | null;
  resumeUploadedAt: string | null;
  resumeExtractedText: string | null;
  
  hasGitHubProfile: boolean;
  githubUsername: string | null;
  githubRepositories: number;
  githubStars: number;
  githubLanguages: string[];
  githubSkills: string[];
  githubContributionScore: number;
  
  hasLeetCodeProfile: boolean;
  leetcodeUsername: string | null;
  leetcodeTotalSolved: number;
  leetcodeEasySolved: number;
  leetcodeMediumSolved: number;
  leetcodeHardSolved: number;
  leetcodeContestRating: number;
  leetcodeRanking: number;
  leetcodeProblemSolvingScore: number;
  leetcodeTopicScores: LeetCodeTopicScoreDto[];
  leetcodeStrengths: string[];
  leetcodeWeaknesses: string[];
  leetcodeTimeline: CodingTimelineDto[];
  
  userSkills: { skillId: number; sources: string[] }[];
}

const SKILLS: SkillDto[] = [
  { id: 1, name: "Java", category: "Technical" },
  { id: 2, name: "JavaScript", category: "Technical" },
  { id: 3, name: "SQL", category: "Data" },
  { id: 4, name: "Systems Design", category: "Technical" },
  { id: 5, name: "DevOps", category: "Technical" },
  { id: 6, name: "Python", category: "Technical" },
  { id: 7, name: "Machine Learning", category: "Data" },
  { id: 8, name: "Data Analysis", category: "Data" },
  { id: 9, name: "Public Speaking", category: "Communication" },
  { id: 10, name: "Product Strategy", category: "Leadership" },
  { id: 11, name: "Project Management", category: "Leadership" },
  { id: 12, name: "Negotiation", category: "Communication" },
  { id: 13, name: "Engineering Leadership", category: "Leadership" },
  { id: 14, name: "Cloud Computing", category: "Technical" },
  { id: 15, name: "UI/UX Design", category: "Technical" },
];

const SKILL_KEYWORDS: Record<number, string[]> = {
  1: ["java", "spring", "hibernate", "maven"],
  2: ["javascript", "typescript", "node.js", "react", "vue", "angular"],
  3: ["sql", "postgresql", "mysql", "queries", "database"],
  4: ["systems design", "architecture", "microservices", "distributed systems"],
  5: ["devops", "ci/cd", "docker", "kubernetes", "jenkins", "github actions"],
  6: ["python", "django", "flask"],
  7: ["machine learning", "ml", "scikit-learn", "tensorflow", "pytorch"],
  8: ["data analysis", "analytics", "excel", "pandas", "numpy"],
  9: ["public speaking", "presentations", "keynote", "speaking"],
  10: ["product strategy", "roadmap", "product management", "prd"],
  11: ["project management", "agile", "scrum", "jira"],
  12: ["negotiation", "deal-making", "contract"],
  13: ["engineering leadership", "team lead", "mentoring", "manager"],
  14: ["cloud computing", "aws", "azure", "gcp", "serverless"],
  15: ["ui/ux", "figma", "wireframes", "prototyping", "design system"],
};

const JOB_ROLES = [
  {
    id: 1,
    title: "Software Engineer",
    description: "Builds and maintains software applications across the stack.",
    skills: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: "Data Scientist",
    description: "Analyzes data and builds predictive models to drive decisions.",
    skills: [6, 3, 7, 8, 9],
  },
  {
    id: 3,
    title: "Product Manager",
    description: "Defines product vision and coordinates cross-functional delivery.",
    skills: [10, 11, 12, 9, 8],
  },
  {
    id: 4,
    title: "Engineering Manager",
    description: "Leads engineering teams and drives technical execution.",
    skills: [13, 4, 11, 12, 1],
  },
  {
    id: 5,
    title: "Cloud Architect",
    description: "Designs scalable cloud infrastructure and platform solutions.",
    skills: [14, 4, 5, 1, 3],
  },
  {
    id: 6,
    title: "UX Designer",
    description: "Designs intuitive user experiences and interaction flows.",
    skills: [15, 9, 10, 2, 8],
  },
];

const DEFAULT_USER_STATE: Omit<LocalUserState, "userId"> = {
  userName: "Demo User",
  hasResume: true,
  resumeFilename: "John_Doe_Developer_Resume.pdf",
  resumeSize: 145000,
  resumeUploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  resumeExtractedText: "John Doe\nSoftware Engineer\nSpecialized in JavaScript, SQL, and Systems Design.",
  
  hasGitHubProfile: false,
  githubUsername: null,
  githubRepositories: 0,
  githubStars: 0,
  githubLanguages: [],
  githubSkills: [],
  githubContributionScore: 0,
  
  hasLeetCodeProfile: false,
  leetcodeUsername: null,
  leetcodeTotalSolved: 0,
  leetcodeEasySolved: 0,
  leetcodeMediumSolved: 0,
  leetcodeHardSolved: 0,
  leetcodeContestRating: 0,
  leetcodeRanking: 0,
  leetcodeProblemSolvingScore: 0,
  leetcodeTopicScores: [],
  leetcodeStrengths: [],
  leetcodeWeaknesses: [],
  leetcodeTimeline: [],
  
  userSkills: [
    { skillId: 2, sources: ["resume"] }, // JavaScript
    { skillId: 3, sources: ["resume"] }, // SQL
    { skillId: 4, sources: ["resume"] }, // Systems Design
  ],
};

function getStorageItem(key: string): string | null {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(key);
  }
  return null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  }
}

function getUserState(userId: number): LocalUserState {
  const key = `twinos_user_${userId}`;
  const stored = getStorageItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as LocalUserState;
    } catch {
      // invalid stored value, fall through
    }
  }
  
  const state: LocalUserState = {
    userId,
    ...DEFAULT_USER_STATE,
  };
  saveUserState(userId, state);
  return state;
}

function saveUserState(userId: number, state: LocalUserState): void {
  const key = `twinos_user_${userId}`;
  setStorageItem(key, JSON.stringify(state));
}

// Sync helpers

function getCareerMatchesSync(state: LocalUserState): CareerMatchDto[] {
  return JOB_ROLES.map(role => {
    const matchedSkillDetails = SKILLS.filter(s => 
      role.skills.includes(s.id) && state.userSkills.some(us => us.skillId === s.id)
    );
    const matchScore = Math.max(15, Math.round((matchedSkillDetails.length / role.skills.length) * 100));
    return {
      roleId: role.id,
      title: role.title,
      description: role.description,
      matchScore,
      matchedSkills: matchedSkillDetails.length,
      requiredSkills: role.skills.length,
      matchedSkillDetails,
    };
  });
}

function getSkillGapSync(state: LocalUserState, targetRoleId: number): SkillGapResponse {
  const role = JOB_ROLES.find(r => r.id === targetRoleId) || JOB_ROLES[0];
  const matchedSkills = SKILLS.filter(s => 
    role.skills.includes(s.id) && state.userSkills.some(us => us.skillId === s.id)
  );
  const missingSkills = SKILLS.filter(s => 
    role.skills.includes(s.id) && !state.userSkills.some(us => us.skillId === s.id)
  );
  
  const recommendations = missingSkills.map(s => {
    if (s.name === "Java") return "Complete a deep-dive course on Spring Boot and REST API development.";
    if (s.name === "DevOps") return "Deploy a multi-service application using Docker and CI/CD pipelines.";
    if (s.name === "Python") return "Complete 3 data analysis projects using Pandas, NumPy, and Jupyter Notebooks.";
    if (s.name === "Machine Learning") return "Train and evaluate models using Scikit-Learn and TensorFlow on Kaggle datasets.";
    if (s.name === "Product Strategy") return "Draft a full product requirements document (PRD) and roadmap for a new feature.";
    if (s.name === "UI/UX Design") return "Create interactive high-fidelity wireframes in Figma matching standard design systems.";
    return `Practice practical exercises to evidence your skill strength in ${s.name}.`;
  });

  return {
    userId: state.userId,
    targetRoleId,
    targetRoleTitle: role.title,
    matchedSkills,
    missingSkills,
    recommendations,
  };
}

function getRoadmapSync(state: LocalUserState, targetRoleId: number): RoadmapResponse {
  const role = JOB_ROLES.find(r => r.id === targetRoleId) || JOB_ROLES[0];
  const missingSkills = SKILLS.filter(s => 
    role.skills.includes(s.id) && !state.userSkills.some(us => us.skillId === s.id)
  );
  
  const milestones = [
    {
      order: 1,
      title: "Core Capability Alignment",
      description: `Build baseline knowledge in the core skill gap areas for a ${role.title}.`,
      skills: missingSkills.slice(0, 2).map(s => s.name),
      actions: missingSkills.slice(0, 2).map(s => `Read documentation and complete starter tutorials for ${s.name}.`),
    },
    {
      order: 2,
      title: "Portfolio Building",
      description: "Apply your knowledge in standalone projects to build evidence for validation.",
      skills: missingSkills.slice(2).map(s => s.name).concat(missingSkills.length === 0 ? ["Systems Architecture"] : []),
      actions: [
        "Create a public GitHub repository showcasing integration of key patterns.",
        "Add comprehensive tests and CI/CD workflows.",
      ],
    },
    {
      order: 3,
      title: "LeetCode & Interview Preparation",
      description: "Refine DSA problem solving and systems design communication for technical vetting.",
      skills: ["Data Structures", "Algorithms", "Systems Design"],
      actions: [
        "Solve 50+ medium difficulty problems on LeetCode focusing on arrays and trees.",
        "Conduct a mock system design interview.",
      ],
    },
  ];

  return {
    userId: state.userId,
    targetRoleId,
    targetRoleTitle: role.title,
    milestones,
  };
}

function getSkillGraphSync(state: LocalUserState, careerMatches: CareerMatchDto[]): SkillGraphDto[] {
  const strengths: Record<number, number> = {};
  for (const match of careerMatches) {
    for (const skill of match.matchedSkillDetails) {
      strengths[skill.id] = Math.max(strengths[skill.id] || 0, match.matchScore);
    }
  }
  return state.userSkills.map(us => {
    const skill = SKILLS.find(s => s.id === us.skillId)!;
    return {
      skillId: us.skillId,
      name: skill.name,
      category: skill.category,
      strength: Math.min(100, strengths[us.skillId] || 35),
      evidenceCount: us.sources.length,
    };
  }).sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));
}

function getProjectedCareer(topTitle: string, missingSkills: SkillDto[]): string {
  if (missingSkills.length === 0) {
    return `Ready to pursue ${topTitle} now.`;
  }
  return `On track for ${topTitle} after closing ${Math.min(3, missingSkills.length)} priority skill gaps.`;
}

function getSalaryProjection(readinessScore: number): string {
  if (readinessScore >= 85) return "$140k-$180k";
  if (readinessScore >= 65) return "$110k-$145k";
  if (readinessScore >= 40) return "$85k-$120k";
  return "$65k-$95k";
}

// ==========================================
// EXPORTED SERVICE FUNCTIONS
// ==========================================

export async function fetchDigitalTwin(userId: number): Promise<DigitalTwinResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/digital-twin?userId=${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  const careerMatches = getCareerMatchesSync(state);
  const topMatch = careerMatches.reduce((max, m) => m.matchScore > max.matchScore ? m : max, careerMatches[0]);
  const skillGap = getSkillGapSync(state, topMatch.roleId);
  const roadmap = getRoadmapSync(state, topMatch.roleId);
  
  const strengths = state.userSkills.map(us => SKILLS.find(s => s.id === us.skillId)!).filter(Boolean).map(s => s.name);
  const weaknesses = skillGap.missingSkills.map(s => s.name);
  
  let readinessScore = topMatch.matchScore;
  if (state.hasLeetCodeProfile) {
    readinessScore = Math.min(100, Math.round(readinessScore * 0.85 + state.leetcodeProblemSolvingScore * 0.15));
  }
  
  const detectedSkills = state.userSkills.map(us => SKILLS.find(s => s.id === us.skillId)!).filter(Boolean);
  
  return {
    userId: state.userId,
    userName: state.userName,
    readinessScore,
    topCareer: topMatch.title,
    topCareerRoleId: topMatch.roleId,
    detectedSkills,
    missingSkills: skillGap.missingSkills,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    projectedCareer: getProjectedCareer(topMatch.title, skillGap.missingSkills),
    salaryProjection: getSalaryProjection(readinessScore),
    skillsCount: detectedSkills.length,
    projectsCount: state.hasGitHubProfile ? state.githubRepositories : 1,
    lastUpdatedAt: state.resumeUploadedAt || new Date().toISOString(),
    skillGraph: getSkillGraphSync(state, careerMatches),
    careerMatches,
    skillGap,
    roadmap,
    hasResume: state.hasResume,
    hasGitHubProfile: state.hasGitHubProfile,
    hasLeetCodeProfile: state.hasLeetCodeProfile,
  };
}

export async function refreshDigitalTwin(userId: number): Promise<DigitalTwinResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/digital-twin/refresh?userId=${userId}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
  
  // Just return calculated state
  return fetchDigitalTwin(userId);
}

export async function fetchSkillGraph(userId: number): Promise<SkillGraphDto[]> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/digital-twin/skill-graph?userId=${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  const careerMatches = getCareerMatchesSync(state);
  return getSkillGraphSync(state, careerMatches);
}

export async function fetchCurrentResume(userId: number): Promise<ResumeResponse | null> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/resume?userId=${userId}`;
    const response = await fetch(url);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  if (!state.hasResume || !state.resumeFilename) {
    return null;
  }
  
  const detectedSkills = state.userSkills.filter(us => us.sources.includes("resume"));
  
  return {
    userId: state.userId,
    originalFilename: state.resumeFilename,
    fileSize: state.resumeSize || 0,
    contentType: "application/pdf",
    storagePath: "./data/resumes/" + state.resumeFilename,
    uploadedAt: state.resumeUploadedAt || new Date().toISOString(),
    updatedAt: state.resumeUploadedAt || new Date().toISOString(),
    detectedSkillCount: detectedSkills.length,
    extractedTextPreview: state.resumeExtractedText || "",
  };
}

export async function fetchCareerMatches(userId: number): Promise<CareerMatchDto[]> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/career-match?userId=${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  return getCareerMatchesSync(state);
}

export async function fetchSkillGap(userId: number, targetRoleId: number): Promise<SkillGapResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/skill-gap?userId=${userId}&targetRoleId=${targetRoleId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  return getSkillGapSync(state, targetRoleId);
}

export async function fetchRoadmap(userId: number, targetRoleId: number): Promise<RoadmapResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/roadmap?userId=${userId}&targetRoleId=${targetRoleId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  return getRoadmapSync(state, targetRoleId);
}

export async function uploadResume(
  userId: number,
  file: File,
  options: UploadResumeOptions = {}
): Promise<ResumeUploadResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/resume/replace`;
    const formData = new FormData();
    formData.append("userId", String(userId));
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const uploaded = Math.round((event.loaded / event.total) * 95);
        options.onProgress?.(Math.min(uploaded, 95));
      };
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(xhr.responseText || `HTTP error! status: ${xhr.status}`));
          return;
        }
        try {
          options.onProgress?.(100);
          resolve(JSON.parse(xhr.responseText) as ResumeUploadResponse);
        } catch {
          reject(new Error("Failed to parse resume upload response."));
        }
      };
      xhr.onerror = () => reject(new Error("Resume upload failed. Please check your connection."));
      xhr.onabort = () => reject(new Error("Resume upload was cancelled."));
      xhr.open("POST", url);
      xhr.send(formData);
    });
  }

  // Client-side fallback simulation
  options.onProgress?.(10);
  await new Promise(r => setTimeout(r, 400));
  options.onProgress?.(45);
  await new Promise(r => setTimeout(r, 400));
  options.onProgress?.(80);
  await new Promise(r => setTimeout(r, 400));
  options.onProgress?.(95);
  await new Promise(r => setTimeout(r, 200));

  const state = getUserState(userId);
  const text = `${file.name} ${file.type}`.toLowerCase();
  const detectedIds = new Set<number>();
  
  for (const skill of SKILLS) {
    const keywords = SKILL_KEYWORDS[skill.id];
    if (keywords.some(kw => text.includes(kw))) {
      detectedIds.add(skill.id);
    }
  }

  // Fallback seeder values if no keyword is matched in the filename
  if (detectedIds.size === 0) {
    detectedIds.add(2); // JavaScript
    detectedIds.add(3); // SQL
    detectedIds.add(4); // Systems Design
  }

  // Save detected skills
  state.hasResume = true;
  state.resumeFilename = file.name;
  state.resumeSize = file.size;
  state.resumeUploadedAt = new Date().toISOString();
  
  const detectedSkills = Array.from(detectedIds).map(id => SKILLS.find(s => s.id === id)!);
  state.resumeExtractedText = `Extracted resume preview from ${file.name}. Validated skill match: ${detectedSkills.map(s => s.name).join(", ")}.`;

  // Merge into userSkills
  // remove old resume sources first to prevent duplicate accumulation
  state.userSkills = state.userSkills.map(us => ({
    ...us,
    sources: us.sources.filter(src => src !== "resume")
  })).filter(us => us.sources.length > 0);

  for (const skill of detectedSkills) {
    const existing = state.userSkills.find(us => us.skillId === skill.id);
    if (existing) {
      existing.sources.push("resume");
    } else {
      state.userSkills.push({ skillId: skill.id, sources: ["resume"] });
    }
  }

  saveUserState(userId, state);
  options.onProgress?.(100);

  const careerMatches = getCareerMatchesSync(state);
  const topMatch = careerMatches.reduce((max, m) => m.matchScore > max.matchScore ? m : max, careerMatches[0]);

  return {
    userId,
    detectedSkillCount: detectedSkills.length,
    detectedSkills,
    extractedTextPreview: state.resumeExtractedText,
    refresh: {
      userId,
      targetRoleId: topMatch.roleId,
      targetRoleTitle: topMatch.title,
      careerMatchCount: careerMatches.length,
      matchedSkillCount: detectedSkills.length,
      missingSkillCount: 5 - detectedSkills.length,
      roadmapMilestoneCount: 3,
      readinessScore: topMatch.matchScore,
      status: "REFRESHED",
    },
  };
}

export async function fetchValidatedSkills(userId: number): Promise<ValidatedSkillResponse[]> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/skills/validated?userId=${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  return state.userSkills.map(us => {
    const skill = SKILLS.find(s => s.id === us.skillId)!;
    const confidence = us.sources.length >= 3 ? 95 : us.sources.length === 2 ? 85 : 55;
    
    const evidence = us.sources.map(src => {
      let detail = `Verified via uploaded resume: ${state.resumeFilename}`;
      if (src === "github") {
        detail = `Detected in GitHub account ${state.githubUsername || ""} across public repositories.`;
      } else if (src === "leetcode") {
        detail = `Validated through topic-specific LeetCode problems solved.`;
      }
      return {
        source: src === "github" ? "GITHUB" : src === "leetcode" ? "LEETCODE" : "RESUME",
        evidence: detail,
        confidenceScore: src === "github" ? 85 : src === "leetcode" ? 90 : 65,
        createdAt: state.resumeUploadedAt || new Date().toISOString(),
      };
    });

    return {
      skill: skill.name,
      confidence,
      sources: us.sources.map(s => s.toUpperCase()),
      evidence,
    };
  });
}

export async function fetchSkillValidations(userId: number): Promise<ValidatedSkillResponse[]> {
  // Aliased to validated skills in the UI
  return fetchValidatedSkills(userId);
}

export async function fetchSkillConfidenceSummary(userId: number): Promise<SkillConfidenceSummaryResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/skills/confidence-summary?userId=${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const validated = await fetchValidatedSkills(userId);
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const s of validated) {
    if (s.confidence >= 90) high++;
    else if (s.confidence >= 70) medium++;
    else low++;
  }

  return {
    highConfidence: high,
    mediumConfidence: medium,
    lowConfidence: low,
  };
}

export async function analyzeGitHubPortfolio(request: GitHubAnalysisRequest): Promise<GitHubAnalysisResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/github/analyze`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(request.userId);
  const username = request.githubUsername.trim();
  
  let reposCount = 15;
  let totalStars = 24;
  let languages = ["TypeScript", "JavaScript", "HTML", "CSS"];
  const detectedSkillsSet = new Set<string>(["JavaScript", "TypeScript"]);
  
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        reposCount = data.length;
        totalStars = data.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
        
        const langSet = new Set<string>();
        for (const repo of data) {
          if (repo.language) {
            langSet.add(repo.language);
            // Add language as a skill match if it is in our skills list
            const matchedLang = SKILLS.find(s => s.name.toLowerCase() === repo.language.toLowerCase());
            if (matchedLang) {
              detectedSkillsSet.add(matchedLang.name);
            }
          }
          
          const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
          for (const skill of SKILLS) {
            const keywords = SKILL_KEYWORDS[skill.id];
            if (keywords.some(kw => text.includes(kw))) {
              detectedSkillsSet.add(skill.name);
            }
          }
        }
        languages = Array.from(langSet).slice(0, 8);
      }
    }
  } catch (err) {
    console.warn("GitHub live API fetch failed, falling back to mock values", err);
  }

  // Update state
  state.hasGitHubProfile = true;
  state.githubUsername = username;
  state.githubRepositories = reposCount;
  state.githubStars = totalStars;
  state.githubLanguages = languages;
  state.githubSkills = Array.from(detectedSkillsSet);

  const contributionScore = Math.min(
    100,
    reposCount * 3 + Math.min(35, totalStars / 2) + detectedSkillsSet.size * 5
  );
  state.githubContributionScore = contributionScore;

  // Add github as a source for linked skills
  for (const skillName of detectedSkillsSet) {
    const skill = SKILLS.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (skill) {
      const existing = state.userSkills.find(us => us.skillId === skill.id);
      if (existing) {
        if (!existing.sources.includes("github")) {
          existing.sources.push("github");
        }
      } else {
        state.userSkills.push({ skillId: skill.id, sources: ["github"] });
      }
    }
  }

  saveUserState(request.userId, state);

  return {
    repositories: reposCount,
    stars: totalStars,
    languages,
    detectedSkills: Array.from(detectedSkillsSet),
    contributionScore,
    recommendedRole: "Software Engineer",
  };
}

export async function fetchGitHubProfile(userId: number): Promise<GitHubProfileResponse | null> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/github/profile?userId=${userId}`;
    const response = await fetch(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  if (!state.hasGitHubProfile || !state.githubUsername) {
    return null;
  }

  return {
    userId: state.userId,
    githubUsername: state.githubUsername,
    repositories: state.githubRepositories,
    stars: state.githubStars,
    contributionScore: state.githubContributionScore,
    recommendedRole: "Software Engineer",
    languages: state.githubLanguages,
    detectedSkills: state.githubSkills,
    updatedAt: new Date().toISOString(),
  };
}

export async function analyzeLeetCodeProfile(request: LeetCodeAnalysisRequest): Promise<LeetCodeIntelligenceResponse> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/leetcode/analyze`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(request.userId);
  const username = request.username.trim();

  // Seed deterministic simulation values based on username
  const seed = username.length * 15;
  const totalSolved = 75 + (seed % 180);
  const easySolved = Math.round(totalSolved * 0.45);
  const mediumSolved = Math.round(totalSolved * 0.45);
  const hardSolved = totalSolved - easySolved - mediumSolved;
  const rating = 1450 + (seed % 400);
  const ranking = 120000 - seed * 100;
  const problemSolvingScore = Math.min(100, Math.round(totalSolved / 5 + (mediumSolved / 3) + hardSolved * 2));

  const topics = [
    { topic: "Arrays", score: Math.min(100, 45 + (seed % 40)), solved: Math.round(totalSolved * 0.25) },
    { topic: "Strings", score: Math.min(100, 35 + (seed % 50)), solved: Math.round(totalSolved * 0.2) },
    { topic: "Trees", score: Math.min(100, 25 + (seed % 60)), solved: Math.round(totalSolved * 0.15) },
    { topic: "Graphs", score: Math.min(100, 15 + (seed % 70)), solved: Math.round(totalSolved * 0.1) },
    { topic: "Dynamic Programming", score: Math.min(100, 10 + (seed % 80)), solved: Math.round(totalSolved * 0.08) },
    { topic: "Binary Search", score: Math.min(100, 30 + (seed % 55)), solved: Math.round(totalSolved * 0.12) },
  ];

  const strengths = ["Arrays", "Strings", "Binary Search"];
  const weaknesses = ["Dynamic Programming", "Graphs"];
  const timeline = [
    { label: "Foundation", score: easySolved },
    { label: "Pattern Depth", score: mediumSolved * 2 },
    { label: "Hard Problems", score: hardSolved * 8 },
    { label: "Interview Ready", score: problemSolvingScore },
  ];

  state.hasLeetCodeProfile = true;
  state.leetcodeUsername = username;
  state.leetcodeTotalSolved = totalSolved;
  state.leetcodeEasySolved = easySolved;
  state.leetcodeMediumSolved = mediumSolved;
  state.leetcodeHardSolved = hardSolved;
  state.leetcodeContestRating = rating;
  state.leetcodeRanking = ranking;
  state.leetcodeProblemSolvingScore = problemSolvingScore;
  state.leetcodeTopicScores = topics;
  state.leetcodeStrengths = strengths;
  state.leetcodeWeaknesses = weaknesses;
  state.leetcodeTimeline = timeline;

  // Add LeetCode as source for linked technical skills
  const linkedSkills = ["Systems Design", "SQL"];
  for (const name of linkedSkills) {
    const skill = SKILLS.find(s => s.name === name);
    if (skill) {
      const existing = state.userSkills.find(us => us.skillId === skill.id);
      if (existing) {
        if (!existing.sources.includes("leetcode")) {
          existing.sources.push("leetcode");
        }
      } else {
        state.userSkills.push({ skillId: skill.id, sources: ["leetcode"] });
      }
    }
  }

  saveUserState(request.userId, state);

  return {
    userId: request.userId,
    username,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    contestRating: rating,
    ranking,
    problemSolvingScore,
    interviewReadiness: {
      serviceCompanies: Math.min(100, problemSolvingScore + 15),
      productCompanies: Math.min(100, Math.max(0, problemSolvingScore + 5)),
      faangLevel: Math.min(100, Math.max(0, problemSolvingScore - 15)),
    },
    topicBreakdown: topics,
    strengths,
    weaknesses,
    growthTimeline: timeline,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchLeetCodeProfile(userId: number): Promise<LeetCodeIntelligenceResponse | null> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/leetcode/profile?userId=${userId}`;
    const response = await fetch(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const state = getUserState(userId);
  if (!state.hasLeetCodeProfile || !state.leetcodeUsername) {
    return null;
  }

  return {
    userId: state.userId,
    username: state.leetcodeUsername,
    totalSolved: state.leetcodeTotalSolved,
    easySolved: state.leetcodeEasySolved,
    mediumSolved: state.leetcodeMediumSolved,
    hardSolved: state.leetcodeHardSolved,
    contestRating: state.leetcodeContestRating,
    ranking: state.leetcodeRanking,
    problemSolvingScore: state.leetcodeProblemSolvingScore,
    interviewReadiness: {
      serviceCompanies: Math.min(100, state.leetcodeProblemSolvingScore + 15),
      productCompanies: Math.min(100, Math.max(0, state.leetcodeProblemSolvingScore + 5)),
      faangLevel: Math.min(100, Math.max(0, state.leetcodeProblemSolvingScore - 15)),
    },
    topicBreakdown: state.leetcodeTopicScores,
    strengths: state.leetcodeStrengths,
    weaknesses: state.leetcodeWeaknesses,
    growthTimeline: state.leetcodeTimeline,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchLeetCodeIntelligence(userId: number): Promise<LeetCodeIntelligenceResponse | null> {
  return fetchLeetCodeProfile(userId);
}

export async function fetchRagResumeAnalysis(userId: number): Promise<RagResumeAnalysis> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/rag/resume-analysis?userId=${userId}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Simulated client fallback
  await new Promise(r => setTimeout(r, 1200)); // Simulate slow LLM
  return {
    inferredSkills: [
      { name: "Microservices", confidence: 0.88, evidence: "Implied by design of distributed transaction flows and backend refactoring" },
      { name: "Docker", confidence: 0.85, evidence: "Mentioned deployment containerization and multi-stage builds" }
    ],
    hiddenSkills: [
      { name: "REST API Design", confidence: 0.78, evidence: "Created and optimized multiple Spring Boot endpoint mappings" }
    ],
    strengths: [
      { area: "Backend Systems Integration", score: 90, evidence: "Architected Spring Boot services connecting with multiple databases" },
      { area: "Problem Solving", score: 85, evidence: "Refactored high-load SQL queries reducing execution time by 40%" }
    ],
    weaknesses: [
      { area: "Frontend Responsive Design", score: 40, evidence: "Experience is heavily backend focused, lacks React hooks depth" }
    ],
    careerSuitability: [
      { role: "Backend Engineer", score: 92, reasoning: "Deep Java and Spring Boot backend knowledge aligns perfectly with core expectations" },
      { role: "Software Engineer", score: 88, reasoning: "Solid general programming, database, and system integration skills" },
      { role: "Cloud Architect", score: 68, reasoning: "Possesses baseline infrastructure ideas but needs cloud provider certifications" }
    ],
    summary: "The candidate shows an excellent backend-heavy software engineering profile. They have proven capabilities with Java/Spring Boot ecosystems, API design, and system refactoring. Main development opportunities include frontend client integration and structured cloud system architectures."
  };
}

export async function fetchRagGitHubAnalysis(userId: number): Promise<RagGitHubAnalysis> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/rag/github-analysis?userId=${userId}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  await new Promise(r => setTimeout(r, 1200));
  return {
    verifiedSkills: [
      { name: "Java", confidence: 0.95, evidence: "Found in 5 active repositories with extensive backend commits" },
      { name: "TypeScript", confidence: 0.75, evidence: "Main codebase and config files written in TypeScript" }
    ],
    projectComplexity: {
      score: 78,
      level: "Intermediate-Advanced",
      reasoning: "Multiple multi-component projects containing integration testing, config profiles, and service separation."
    },
    engineeringMaturity: {
      score: 72,
      level: "Mature",
      indicators: [
        "Consistent usage of .gitignore and formatting configs",
        "Clean commits showing evolutionary progress",
        "Usage of standard design patterns"
      ]
    },
    missingPortfolioSkills: [
      { name: "Automated Testing", importance: "High", suggestion: "Add JUnit/Mockito tests in backend or Jest tests in frontend" }
    ],
    summary: "GitHub repositories demonstrate a clean programming style with solid backend structures. Commit hygiene is good. Adding unit testing suites and complete README instructions would elevate portfolio maturity."
  };
}

export async function fetchRagLeetCodeAnalysis(userId: number): Promise<RagLeetCodeAnalysis> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/rag/leetcode-analysis?userId=${userId}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  await new Promise(r => setTimeout(r, 1200));
  return {
    problemSolvingScore: 75,
    algorithmStrengths: [
      { topic: "Arrays", score: 88, assessment: "Fast implementation of windowing and pointer algorithms" },
      { topic: "Binary Search", score: 82, assessment: "Correct handling of boundary conditions in search tasks" }
    ],
    algorithmWeaknesses: [
      { topic: "Dynamic Programming", score: 45, recommendation: "Practice classical 1D and 2D DP patterns like Knapsack or LCS" }
    ],
    interviewReadiness: {
      serviceCompanies: 90,
      productCompanies: 75,
      faangLevel: 55,
      reasoning: "Strong fundamental programming logic allows clearing baseline technical interviews. Dynamic programming and advanced graph traversals need sharpening for top-tier product/FAANG rounds."
    },
    improvementPlan: [
      "Solve 20 medium-level Dynamic Programming problems",
      "Study DFS/BFS graph patterns and topological sort",
      "Participate in weekly LeetCode contests to build speed under pressure"
    ],
    summary: "Solid problem-solving baseline. The candidate is ready for service-oriented technical interviews and competitive for entry-to-mid level product companies. Focus should now turn to advanced topics and speed."
  };
}

export async function fetchRagCareerRecommendation(userId: number): Promise<RagCareerRecommendation> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/rag/career-recommendation?userId=${userId}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  await new Promise(r => setTimeout(r, 1500));
  return {
    recommendations: [
      {
        role: "Backend Engineer",
        score: 92,
        reasoning: "Strong evidence of Java, RESTful services, and database configuration across resume and GitHub.",
        evidence: {
          resume: "5 years development experience with Spring Boot",
          github: "Active Java repositories with database structures",
          leetcode: "Moderate-high problem-solving score demonstrating algorithmic logic"
        },
        gaps: ["Cloud deployment", "CI/CD pipelines"],
        nextSteps: ["Deploy a project to AWS or GCP", "Write a GitHub Actions CI/CD workflow"]
      },
      {
        role: "Fullstack Engineer",
        score: 80,
        reasoning: "Solid backend profile supplemented by TypeScript configurations in frontend UI repositories.",
        evidence: {
          resume: "Familiarity with frontend frameworks listed",
          github: "Some UI components visible",
          leetcode: "N/A"
        },
        gaps: ["React hooks mastery", "State management expertise"],
        nextSteps: ["Build a React project using TanStack Query and Context API"]
      }
    ],
    summary: "The candidate's profile is highly suited for backend engineering roles, showing high-confidence Java skills and database integration. Fullstack roles are secondary but highly viable with target learning."
  };
}

export async function fetchRagSkillValidation(userId: number, skillName: string): Promise<RagSkillValidation> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/rag/skill-validation?userId=${userId}&skillName=${encodeURIComponent(skillName)}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  await new Promise(r => setTimeout(r, 1000));
  return {
    skill: skillName,
    confidence: 95,
    evidenceSummary: [
      { source: "Resume", strength: 90, detail: `Lists 5+ years of active development. Details Spring Boot API microservices built from scratch.` },
      { source: "GitHub", strength: 95, detail: `Multiple active repositories containing spring-boot frameworks and advanced database connections.` },
      { source: "LeetCode", strength: 80, detail: `Submissions completed in ${skillName}, reflecting solid language core semantics.` }
    ],
    industryContext: `${skillName} remains a primary language in enterprise environments. It is highly valued for scale, security, and microservices architecture.`,
    relatedSkills: ["Spring Boot", "Hibernate", "Maven", "JUnit", "SQL"],
    growthSuggestions: [
      "Explore modern features like Virtual Threads",
      "Implement a reactive web flow using Spring WebFlux"
    ]
  };
}

export async function fetchRagRoadmap(userId: number, targetRole: string): Promise<RagRoadmap> {
  if (!USE_MOCK_BACKEND) {
    const url = `${API_BASE_URL}/api/rag/roadmap?userId=${userId}&targetRole=${encodeURIComponent(targetRole)}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  await new Promise(r => setTimeout(r, 1500));
  return {
    targetRole,
    estimatedTimeline: "6-9 months",
    phases: [
      {
        phase: 1,
        title: "Cloud Computing Fundamentals",
        duration: "2 months",
        skillsToLearn: ["AWS Core Services (EC2, S3, RDS)", "Cloud IAM", "VPC & Networking"],
        actions: [
          "Study and pass the AWS Certified Cloud Practitioner exam",
          "Deploy a basic web application on AWS EC2 behind an ALB with a RDS database"
        ],
        resources: ["AWS Skill Builder", "Stephane Maarek's AWS Course on Udemy"],
        milestones: ["AWS Certified Cloud Practitioner certification obtained", "Deployed 3-tier architecture sandbox project"]
      },
      {
        phase: 2,
        title: "Infrastructure as Code & DevOps",
        duration: "2-3 months",
        skillsToLearn: ["Terraform", "Docker", "GitHub Actions CI/CD"],
        actions: [
          "Convert your manual AWS infrastructure into Terraform code",
          "Build containerized Docker images and automate deployments via GitHub Actions"
        ],
        resources: ["HashiCorp Learn portal", "Nana Janashia's DevOps bootcamp"],
        milestones: ["All dev infrastructure managed via git-tracked IaC templates"]
      },
      {
        phase: 3,
        title: "Advanced Design Patterns & Security",
        duration: "2-3 months",
        skillsToLearn: ["AWS Solutions Architect Assoc topics", "Serverless (Lambda, DynamoDB)", "Microservices at Scale"],
        actions: [
          "Migrate web app components to Serverless architectures",
          "Study and pass the AWS Certified Solutions Architect - Associate exam"
        ],
        resources: ["Adrian Cantrill's AWS Solutions Architect course"],
        milestones: ["AWS Solutions Architect Associate certification obtained"]
      }
    ],
    summary: "A structured transition roadmap leveraging existing backend expertise to master AWS services, DevOps principles, and scalable system design."
  };
}
