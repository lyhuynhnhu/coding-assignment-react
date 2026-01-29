import { Ticket } from "@acme/shared-models";
import { apiClient } from "./api-client";

const endpoint = "tickets";

export const ticketApi = {
  getAll: () => apiClient<Ticket[]>(endpoint),

  getById: (id: number) => apiClient<Ticket>(`${endpoint}/${id}`),

  create: (payload: { description: string }) => {
    return apiClient<Ticket>(endpoint, "POST", payload);
  },

  assign: (ticketId: number, userId: number) => {
    return apiClient(`${endpoint}/${ticketId}/assign/${userId}`, "PUT");
  },

  unassign: (ticketId: number) => {
    return apiClient(`${endpoint}/${ticketId}/unassign`, "PUT");
  },

  complete: (ticketId: number) => {
    return apiClient(`${endpoint}/${ticketId}/complete`, "PUT");
  },

  incomplete: (ticketId: number) => {
    return apiClient(`${endpoint}/${ticketId}/complete`, "DELETE");
  },
};
