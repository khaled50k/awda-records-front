import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { store, RootState } from './store';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

// Import existing pages
import { ProfilePage } from './pages/ProfilePage';

// Import shared pages
import { PatientsPage } from './pages/shared/PatientsPage';
import { ViewPatientPage } from './pages/shared/ViewPatientPage';
import { MedicalRecordsPage } from './pages/shared/MedicalRecordsPage';
import { CreateMedicalRecordPage } from './pages/shared/CreateMedicalRecordPage';
import { CreatePatientPage } from './pages/shared/CreatePatientPage';
import { ViewMedicalRecordPage } from './pages/shared/ViewMedicalRecordPage';
import { TransfersPage } from './pages/shared/TransfersPage';
import { ViewTransferPage } from './pages/shared/ViewTransferPage';
import { TransferRecordPage } from './pages/shared/TransferRecordPage';

// Import admin-specific pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStaticDataPage } from './pages/admin/AdminStaticDataPage';

// Import employee-specific pages
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';

import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { useAuth } from './hooks/useAuth';
import { useStaticData } from './hooks/useStaticData';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { initializeAuthState } = useAuth();
  const { LoadingOverlay } = useStaticData();

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuthState();
  }, [initializeAuthState]);

  return (
    <ThemeProvider>
      {/* Show loading overlay while static data is being fetched */}
      <LoadingOverlay />
      
      <BrowserRouter>
        <div className="font-cairo">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="static-data" element={<AdminStaticDataPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/:patientId" element={<ViewPatientPage />} />
              <Route path="medical-records" element={<MedicalRecordsPage userRole="admin" />} />
              <Route path="medical-records/create" element={<CreateMedicalRecordPage />} />
              <Route path="medical-records/:recordId" element={<ViewMedicalRecordPage />} />
              <Route path="medical-records/:recordId/transfer" element={<TransferRecordPage />} />
              <Route path="patients/create" element={<CreatePatientPage />} />

              <Route path="transfers" element={<TransfersPage userRole="admin" />} />
              <Route path="transfers/:transferId" element={<ViewTransferPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<div className="p-6 text-center text-muted-foreground">صفحة الإعدادات قيد التطوير</div>} />
            </Route>

            {/* Legacy route for backward compatibility - redirects to admin */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<div className="p-6 text-center text-muted-foreground">صفحة الإعدادات قيد التطوير</div>} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
          <Toaster />
          <Sonner />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
