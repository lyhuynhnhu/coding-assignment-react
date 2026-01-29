import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { useUsers } from "../hooks/useUsers";
import { useTickets } from "../hooks/useTickets";

interface AssignUserDialogProps {
  open: boolean;
  onClose: () => void;
  ticketId: number | null;
  currentAssigneeId: number | null;
}

export const AssignUserModal = ({
  open,
  onClose,
  ticketId,
  currentAssigneeId,
}: AssignUserDialogProps) => {
  const { users, usersQuery } = useUsers();
  const { assignUser, isAssigning } = useTickets();
  
  const [selectedUserId, setSelectedUserId] = useState<number | string>("");

  useEffect(() => {
    if (open) {
      setSelectedUserId(currentAssigneeId || "");
    }
  }, [currentAssigneeId, open]);

  const handleConfirm = async () => {
    if (ticketId === null) return;

    const userId = selectedUserId === "" ? undefined : Number(selectedUserId);

    assignUser({ ticketId, userId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>Assign Representative</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Select a team member to handle ticket <b>#{ticketId}</b>.
        </Typography>

        {usersQuery.isLoading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <FormControl fullWidth>
            <InputLabel id="assign-user-label">Select User</InputLabel>
            <Select
              labelId="assign-user-label"
              label="Select User"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isAssigning}
            >
              <MenuItem value="">
                <em>None / Unassigned</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isAssigning}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isAssigning || usersQuery.isLoading}
          sx={{ minWidth: 100, textTransform: "none" }}
        >
          {isAssigning ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Confirm"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
