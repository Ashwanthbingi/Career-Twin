import {
  DigitalTwinResponse,
  CareerMatchDto,
  SkillGapResponse,
  RoadmapResponse,
  ResumeUploadResponse,
} from "../types/digital-twin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Fetches digital twin details for a given user.
 */
export async function fetchDigitalTwin(userId: number): Promise<DigitalTwinResponse> {
  const url = `${API_BASE_URL}/api/digital-twin?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches matching career profiles for a user.
 */
export async function fetchCareerMatches(userId: number): Promise<CareerMatchDto[]> {
  const url = `${API_BASE_URL}/api/career-match?userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches skill gaps for a user relative to a target role.
 */
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

/**
 * Fetches the quarterly roadmap for a user relative to a target role.
 */
export async function fetchRoadmap(userId: number, targetRoleId: number): Promise<RoadmapResponse> {
  const url = `${API_BASE_URL}/api/roadmap?userId=${userId}&targetRoleId=${targetRoleId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Uploads a resume PDF to parse and update user skills.
 */
export async function uploadResume(userId: number, file: File): Promise<ResumeUploadResponse> {
  const url = `${API_BASE_URL}/api/resume/upload`;
  const formData = new FormData();
  formData.append("userId", String(userId));
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errMsg = await response.text();
    throw new Error(errMsg || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
