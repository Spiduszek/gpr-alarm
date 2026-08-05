import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PhoneIcon from "@mui/icons-material/Phone";

export default function DashboardPage() {
  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h4"
        color="white"
        sx={{
          fontWeight: 700,
          mb: 3,
        }}
      >
        GPR Alarm
      </Typography>

      <Card
        sx={{
          bgcolor: "#1e293b",
          color: "white",
          borderRadius: 4,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
            }}
          >
            Status systemu
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
            }}
          >
            <Chip color="success" label="API" />
            <Chip color="success" label="PostgreSQL" />
            <Chip color="success" label="Asterisk" />
            <Chip color="success" label="WebSocket" />
          </Stack>

          <Divider
            sx={{
              my: 3,
              bgcolor: "#334155",
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            Telefonów w bazie
          </Typography>

          <Typography
            variant="h2"
            color="#38bdf8"
            sx={{
              fontWeight: 700,
            }}
          >
            22
          </Typography>
        </CardContent>
      </Card>

      <Button
        fullWidth
        size="large"
        variant="contained"
        startIcon={<WarningAmberIcon />}
        sx={{
          mt: 5,
          height: 120,
          fontSize: 32,
          fontWeight: 700,
          bgcolor: "#dc2626",

          "&:hover": {
            bgcolor: "#b91c1c",
          },
        }}
      >
        ALARMUJ CAŁĄ GRUPĘ
      </Button>

      <Button
        fullWidth
        size="large"
        variant="outlined"
        startIcon={<PhoneIcon />}
        sx={{
          mt: 2,
          height: 70,
          fontSize: 22,
          borderWidth: 2,
        }}
      >
        Alarm testowy
      </Button>

      <Card
        sx={{
          mt: 4,
          bgcolor: "#1e293b",
          color: "white",
          borderRadius: 4,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
          >
            Ostatnie alarmowanie
          </Typography>

          <Typography>
            10.07.2026 22:41
          </Typography>

          <Typography color="gray">
            Potwierdziło udział: 18 / 22
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}