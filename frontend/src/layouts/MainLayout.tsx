import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CallIcon from "@mui/icons-material/Call";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../api/api";
import { useAuth } from "../hooks/useAuth";

type CurrentUser = {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  active: boolean;
};
const drawerWidth = 260;

export default function MainLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] =
  useState<CurrentUser | null>(null);

useEffect(() => {
  const loadCurrentUser = async () => {
    try {
      const response = await api.get<CurrentUser>(
        "/auth/me"
      );

      setCurrentUser(response.data);
    } catch (error) {
      console.error(
        "Nie udało się pobrać zalogowanego użytkownika:",
        error
      );
    }
  };

  loadCurrentUser();
}, []);

 

  return (
    <Box sx={{ display: "flex", bgcolor: "#0f172a" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#1e293b",
          boxShadow: 0,
          borderBottom: "1px solid #334155",
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#fff",
              flexGrow: 1,
            }}
          >
            🚒 GPR Alarm
          </Typography>

          <Chip
  label={
    currentUser?.role === "ADMIN"
      ? "Administrator"
      : "Ratownik"
  }
  color={
    currentUser?.role === "ADMIN"
      ? "error"
      : "primary"
  }
  sx={{ mr: 2 }}
/>

          <Avatar sx={{ bgcolor: "#dc2626", mr: 2 }}>
  {currentUser?.login
    ? currentUser.login.charAt(0).toUpperCase()
    : "?"}
</Avatar>

          <Typography sx={{ color: "white", mr: 2 }}>
  {currentUser?.login ?? "..."}
</Typography>

          <IconButton
  color="inherit"
  onClick={() => {
    logout();
    navigate("/", { replace: true });
  }}
>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: "#111827",
            color: "white",
            borderRight: "1px solid #334155",
          },
        }}
      >
        <Toolbar />

        <List sx={{ mt: 2 }}>
          <ListItemButton
  onClick={() => navigate("/dashboard")}
>
  <ListItemIcon>
    <DashboardIcon sx={{ color: "white" }} />
  </ListItemIcon>

  <ListItemText primary="Dashboard" />
</ListItemButton>

          <ListItemButton>
            <ListItemIcon>
              <NotificationsActiveIcon sx={{ color: "#ef4444" }} />
            </ListItemIcon>
            <ListItemText primary="Alarmy" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon>
              <LocalFireDepartmentIcon sx={{ color: "#f97316" }} />
            </ListItemIcon>
            <ListItemText primary="Jednostki" />
          </ListItemButton>

          <ListItemButton
              onClick={() => navigate("/firefighters")}
>
          <ListItemIcon>
          <GroupsIcon sx={{ color: "#60a5fa" }} />
          </ListItemIcon>
          <ListItemText primary="Strażacy" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon>
              <CallIcon sx={{ color: "#22c55e" }} />
            </ListItemIcon>
            <ListItemText primary="Telefony" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon>
              <HistoryIcon sx={{ color: "#a78bfa" }} />
            </ListItemIcon>
            <ListItemText primary="Historia" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon>
              <AssessmentIcon sx={{ color: "#facc15" }} />
            </ListItemIcon>
            <ListItemText primary="Raporty" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon sx={{ color: "#94a3b8" }} />
            </ListItemIcon>
            <ListItemText primary="Ustawienia" />
          </ListItemButton>
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ bgcolor: "#334155" }} />

        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
            Status usług
          </Typography>

          <Chip
            label="API ONLINE"
            color="success"
            sx={{ mb: 1, width: "100%" }}
          />

          <Chip
            label="PostgreSQL ONLINE"
            color="success"
            sx={{ mb: 1, width: "100%" }}
          />

          <Chip
            label="Asterisk OFFLINE"
            color="warning"
            sx={{ mb: 1, width: "100%" }}
          />

          <Chip
            label="WebSocket ONLINE"
            color="success"
            sx={{ width: "100%" }}
          />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#0f172a",
          minHeight: "100vh",
          p: 4,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}