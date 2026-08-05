import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#d32f2f",
    },
    secondary: {
      main: "#1976d2",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;