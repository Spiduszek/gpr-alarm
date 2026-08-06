import { useEffect, useState } from "react";

import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";

import api from "../../api/api";

type User = {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "RATOWNIK" | "ADMIN";
  active: boolean;
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

type CreateUserForm = {
  firstName: string;
  lastName: string;
  phone: string;
  login: string;
  password: string;
  role: "RATOWNIK" | "ADMIN";
};

export default function FirefightersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

const [editForm, setEditForm] = useState<CreateUserForm>({
  firstName: "",
  lastName: "",
  phone: "",
  login: "",
  password: "",
  role: "RATOWNIK",
});

const [form, setForm] = useState<CreateUserForm>({
  firstName: "",
  lastName: "",
  phone: "",
  login: "",
  password: "",
  role: "RATOWNIK",
});

  useEffect(() => {
  const loadUsers = async () => {
    try {
      const response = await api.get<User[]>("/users");
      setUsers(response.data);
    } catch (error) {
      console.error(
        "Nie udało się pobrać strażaków:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  loadUsers();
}, []);

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
  const handleOpenEdit = (user: User) => {
  setEditingUser(user);

  setEditForm({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    login: user.login,
    password: "",
    role: user.role,
  });

  setEditError("");
  setEditOpen(true);
};

const handleUpdateUser = async () => {
  if (!editingUser) {
    return;
  }

  if (
    !editForm.firstName.trim() ||
    !editForm.lastName.trim() ||
    !editForm.phone.trim() ||
    !editForm.login.trim()
  ) {
    setEditError("Uzupełnij wymagane pola.");
    return;
  }

  try {
    setEditSaving(true);
    setEditError("");

    const data: {
  firstName: string;
  lastName: string;
  phone: string;
  login: string;
  password?: string;
  role: "RATOWNIK" | "ADMIN";
} = {
  firstName: editForm.firstName.trim(),
  lastName: editForm.lastName.trim(),
  phone: editForm.phone.trim(),
  login: editForm.login.trim(),
  role: editForm.role,
};

    // Hasło wysyłamy tylko wtedy, gdy administrator
    // faktycznie wpisał nowe.
    if (editForm.password.trim()) {
      data.password = editForm.password;
    }

    const response = await api.patch<User>(
      `/users/${editingUser.id}`,
      data
    );

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === editingUser.id
          ? response.data
          : user
      )
    );

    setEditOpen(false);
    setEditingUser(null);
  } catch (error) {
    console.error(
      "Nie udało się edytować strażaka:",
      error
    );

    setEditError("Nie udało się zapisać zmian.");
  } finally {
    setEditSaving(false);
  }
};
  const handleCreateUser = async () => {
  if (
    !form.firstName.trim() ||
    !form.lastName.trim() ||
    !form.phone.trim() ||
    !form.login.trim() ||
    !form.password.trim()
  ) {
    setError("Uzupełnij wszystkie pola.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const response = await api.post<User>("/users", {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      login: form.login.trim(),
      password: form.password,
    });

    setUsers((currentUsers) => [
      ...currentUsers,
      response.data,
    ]);

    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      login: "",
      password: "",
      role: "RATOWNIK",
    });

    setDialogOpen(false);
  } catch (error) {
    console.error("Nie udało się dodać strażaka:", error);
    setError("Nie udało się dodać strażaka.");
  } finally {
    setSaving(false);
  }
};
const handleToggleActive = async (user: User) => {
  try {
    const response = await api.patch<User>(
      `/users/${user.id}/active`,
      {
        active: !user.active,
      }
    );

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? response.data
          : currentUser
      )
    );
  } catch (error) {
    console.error(
      "Nie udało się zmienić statusu strażaka:",
      error
    );
  }
};
const handleOpenDelete = (user: User) => {
  setDeletingUser(user);
  setDeleteOpen(true);
};

const handleDeleteUser = async () => {
  if (!deletingUser) {
    return;
  }

  try {
    setDeleting(true);

    await api.delete(`/users/${deletingUser.id}`);

    setUsers((currentUsers) =>
      currentUsers.filter(
        (user) => user.id !== deletingUser.id
      )
    );

    setDeleteOpen(false);
    setDeletingUser(null);
  } catch (error) {
    console.error(
      "Nie udało się usunąć strażaka:",
      error
    );
  } finally {
    setDeleting(false);
  }
};

