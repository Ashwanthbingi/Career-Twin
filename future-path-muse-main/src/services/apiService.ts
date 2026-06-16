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
} from "../types/digital-twin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface UploadResumeOptions {
  onProgress?: (progress: number) => void;
}

export async function fetchDigitalTwin(userId: number): Promise<DigitalTwinResponse> {
  const url = `${API_BASE_URL}/api/digital-twin?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function refreshDigitalTwin(userId: number): Promise<DigitalTwinResponse> {
  const url = `${API_BASE_URL}/api/digital-twin/refresh?userId=${userId}`;
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchSkillGraph(userId: number): Promise<SkillGraphDto[]> {
  const url = `${API_BASE_URL}/api/digital-twin/skill-graph?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchCurrentResume(userId: number): Promise<ResumeResponse | null> {
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

export async function fetchCareerMatches(userId: number): Promise<CareerMatchDto[]> {
  const url = `${API_BASE_URL}/api/career-match?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchSkillGap(
  userId: number,
  targetRoleId: number,
): Promise<SkillGapResponse> {
  const url = `${API_BASE_URL}/api/skill-gap?userId=${userId}&targetRoleId=${targetRoleId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchRoadmap(userId: number, targetRoleId: number): Promise<RoadmapResponse> {
  const url = `${API_BASE_URL}/api/roadmap?userId=${userId}&targetRoleId=${targetRoleId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function uploadResume(
  userId: number,
  file: File,
  options: UploadResumeOptions = {},
): Promise<ResumeUploadResponse> {
  const url = `${API_BASE_URL}/api/resume/replace`;
  const formData = new FormData();
  formData.append("userId", String(userId));
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

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

export async function fetchValidatedSkills(userId: number): Promise<ValidatedSkillResponse[]> {
  const url = `${API_BASE_URL}/api/skills/validated?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchSkillValidations(userId: number): Promise<ValidatedSkillResponse[]> {
  const url = `${API_BASE_URL}/api/skill-validations?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchSkillConfidenceSummary(
  userId: number,
): Promise<SkillConfidenceSummaryResponse> {
  const url = `${API_BASE_URL}/api/skills/confidence-summary?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function analyzeGitHubPortfolio(
  request: GitHubAnalysisRequest,
): Promise<GitHubAnalysisResponse> {
  const url = `${API_BASE_URL}/api/github/analyze`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchGitHubProfile(userId: number): Promise<GitHubProfileResponse | null> {
  const url = `${API_BASE_URL}/api/github/profile?userId=${userId}`;
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

export async function analyzeLeetCodeProfile(
  request: LeetCodeAnalysisRequest,
): Promise<LeetCodeIntelligenceResponse> {
  const url = `${API_BASE_URL}/api/leetcode/analyze`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchLeetCodeProfile(userId: number): Promise<LeetCodeIntelligenceResponse | null> {
  const url = `${API_BASE_URL}/api/leetcode/profile?userId=${userId}`;
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

export async function fetchLeetCodeIntelligence(
  userId: number,
): Promise<LeetCodeIntelligenceResponse | null> {
  const url = `${API_BASE_URL}/api/leetcode/intelligence?userId=${userId}`;
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
