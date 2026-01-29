import React from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Divider,
  Stack,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  Person,
} from "@mui/icons-material";
import { useGetTicket, useToggleComplete } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";

export const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketId = Number(id);

  const { data: ticket, isLoading, isError } = useGetTicket(ticketId);
  const toggleCompletion = useToggleComplete();
  const { data: users } = useUsers();

  const assignee = users?.find((u) => u.id === ticket?.assigneeId);

  const isUpdating =
    toggleCompletion.isPending && toggleCompletion.variables?.id === ticketId;

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  if (isError || !ticket)
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">Ticket not found!</Alert>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Tickets
        </Link>
        <Typography color="text.primary">Ticket #{ticket.id}</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: "capitalize" }}
      >
        Back to List
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: { md: 2 } }}>
          <Paper sx={{ p: 4, borderRadius: 2, height: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              Ticket {ticket.id}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="overline" color="text.secondary">
              Description
            </Typography>
            <Typography
              variant="h5"
              sx={{ mt: 1, mb: 3, fontWeight: "medium", lineHeight: 1.6 }}
            >
              {ticket.description}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: { md: 1 }, minWidth: { md: "300px" } }}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={ticket.completed ? "Completed" : "Open"}
                  color={ticket.completed ? "success" : "warning"}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color={ticket.completed ? "inherit" : "success"}
                  startIcon={
                    isUpdating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : ticket.completed ? (
                      <RadioButtonUnchecked />
                    ) : (
                      <CheckCircle />
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompletion.mutate({
                      id: ticket.id,
                      completed: !ticket.completed,
                    });
                  }}
                  disabled={isUpdating}
                  sx={{ textTransform: "capitalize" }}
                >
                  {ticket.completed ? "Mark as Open" : "Mark as Complete"}
                </Button>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Assigned Representative
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: assignee ? "primary.main" : "grey.300",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Person />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {assignee ? assignee.name : "Unassigned"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};
