import { apiRequest } from "./queryClient";

export interface AuthStatus {
  authenticated: boolean;
}

export async function login(password: string): Promise<void> {
  await apiRequest("POST", "/api/auth/login", { password });
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function checkAuthStatus(): Promise<AuthStatus> {
  const response = await apiRequest("GET", "/api/auth/status");
  return response.json();
}
