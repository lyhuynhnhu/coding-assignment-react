export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

const API_URL = "/api";

export async function apiClient<T>(
  endpoint: string,
  method: Method = "GET",
  body?: any,
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}/${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  return response.json();
}
