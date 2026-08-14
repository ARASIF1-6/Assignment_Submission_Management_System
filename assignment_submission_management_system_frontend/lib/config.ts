export const DEFAULT_API_BASE_URL = "https://localhost:7051";

export const STORAGE_KEYS = {
  TOKEN: "asms_auth_token",
  USER: "asms_auth_user",
  API_URL: "asms_api_base_url",
  USE_MOCK: "asms_use_mock",
};

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem(STORAGE_KEYS.API_URL);
    if (customUrl) return customUrl;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.API_URL, url);
  }
};
