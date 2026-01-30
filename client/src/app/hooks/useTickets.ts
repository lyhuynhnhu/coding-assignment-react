import { Ticket } from "@acme/shared-models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketApi } from "../api/ticket";

export const useGetTickets = () => {
  return useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: () => ticketApi.getAll(),
  });
};

export const useGetTicket = (ticketId: number) => {
  const qc = useQueryClient();
  return useQuery<Ticket>({
    queryKey: ["ticket", ticketId],
    queryFn: () => ticketApi.getById(ticketId),
    initialData: () => {
      const tickets = qc.getQueryData<Ticket[]>(["tickets"]);
      return tickets?.find((ticket) => ticket.id === ticketId);
    },
    enabled: !!ticketId,
  });
};

export const useCreateTicket = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { description: string }) => ticketApi.create(payload),
    onMutate: async ({ description }) => {
      await qc.cancelQueries({ queryKey: ["tickets"] });
      const prevTickets = qc.getQueryData<Ticket[]>(["tickets"]) || [];

      const maxId =
        prevTickets.length > 0 ? Math.max(...prevTickets.map((t) => t.id)) : 0;
      const tempId = maxId + 1;

      const temp: Ticket = {
        id: tempId,
        description,
        assigneeId: null,
        completed: false,
      };

      qc.setQueryData(["tickets"], [...prevTickets, temp]);
      return { prevTickets };
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(["tickets"], context?.prevTickets);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useAssignUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      userId,
    }: {
      ticketId: number;
      userId?: number;
    }) =>
      typeof userId === "number"
        ? ticketApi.assign(ticketId, userId)
        : ticketApi.unassign(ticketId),
    onMutate: async ({ ticketId, userId }) => {
      await qc.cancelQueries({ queryKey: ["tickets"] });
      await qc.cancelQueries({ queryKey: ["ticket", ticketId] });

      const prevList = qc.getQueryData<Ticket[]>(["tickets"]) || [];
      const prevTicket = qc.getQueryData<Ticket>(["ticket", ticketId]);

      if (prevList) {
        qc.setQueryData(
          ["tickets"],
          prevList.map((t) =>
            t.id === ticketId ? { ...t, assigneeId: userId } : t,
          ),
        );
      }
      if (prevTicket) {
        qc.setQueryData(
          ["ticket", ticketId],
          userId
            ? { ...prevTicket, assigneeId: userId }
            : { ...prevTicket, assigneeId: null },
        );
      }
      return { prevTicket, prevList };
    },
    onError: (_err, vars, context) => {
      if (context?.prevList) qc.setQueryData(["tickets"], context.prevList);
      if (context?.prevTicket)
        qc.setQueryData(["ticket", vars.ticketId], context.prevTicket);
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket", vars.ticketId] });
    },
  });
};

export const useToggleComplete = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) =>
      completed ? ticketApi.complete(id) : ticketApi.incomplete(id),
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: ["tickets"] });
      await qc.cancelQueries({ queryKey: ["ticket", id] });

      const prevList = qc.getQueryData<Ticket[]>(["tickets"]);
      const prevTicket = qc.getQueryData<Ticket>(["ticket", id]);

      if (prevList) {
        qc.setQueryData<Ticket[]>(
          ["tickets"],
          prevList.map((t) => (t.id === id ? { ...t, completed } : t)),
        );
      }
      if (prevTicket) {
        qc.setQueryData<Ticket>(["ticket", id], {
          ...prevTicket,
          completed,
        });
      }

      return { prevList, prevTicket };
    },
    onError: (_err, vars, context) => {
      if (context?.prevList) qc.setQueryData(["tickets"], context.prevList);
      if (context?.prevTicket)
        qc.setQueryData(["ticket", vars.id], context.prevTicket);
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["ticket", vars.id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};
