import { Routes, Route } from "react-router-dom";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { AssignmentRounded } from "@mui/icons-material";

import { TicketDetail, TicketList } from "./pages";

const App = () => {
  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <AssignmentRounded />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ticketing App
          </Typography>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<TicketList />} />
        <Route path="/:id" element={<TicketDetail />} />
      </Routes>
    </>
  );
};

export default App;
