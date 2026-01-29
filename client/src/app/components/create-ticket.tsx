import React, { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  CircularProgress,
} from "@mui/material";
import { AddCircleOutlineRounded } from "@mui/icons-material";
import { useCreateTicket } from "../hooks/useTickets";

export const CreateTicketModal = () => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const createTicket = useCreateTicket();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    createTicket.mutate({ description });
    handleClose();
  };

  const isCreating = createTicket.isPending;

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddCircleOutlineRounded />}
        onClick={handleOpen}
        sx={{ borderRadius: 2, textTransform: "none" }}
      >
        New Ticket
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Create New Ticket</DialogTitle>

        <DialogContent>
          <DialogContentText mb={2}>
            Please enter a brief description of the issue or task.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreating}
            placeholder="e.g., Fix login button styling"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={isCreating}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!description.trim() || isCreating}
            sx={{ textTransform: "none" }}
            startIcon={
              isCreating && <CircularProgress size={16} color="inherit" />
            }
          >
            {isCreating ? "Creating..." : "Create Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
