import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import {
  Visibility,
  Refresh,
  PersonAddRounded,
  DoneAllRounded,
  RemoveDoneRounded,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssignUserModal, CreateTicketModal } from "../components/modal";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";
import { Ticket } from "@acme/shared-models";

export const TicketList = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { getAllTicket, toggleCompletion, completionMutation } = useTickets();
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

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table stickyHeader>
          <TableHead
            sx={{
              "& .MuiTableCell-head": {
                bgcolor: "#f4f4f5",
                letterSpacing: 0.2,
                color: "text.primary",
                fontWeight: 600,
              },
            }}
          >
            <TableRow sx={{ fontWeight: 500 }}>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets?.map((ticket) => {
              const isUpdating =
                completionMutation.isPending && updatingId === ticket.id;

              return (
                <TableRow key={ticket.id} hover>
                  <TableCell>#{ticket.id}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ticket.description}
                  </TableCell>
                  <TableCell>
                    {ticket.assigneeId && getAssigneeName(ticket.assigneeId)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.completed ? "Completed" : "Open"}
                      color={ticket.completed ? "success" : "warning"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          disabled={isUpdating}
                          onClick={() => navigate(`/${ticket.id}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign User">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={isUpdating}
                          onClick={() =>
                            setAssignDialog({
                              open: true,
                              ticketId: ticket.id,
                              currentId: ticket.assigneeId,
                            })
                          }
                        >
                          <PersonAddRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          ticket.completed
                            ? "Mark as Open"
                            : "Mark as Completed"
                        }
                      >
                        <IconButton
                          size="small"
                          color={ticket.completed ? "error" : "success"}
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpdatingId(ticket.id);
                            completionMutation.mutate(
                              {
                                ticketId: ticket.id,
                                completed: !ticket.completed,
                              },
                              {
                                onSettled: () => setUpdatingId(null),
                              },
                            );
                          }}
                        >
                          {isUpdating ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : ticket.completed ? (
                            <RemoveDoneRounded fontSize="small" />
                          ) : (
                            <DoneAllRounded fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredTickets.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No tickets found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AssignUserModal
        open={assignDialog.open}
        ticketId={assignDialog.ticketId}
        currentAssigneeId={assignDialog.currentId}
        onClose={() => setAssignDialog((prev) => ({ ...prev, open: false }))}
      />
    </Container>
  );
};
