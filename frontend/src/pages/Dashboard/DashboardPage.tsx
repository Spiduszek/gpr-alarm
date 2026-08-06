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

type CurrentUser = {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  active: boolean;
};

type User = {
  id: number;
  phone: string;
  active: boolean;
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
  const [currentUser, setCurrentUser] =
  useState<CurrentUser | null>(null);
  const [answering, setAnswering] = useState(false);
  const [testCalling, setTestCalling] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [lastAlarm, setLastAlarm] = useState<Alarm | null>(null);
  const [lastAlarmSummary, setLastAlarmSummary] =
  useState<AlarmSummary | null>(null);

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

useEffect(() => {
  const loadUsersCount = async () => {
    try {
      const response = await api.get<User[]>("/users");

      const usersWithPhone = response.data.filter(
        (user) => user.phone?.trim()
      );

      setUsersCount(usersWithPhone.length);
    } catch (error) {
      console.error(
        "Nie udało się pobrać liczby telefonów:",
        error
      );
    }
  };

  loadUsersCount();
}, []);

useEffect(() => {
  const loadLastAlarm = async () => {
    try {
      const alarmsResponse =
        await api.get<Alarm[]>("/alarms");

      const finishedAlarms = alarmsResponse.data
        .filter((alarm) => alarm.status === "FINISHED")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      const latestFinishedAlarm = finishedAlarms[0];

      if (!latestFinishedAlarm) {
        setLastAlarm(null);
        setLastAlarmSummary(null);
        return;
      }

      setLastAlarm(latestFinishedAlarm);

      const summaryResponse =
        await api.get<AlarmSummary>(
          `/alarms/${latestFinishedAlarm.id}/summary`
        );

      setLastAlarmSummary(summaryResponse.data);
    } catch (error) {
      console.error(
        "Nie udało się pobrać ostatniego alarmu:",
        error
      );
    }
  };

  loadLastAlarm();
}, []);

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

const handleMyAnswer = async (
  status: "GOING" | "NOT_GOING"
) => {
  if (!activeAlarm || !currentUser) {
    return;
  }

  try {
    setAnswering(true);

    const response = await api.patch<Participant>(
      `/alarms/${activeAlarm.id}/participants/${currentUser.id}/status`,
      {
        status,
      }
    );

    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.userId === currentUser.id
          ? response.data
          : participant
      )
    );

    setMessage({
      text:
        status === "GOING"
          ? "Potwierdziłeś udział w alarmie."
          : "Odrzuciłeś udział w alarmie.",
      severity: "success",
    });
  } catch (error) {
    console.error(
      "Nie udało się zapisać odpowiedzi:",
      error
    );

    setMessage({
      text: "Nie udało się zapisać odpowiedzi.",
      severity: "error",
    });
  } finally {
    setAnswering(false);
  }
};

const handleTestCall = async () => {
  try {
    setTestCalling(true);

    await api.post("/asterisk/test-call");

    setMessage({
      text: "Testowe połączenie zostało uruchomione. Telefon powinien za chwilę zadzwonić.",
      severity: "success",
    });
  } catch (error) {
    console.error(
      "Nie udało się uruchomić testowego połączenia:",
      error
    );

    setMessage({
      text: "Nie udało się uruchomić testowego połączenia.",
      severity: "error",
    });
  } finally {
    setTestCalling(false);
  }
};

const isAdmin = currentUser?.role === "ADMIN";

const myParticipant = participants.find(
  (participant) =>
    participant.userId === currentUser?.id
);

const myStatus = myParticipant?.status;

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
            
{!isAdmin && currentUser && (
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
          fontWeight: 800,
          textAlign: "center",
          mb: 1,
        }}
      >
        TWOJA ODPOWIEDŹ
      </Typography>

      <Typography
        sx={{
          color: "#94a3b8",
          textAlign: "center",
          mb: 3,
        }}
      >
        Czy jedziesz na alarm?
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          color="success"
          disabled={answering}
          onClick={() => handleMyAnswer("GOING")}
          sx={{
            height: 90,
            fontSize: 24,
            fontWeight: 800,
            borderRadius: 3,
          }}
        >
          JADĘ
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={answering}
          onClick={() =>
            handleMyAnswer("NOT_GOING")
          }
          sx={{
            height: 90,
            fontSize: 24,
            fontWeight: 800,
            borderRadius: 3,
          }}
        >
          NIE JADĘ
        </Button>
      </Box>

      <Box
        sx={{
          mt: 3,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            color: "#94a3b8",
            mb: 1,
          }}
        >
          Aktualna odpowiedź:
        </Typography>

        <Chip
          label={
            myStatus === "GOING"
              ? "JADĘ"
              : myStatus === "NOT_GOING"
              ? "NIE JADĘ"
              : myStatus === "NO_ANSWER"
              ? "BRAK ODPOWIEDZI"
              : "OCZEKUJE"
          }
          color={
            myStatus === "GOING"
              ? "success"
              : myStatus === "NOT_GOING"
              ? "error"
              : myStatus === "NO_ANSWER"
              ? "default"
              : "warning"
          }
          sx={{
            fontWeight: 800,
            fontSize: 16,
          }}
        />
      </Box>
    </CardContent>
  </Card>
)}
            
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
{isAdmin && (
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
)}

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
            {usersCount}
          </Typography>
        </CardContent>
      </Card>

      {isAdmin && (
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
)}

      {isAdmin && (
  <Button
    fullWidth
    size="large"
    variant="outlined"
    startIcon={<PhoneIcon />}
    onClick={handleTestCall}
    disabled={testCalling}
    sx={{
      mt: 2,
      height: 70,
      fontSize: 22,
      borderWidth: 2,
    }}
  >
    {testCalling
      ? "URUCHAMIANIE TESTU..."
      : "ALARM TESTOWY"}
  </Button>
)}

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

          {lastAlarm && lastAlarmSummary ? (
            <>
              <Typography>
                {new Date(lastAlarm.createdAt).toLocaleString(
                  "pl-PL"
                )}
              </Typography>

              <Typography color="gray">
                Potwierdziło udział: {" "}
                {lastAlarmSummary.going} / {" "}
                {lastAlarmSummary.total}
              </Typography>
            </>
          ) : (
            <Typography color="gray">
              Brak zakończonych alarmów.
            </Typography>
          )}
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