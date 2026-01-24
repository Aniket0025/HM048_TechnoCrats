import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "@/styles/animations.css";

import AnalyticsPage from "./pages/AnalyticsPage";
import AttendancePage from "./pages/AttendancePage";
import Dashboard from "./pages/Dashboard";
import FeedbackPage from "./pages/FeedbackPage";
import GeoFenceManagementPage from "./pages/GeoFenceManagementPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import QRAttendancePage from "./pages/QRAttendancePage";
import SignUpPage from "./pages/SignUpPage";
import TimetablePage from "./pages/TimetablePage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import TeacherAssignmentsPage from "./pages/TeacherAssignmentsPage";
import AssignmentDetailsPage from "./pages/AssignmentDetailsPage";
import QuizPage from "./pages/QuizPage";
import FileSubmissionPage from "./pages/FileSubmissionPage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import EvaluationPage from "./pages/EvaluationPage";
import AITimetablePage from "./pages/AITimetablePage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-attendance"
        element={
          <ProtectedRoute>
            <QRAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable"
        element={
          <ProtectedRoute>
            <TimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      {/* Placeholder routes */}
      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academics"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/geofence"
        element={
          <ProtectedRoute>
            <GeoFenceManagementPage />
          </ProtectedRoute>
        }
      />
      {/* Assignment Routes */}
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <StudentAssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/teacher"
        element={
          <ProtectedRoute>
            <TeacherAssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/create"
        element={
          <ProtectedRoute>
            <CreateAssignmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/:id"
        element={
          <ProtectedRoute>
            <AssignmentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/:id/submit"
        element={
          <ProtectedRoute>
            <FileSubmissionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/:id/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/:id/evaluate"
        element={
          <ProtectedRoute>
            <EvaluationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-timetable"
        element={
          <ProtectedRoute>
            <AITimetablePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
