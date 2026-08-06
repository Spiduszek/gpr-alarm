import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PhoneIcon from "@mui/icons-material/Phone";

import api from "../../api/api";

export default function DashboardPage() {
  type Alarm = {
  id: number;
  status: "RUNNING" | "FINISHED";
  createdByUserId: number;
  createdAt: string;
  finishedAt: string | null;
};

type AlarmSummary = {
  alarmId: number;
  total: number;
  pending: number;
  going: number;
  notGoing: number;
  noAnswer: number;
};

type Participant = {
  id: number;
  alarmId: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: "PENDING" | "GOING" | "NOT_GOING" | "NO_ANSWER";
  answeredAt: string | null;
};
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [message, setMessage] = useState<{
    text: string;
    severity: "success" | "error";
  } | null>(null);

  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [checkingAlarm, setCheckingAlarm] = useState(true);
  const [summary, setSummary] = useState<AlarmSummary | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
  const loadActiveAlarm = async () => {
    try {
      const response = await api.get<Alarm[]>("/alarms");

      const runningAlarm = response.data.find(
        (alarm) => alarm.status === "RUNNING",
      );

      setActiveAlarm(runningAlarm ?? null);
    } catch (error) {
      console.error("Nie udało się pobrać alarmów:", error);
    } finally {
      setCheckingAlarm(false);
    }
  };

  loadActiveAlarm();
}, []);

useEffect(() => {
  if (!activeAlarm) {
    return;
  }

  const loadAlarmDetails = async () => {
  try {
    const [
      alarmsResponse,
      summaryResponse,
      participantsResponse,
    ] = await Promise.all([
      api.get<Alarm[]>("/alarms"),
      api.get<AlarmSummary>(
        `/alarms/${activeAlarm.id}/summary`,
      ),
      api.get<Participant[]>(
        `/alarms/${activeAlarm.id}/participants`,
      ),
    ]);

    const currentAlarm = alarmsResponse.data.find(
      (alarm) => alarm.id === activeAlarm.id,
    );

    // Alarm został zakończony
    if (!currentAlarm || currentAlarm.status === "FINISHED") {
      setActiveAlarm(null);
      setSummary(null);
      setParticipants([]);
      return;
    }

    setSummary(summaryResponse.data);
    setParticipants(participantsResponse.data);
  } catch (error) {
    console.error(
      "Nie udało się pobrać szczegółów alarmu:",
      error,
    );
  }
};

  loadAlarmDetails();

  const interval = window.setInterval(
    loadAlarmDetails,
    2000,
  );

  return () => {
    window.clearInterval(interval);
  };
}, [activeAlarm]);
  const handleAlarm = async () => {
    try {
      setLoading(true);

      const response = await api.post("/alarms");
      setActiveAlarm(response.data);

      setConfirmOpen(false);

      setMessage({
        text: `Alarm #${response.data.id} został uruchomiony. Do alarmowania: ${response.data.participantsCount} osób.`,
        severity: "success",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        text: "Nie udało się uruchomić alarmu.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFinishAlarm = async () => {
  if (!activeAlarm) {
    return;
  }

  try {
    setFinishing(true);

    await api.patch(`/alarms/${activeAlarm.id}/finish`);

    setFinishConfirmOpen(false);
    setActiveAlarm(null);
    setSummary(null);
    setParticipants([]);

    setMessage({
      text: `Alarm #${activeAlarm.id} został zakończony.`,
      severity: "success",
    });
  } catch (error) {
    console.error("Nie udało się zakończyć alarmu:", error);

    setMessage({
      text: "Nie udało się zakończyć alarmu.",
      severity: "error",
    });
  } finally {
    setFinishing(false);
  }
};

if (checkingAlarm) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
      }}
    >
      <Typography color="white">
        Sprawdzanie aktywnego alarmu...
      </Typography>
    </Box>
  );
}

if (activeAlarm) {
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
          bgcolor: "#7f1d1d",
          color: "white",
          borderRadius: 4,
          border: "2px solid #ef4444",
        }}
      >
        <CardContent
          sx={{
            textAlign: "center",
            py: 4,
          }}
        >
          <WarningAmberIcon
            sx={{
              fontSize: 70,
              mb: 1,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            ALARM #{activeAlarm.id}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mt: 1,
              fontWeight: 700,
            }}
          >
            ALARM W TOKU
          </Typography>

          <Typography
            sx={{
              mt: 2,
              opacity: 0.8,
            }}
          >
            Uruchomiono:{" "}
            {new Date(activeAlarm.createdAt).toLocaleString("pl-PL")}
          </Typography>
        </CardContent>
      </Card>

      {/* PODSUMOWANIE */}

{/* PODSUMOWANIE */}

<Card
  sx={{
    mt: 3,
    bgcolor: "#1e293b",
    color: "white",
    borderRadius: 4,
  }}
