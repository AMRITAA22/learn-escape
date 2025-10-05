// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudyRoomsPage } from './pages/StudyRoomsPage'; // Import the new page
import { RoomPage } from './pages/RoomPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'; 
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { TasksPage } from './pages/TasksPage';
import { FlashcardsPage } from './pages/FlashcardsPage';



function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/reset-password/:token" element={<ResetPasswordPage />}/>
        {/* Protected routes with Layout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/study-rooms" element={<StudyRoomsPage />} /> {/* Add this route */}
                  <Route path="/room/:roomId" element={<RoomPage />} /> 
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
