import {
  Box,
  Button,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Refresh,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssignUserModal, CreateTicketModal, TicketTable } from "../components";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";

export const TicketList = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { getAllTicket, completionMutation } = useTickets();
  const { users } = useUsers();

  const { data: tickets, isLoading, isError, refetch } = getAllTicket;

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    ticketId: number | null;
    currentId: number | null;
  }>({
    open: false,
    ticketId: null,
    currentId: null,
  });

  const getAssigneeName = (userId: number | null) => {
    if (!userId) return "Unassigned";
    return users.find((u) => u.id === userId)?.name || `User ${userId}`;
  };

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    if (filter === "all") return tickets;

    return tickets.filter((ticket) => {
      if (filter === "completed") return ticket.completed === true;
      if (filter === "open") return ticket.completed === false;
      return true;
    });
  }, [tickets, filter]);

  const handleOpenAssignModal = (
    ticketId: number,
    currentAssigneeId: number | null,
  ) => {
    setAssignDialog({
      open: true,
      ticketId,
      currentId: currentAssigneeId,
    });
  };

  const handleViewDetail = (id: number) => {
    navigate(`/${id}`);
  };

  const handleToggleStatus = (ticketId: number, currentStatus: boolean) => {
    setUpdatingId(ticketId);
    completionMutation.mutate(
      {
        ticketId: ticketId,
        completed: !currentStatus,
      },
      {
        onSettled: () => setUpdatingId(null),
      },
    );
  };

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => refetch()}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          Cannot load tickets.
        </Alert>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="end"
        alignItems="center"
        columnGap={2}
        mb={4}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filter}
            label="Status Filter"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Tickets</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <CreateTicketModal />
      </Stack>

      <TicketTable
        data={filteredTickets}
        isLoading={isLoading}
        updatingId={updatingId}
        getAssigneeName={getAssigneeName}
        onView={handleViewDetail}
        onAssign={handleOpenAssignModal}
        onToggleStatus={handleToggleStatus}
      />

      <AssignUserModal
        open={assignDialog.open}
        ticketId={assignDialog.ticketId}
        currentAssigneeId={assignDialog.currentId}
        onClose={() => setAssignDialog((prev) => ({ ...prev, open: false }))}
      />
    </Container>
  );
};