const isAdmin = currentUser?.role === "ADMIN";

  return (
    <Box
      sx={{
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            color="white"
            sx={{ fontWeight: 700 }}
          >
            Strażacy
          </Typography>

          <Typography color="#94a3b8">
            Zarządzanie osobami należącymi do grupy alarmowej
          </Typography>
        </Box>
{isAdmin && (
  <Button
    variant="contained"
    startIcon={<PersonAddIcon />}
    onClick={() => setDialogOpen(true)}
    sx={{
      bgcolor: "#2563eb",
      fontWeight: 700,
    }}
  >
    DODAJ STRAŻAKA
  </Button>
)}
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {users.map((user) => (
            <Card
              key={user.id}
              sx={{
                bgcolor: "#1e293b",
                color: "white",
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",

                  "&:last-child": {
                    pb: 2,
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    {user.firstName} {user.lastName}
{currentUser?.id === user.id && (
  <Chip
    label="TY"
    size="small"
    color="primary"
    sx={{
      ml: 1,
      fontWeight: 700,
    }}
  />
)}
                  </Typography>

                  <Typography color="#94a3b8">
                    {user.phone}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="#64748b"
                  >
                    Login: {user.login}
                  </Typography>
                </Box>

<Stack
  direction="row"
  spacing={2}
  sx={{
    alignItems: "center",
  }}
>
  <Chip
    label={user.active ? "AKTYWNY" : "NIEAKTYWNY"}
    color={user.active ? "success" : "error"}
    sx={{ fontWeight: 700 }}
  />

  <Chip
  label={
    user.role === "ADMIN"
      ? "ADMINISTRATOR"
      : "RATOWNIK"
  }
  color={
    user.role === "ADMIN"
      ? "warning"
      : "primary"
  }
  variant="outlined"
  sx={{
    fontWeight: 700,
    minWidth: 120,
  }}
/>

  {isAdmin && (
    <>
      <Button
        variant="outlined"
        onClick={() => handleOpenEdit(user)}
        sx={{
          fontWeight: 700,
          minWidth: 100,
        }}
      >
        EDYTUJ
      </Button>

      <Button
        variant="outlined"
        color={user.active ? "warning" : "success"}
        onClick={() => handleToggleActive(user)}
        disabled={
          currentUser?.id === user.id && user.active
        }
        sx={{
          fontWeight: 700,
          minWidth: 130,
        }}
      >
        {user.active ? "DEZAKTYWUJ" : "AKTYWUJ"}
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={() => handleOpenDelete(user)}
        disabled={currentUser?.id === user.id}
        sx={{
          fontWeight: 700,
          minWidth: 90,
        }}
      >
        USUŃ
      </Button>
    </>
  )}
</Stack>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <Typography color="#94a3b8">
              Brak strażaków w bazie.
            </Typography>
          )}
        </Stack>
      )}

            {/* ========================= */}
      {/* DODAWANIE STRAŻAKA */}
      {/* ========================= */}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!saving) {
            setDialogOpen(false);
            setError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Dodaj strażaka
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Imię"
              fullWidth
              value={form.firstName}
              onChange={(event) =>
                setForm({
                  ...form,
                  firstName: event.target.value,
                })
              }
            />

            <TextField
              label="Nazwisko"
              fullWidth
              value={form.lastName}
              onChange={(event) =>
                setForm({
                  ...form,
                  lastName: event.target.value,
                })
              }
            />

            <TextField
              label="Numer telefonu"
              fullWidth
              value={form.phone}
              onChange={(event) =>
                setForm({
                  ...form,
                  phone: event.target.value,
                })
              }
            />

            <TextField
              label="Login"
              fullWidth
              value={form.login}
              onChange={(event) =>
                setForm({
                  ...form,
                  login: event.target.value,
                })
              }
            />

            <TextField
              label="Hasło"
              type="password"
              fullWidth
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setError("");
            }}
            disabled={saving}
          >
            ANULUJ
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={saving}
          >
            {saving ? "DODAWANIE..." : "DODAJ STRAŻAKA"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= */}
      {/* EDYCJA STRAŻAKA */}
      {/* ========================= */}

      <Dialog
        open={editOpen}
        onClose={() => {
          if (!editSaving) {
            setEditOpen(false);
            setEditingUser(null);
            setEditError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edytuj strażaka
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editError && (
              <Alert severity="error">
                {editError}
              </Alert>
            )}

            <TextField
              label="Imię"
              fullWidth
              value={editForm.firstName}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  firstName: event.target.value,
                })
              }
            />

            <TextField
              label="Nazwisko"
              fullWidth
              value={editForm.lastName}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  lastName: event.target.value,
                })
              }
            />

            <TextField
              label="Numer telefonu"
              fullWidth
              value={editForm.phone}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  phone: event.target.value,
                })
              }
            />

            <TextField
              label="Login"
              fullWidth
              value={editForm.login}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  login: event.target.value,
                })
              }
            />

            <TextField
              select
              label="Rola"
              fullWidth
              value={editForm.role}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  role: event.target.value as
                    | "RATOWNIK"
                    | "ADMIN",
                })
              }
            >
              <MenuItem value="RATOWNIK">
                Ratownik
              </MenuItem>

              <MenuItem value="ADMIN">
                Administrator
              </MenuItem>
            </TextField>

            <TextField
              label="Nowe hasło"
              type="password"
              fullWidth
              value={editForm.password}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  password: event.target.value,
                })
              }
              helperText="Pozostaw puste, jeśli nie chcesz zmieniać hasła."
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setEditOpen(false);
              setEditingUser(null);
              setEditError("");
            }}
            disabled={editSaving}
          >
            ANULUJ
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={editSaving}
          >
            {editSaving
              ? "ZAPISYWANIE..."
              : "ZAPISZ ZMIANY"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= */}
      {/* USUWANIE STRAŻAKA */}
      {/* ========================= */}

      <Dialog
        open={deleteOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setDeletingUser(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Usuń strażaka
        </DialogTitle>

        <DialogContent>
          <Typography>
            Czy na pewno chcesz trwale usunąć:
          </Typography>

          <Typography
            sx={{
              fontWeight: 700,
              mt: 2,
              fontSize: 18,
            }}
          >
            {deletingUser?.firstName}{" "}
            {deletingUser?.lastName}
          </Typography>

          <Alert severity="warning" sx={{ mt: 2 }}>
            Tej operacji nie można cofnąć. Historia
            wcześniejszych alarmów zostanie zachowana.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteOpen(false);
              setDeletingUser(null);
            }}
            disabled={deleting}
          >
            ANULUJ
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={deleting}
          >
            {deleting
              ? "USUWANIE..."
              : "USUŃ TRWALE"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}