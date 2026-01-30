import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Visibility,
  PersonAddRounded,
  DoneAllRounded,
  RemoveDoneRounded,
} from "@mui/icons-material";
import { Ticket } from "@acme/shared-models";

interface TicketTableProps {
  data: Ticket[];
  isLoading?: boolean;
  updatingId: number | null;
  mutationState: {
    isPending: boolean;
  };
  onView: (id: number) => void;
  onAssign: (ticketId: number, currentAssigneeId: number | null) => void;
  onToggleStatus: (ticketId: number, currentStatus: boolean) => void;
  getAssigneeName: (userId: number | null) => string;
}

export const TicketTable = ({
  data,
  isLoading = false,
  updatingId,
  mutationState,
  onView,
  onAssign,
  onToggleStatus,
  getAssigneeName,
}: TicketTableProps) => {
  return (
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
          <TableRow>
            <TableCell sx={{ width: "5%" }}>#</TableCell>
            <TableCell sx={{ width: "50%" }}>Description</TableCell>
            <TableCell sx={{ width: "15%" }}>Assignee</TableCell>
            <TableCell sx={{ width: "15%" }}>Status</TableCell>
            <TableCell align="right" sx={{ width: "15%", textAlign: "center" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((ticket) => {
            const isRowUpdating =
              mutationState.isPending && updatingId === ticket.id;

            return (
              <TableRow key={ticket.id} hover>
                <TableCell>{ticket.id}</TableCell>
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
                  {isRowUpdating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Chip
                      label={ticket.completed ? "Completed" : "Open"}
                      color={ticket.completed ? "success" : "warning"}
                      variant="outlined"
                      size="small"
                    />
                  )}
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
                        disabled={isRowUpdating}
                        onClick={() => onView(ticket.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Assign User">
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={isRowUpdating}
                        onClick={() => onAssign(ticket.id, ticket.assigneeId)}
                      >
                        <PersonAddRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={
                        ticket.completed ? "Mark as Open" : "Mark as Completed"
                      }
                    >
                      <IconButton
                        size="small"
                        color={ticket.completed ? "error" : "success"}
                        disabled={isRowUpdating}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(ticket.id, ticket.completed);
                        }}
                      >
                        {isRowUpdating ? (
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

          {data.length === 0 && !isLoading && (
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
  );
};
