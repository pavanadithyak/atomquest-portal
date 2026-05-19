import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyGoalsPage from "./pages/MyGoalsPage";
import GoalEditorPage from "./pages/GoalEditorPage";
import GoalDetailPage from "./pages/GoalDetailPage";
import ApprovalDashboard from "./pages/ApprovalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogPage from "./pages/AuditLogPage";
import ReportsPage from "./pages/ReportsPage";
import SharedGoalPage from "./pages/SharedGoalPage";
import AchievementPage from "./pages/AchievementPage";
import CheckInPage from "./pages/CheckInPage";
import TeamCheckInsPage from "./pages/TeamCheckInsPage";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Layout><MyGoalsPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/new"
            element={
              <ProtectedRoute>
                <Layout><GoalEditorPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/:id/edit"
            element={
              <ProtectedRoute>
                <Layout><GoalEditorPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/:id"
            element={
              <ProtectedRoute>
                <Layout><GoalDetailPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/:goalSheetId/achievements"
            element={
              <ProtectedRoute>
                <Layout><AchievementPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute roles={["manager", "admin"]}>
                <Layout><ApprovalDashboard /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/check-ins"
            element={
              <ProtectedRoute roles={["manager", "admin"]}>
                <Layout><TeamCheckInsPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-ins/new"
            element={
              <ProtectedRoute roles={["manager", "admin"]}>
                <Layout><CheckInPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout><AuditLogPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout><ReportsPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shared-goals"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout><SharedGoalPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/goals" replace />} />
          <Route path="*" element={<Navigate to="/goals" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
