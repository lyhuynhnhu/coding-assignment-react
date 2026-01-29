import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket } from "@acme/shared-models";
import { ticketApi } from "../api/ticket";

export const useTickets = () => {
  const queryClient = useQueryClient();

  const getAllTicket = useQuery({
    queryKey: ["tickets"],
    queryFn: () => ticketApi.getAll(),
  });

  const getTicketById = (id: number) =>
    useQuery({
      queryKey: ["ticket", id],
      queryFn: () => ticketApi.getById(id),
      enabled: !!id,
    });

  const createMutation = useMutation({
    mutationFn: (payload: { description: string }) => ticketApi.create(payload),
    onMutate: async ({ description }) => {
      await queryClient.cancelQueries({ queryKey: ["tickets"] });

      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);

      const currentId =
        previousTickets && previousTickets.length > 0
          ? Math.max(...previousTickets.map((t) => t.id))
          : 0;

      const newOptimisticTicket: Ticket = {
        id: currentId + 1,
        description,
        assigneeId: null,
        completed: false,
      };

      queryClient.setQueryData(["tickets"], (old: any) => [
        ...(old || []),
        newOptimisticTicket,
      ]);

      return { previousTickets };
    },
    onError: (err, description, context) => {
      queryClient.setQueryData(["tickets"], context?.previousTickets);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, userId }: { ticketId: number; userId?: number }) =>
      typeof userId === "number"
        ? ticketApi.assign(ticketId, userId)
        : ticketApi.unassign(ticketId),
    onMutate: async ({ ticketId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ["tickets"] });
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });

      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);
      const previousDetail = queryClient.getQueryData<Ticket>([
        "ticket",
        ticketId,
      ]);

      if (previousTickets) {
        queryClient.setQueryData(["tickets"], (old: any) =>
          old?.map((t: any) =>
            t.id === ticketId ? { ...t, assigneeId: userId } : t,
          ),
        );
      }
      if (previousDetail) {
        queryClient.setQueryData(["ticket", ticketId], (old: any) =>
          old ? { ...old, assigneeId: userId } : old,
        );
      }

      return { previousTickets, previousDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ["ticket", variables.ticketId],
          context.previousDetail,
        );
      }
    },
    onSettled: (data, err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId],
      });
    },
  });

  const completionMutation = useMutation({
    mutationKey: ["toggleStatus"],
    mutationFn: ({
      ticketId,
      completed,
    }: {
      ticketId: number;
      completed: boolean;
    }) =>
      completed ? ticketApi.complete(ticketId) : ticketApi.incomplete(ticketId),
    onMutate: async ({ ticketId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["tickets"] });
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });

      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);
      const previousDetail = queryClient.getQueryData<Ticket>([
        "ticket",
        ticketId,
      ]);

      if (previousTickets) {
        queryClient.setQueryData(
          ["tickets"],
          previousTickets.map((t) =>
            t.id === ticketId ? { ...t, completed } : t,
          ),
        );
      }
      if (previousDetail) {
        queryClient.setQueryData(["ticket", ticketId], {
          ...previousDetail,
          completed,
        });
      }

      return { previousTickets, previousDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ["ticket", variables.ticketId],
          context.previousDetail,
        );
      }
    },
    onSettled: (data, err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId],
      });
    },
  });

  return {
    getAllTicket,

    getTicketById,

    createTicket: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    assignUser: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,

    toggleCompletion: completionMutation.mutateAsync,
    isChangingStatus: completionMutation.isPending,
    completionMutation,
  };
};
