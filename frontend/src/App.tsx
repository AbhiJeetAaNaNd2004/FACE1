import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import EmployeeDirectory from './pages/EmployeeDirectory';
import PresentEmployees from './pages/PresentEmployees';
import EnrollEmployee from './pages/admin/EnrollEmployee';
import ManageAttendance from './pages/admin/ManageAttendance';
import FaceEmbeddings from './pages/admin/FaceEmbeddings';
import LiveFeed from './pages/admin/LiveFeed';
import CameraManagement from './pages/admin/CameraManagement';
import UserManagement from './pages/superadmin/UserManagement';
import SystemSettings from './pages/superadmin/SystemSettings';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import { UserRole } from './types';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Navigate to="/dashboard" replace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Employee Routes (accessible to all authenticated users) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Attendance />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EmployeeDirectory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/present-employees"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PresentEmployees />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/enroll-employee"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <EnrollEmployee />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/manage-attendance"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <ManageAttendance />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/embeddings"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <FaceEmbeddings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/live-feed"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <LiveFeed />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/cameras"
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <CameraManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Super Admin Routes */}
            <Route
              path="/user-management"
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <AppLayout>
                    <SystemSettings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
