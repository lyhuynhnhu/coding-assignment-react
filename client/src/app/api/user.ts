import { User } from "@acme/shared-models";
import { apiClient } from "./api-client";

const endpoint = "users";

export const userApi = {
  getAll: () => apiClient<User[]>(endpoint),
  getById: (id: number) => apiClient<User>(`${endpoint}/${id}`),
};
