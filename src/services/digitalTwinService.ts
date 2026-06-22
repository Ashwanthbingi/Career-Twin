import { DigitalTwinResponse } from "../types/digital-twin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Fetches digital twin details for a given user.
 * @param userId - The ID of the user whose digital twin is to be retrieved.
 * @returns A Promise resolving to the DigitalTwinResponse data.
 */
export async function fetchDigitalTwin(userId: number): Promise<DigitalTwinResponse> {
  const url = `${API_BASE_URL}/api/digital-twin?userId=${userId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