>
  <CardContent>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        mb: 3,
      }}
    >
      Odpowiedzi ratowników
    </Typography>

    {summary ? (
      <>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {/* JEDZIE */}

          <Box
            sx={{
              bgcolor: "#14532d",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {summary.going}
            </Typography>

            <Typography
              sx={{ fontWeight: 700 }}
            >
              JEDZIE
            </Typography>
          </Box>

          {/* NIE JEDZIE */}

          <Box
            sx={{
              bgcolor: "#7f1d1d",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {summary.notGoing}
            </Typography>

            <Typography
              sx={{ fontWeight: 700 }}
            >
              NIE JEDZIE
            </Typography>
          </Box>

          {/* OCZEKUJE */}

          <Box
            sx={{
              bgcolor: "#854d0e",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {summary.pending}
            </Typography>

            <Typography
              sx={{ fontWeight: 700 }}
            >
              OCZEKUJE
            </Typography>
          </Box>

          {/* BRAK ODPOWIEDZI */}

          <Box
            sx={{
              bgcolor: "#374151",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {summary.noAnswer}
            </Typography>

            <Typography
              sx={{ fontWeight: 700 }}
            >
              BRAK ODPOWIEDZI
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            mt: 2,
            color: "#94a3b8",
            textAlign: "right",
          }}
        >
          Łącznie uczestników: {summary.total}
        </Typography>
      </>
    ) : (
      <Typography color="gray">
        Pobieranie podsumowania...
      </Typography>
    )}
  </CardContent>
</Card>

{/* LISTA RATOWNIKÓW */}
<Button
  fullWidth
  size="large"
  variant="contained"
  color="error"
  startIcon={<WarningAmberIcon />}
  onClick={() => setFinishConfirmOpen(true)}
  sx={{
    mt: 3,
    mb: 3,
    height: 80,
    fontSize: 22,
    fontWeight: 800,
    borderRadius: 3,
  }}
>
  ZAKOŃCZ ALARM
</Button>

<Dialog
  open={finishConfirmOpen}
  onClose={() => {
    if (!finishing) {
      setFinishConfirmOpen(false);
    }
  }}
>
  <DialogTitle
    sx={{
      fontWeight: 700,
      color: "#dc2626",
    }}
  >
    Zakończyć alarm?
  </DialogTitle>

  <DialogContent>
    <DialogContentText>
      Czy na pewno chcesz zakończyć alarm #{activeAlarm.id}?
      Po zakończeniu nie będzie można zmieniać odpowiedzi uczestników.
    </DialogContentText>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setFinishConfirmOpen(false)}
      disabled={finishing}
    >
      Anuluj
    </Button>

    <Button
      variant="contained"
      color="error"
      onClick={handleFinishAlarm}
      disabled={finishing}
    >
      {finishing ? "Kończenie..." : "ZAKOŃCZ ALARM"}
    </Button>
  </DialogActions>
</Dialog>

{/* LISTA RATOWNIKÓW */}

<Card
  sx={{
    mt: 3,
    bgcolor: "#1e293b",
    color: "white",
    borderRadius: 4,
  }}
>
  <CardContent>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        mb: 2,
      }}
    >
      Ratownicy
    </Typography>

    <Stack spacing={1.5}>
      {participants.map((participant) => {
        let label = "OCZEKUJE";
        let color:
          | "success"
          | "error"
          | "warning"
          | "default" = "warning";

        if (participant.status === "GOING") {
          label = "JEDZIE";
          color = "success";
        }

        if (participant.status === "NOT_GOING") {
          label = "NIE JEDZIE";
          color = "error";
        }

        if (participant.status === "NO_ANSWER") {
          label = "BRAK ODPOWIEDZI";
          color = "default";
        }

        return (
          <Box
            key={participant.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              bgcolor: "#0f172a",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {participant.firstName}{" "}
                {participant.lastName}
              </Typography>

              <Typography
                variant="body2"
                color="#94a3b8"
              >
                {participant.phone ?? "Brak telefonu"}
              </Typography>
                        </Box>

            <Chip
              label={label}
              color={color}
              sx={{
                fontWeight: 700,
              }}
            />
          </Box>
        );
      })}
    </Stack>

    {participants.length === 0 && (
      <Typography color="gray">
        Brak uczestników alarmu.
      </Typography>
    )}
  </CardContent>
</Card>
    </Box>
  );
}
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
          <Typography variant="h6" sx={{ mb: 2 }}>
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
        onClick={() => setConfirmOpen(true)}
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
          <Typography variant="h6" gutterBottom>
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

      {/* POTWIERDZENIE ALARMU */}

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!loading) {
            setConfirmOpen(false);
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#dc2626",
          }}
        >
          Uruchomić alarm?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz zaalarmować całą grupę?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={loading}
          >
            Anuluj
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleAlarm}
            disabled={loading}
          >
            {loading ? "Uruchamianie..." : "ALARMUJ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KOMUNIKAT */}

      <Snackbar
        open={message !== null}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert
          severity={message?.severity ?? "success"}
          onClose={() => setMessage(null)}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
} 