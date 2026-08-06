import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";

import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";

import MainLayout from "../layouts/MainLayout";
import FirefightersPage from "../pages/Firefighters/FirefightersPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
  <Routes>
    <Route
      path="/"
      element={<Navigate to="/login" replace />}
    />

    <Route
      path="/login"
      element={
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      }
    />

    <Route
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      <Route
        path="/firefighters"
        element={<FirefightersPage />}
      />
    </Route>

    <Route
      path="*"
      element={<Navigate to="/dashboard" replace />}
    />
  </Routes>
</BrowserRouter>
  );
}