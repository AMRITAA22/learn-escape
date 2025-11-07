// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudyRoomsPage } from './pages/StudyRoomsPage';
import { RoomPage } from './pages/RoomPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'; 
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import TasksPage from './pages/TasksPage';
import { FlashcardsPage } from './pages/FlashcardsPage'; 
import { DeckPage } from './pages/DeckPage';
import { PomodoroPage } from './pages/PomodoroPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { NotesPage } from './pages/NotesPage';
import LandingPage from "./pages/LandingPage";
import { AchievementsPage } from './pages/AchievementsPage';
import { StudyGroupsListPage } from './pages/StudyGroupsListPage';
import StudyGroupDetailPage from './pages/StudyGroupDetailPage';
import { PlannerPage } from "./pages/PlannerPage";
import { NptelPage } from './pages/NptelPage';

// Import the new quiz pages (with correct casing)
import QuizPlayPage from './pages/QuizPlayPage';
import { QuizResultPage } from './pages/QuizResultPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/reset-password/:token" element={<ResetPasswordPage />}/>

        {/* --- THIS IS THE UPDATED PART --- */}
        {/* We put them here so they don't use the main Layout (no sidebar) */}
        <Route 
          path="/quiz/play/:id" 
          element={<ProtectedRoute><QuizPlayPage /></ProtectedRoute>} 
        />
        {/* The 'id' here is now the QUIZ ID */}
        <Route 
          path="/quiz/result/:id" 
          element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} 
        />
        {/* --- END OF UPDATE --- */}

        {/* Protected routes with Layout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/study-rooms" element={<StudyRoomsPage />} />
                  <Route path="/room/:roomId" element={<RoomPage />} /> 
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/tasks" element={<TasksPage />} />  
                  <Route path="/flashcards" element={<FlashcardsPage />} /> 
                  <Route path="/flashcards/:id" element={<DeckPage />} />
                  <Route path="/pomodoro" element={<PomodoroPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/study-groups" element={<StudyGroupsListPage />} />
                  <Route path="/study-groups/:id" element={<StudyGroupDetailPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/nptel" element={<NptelPage />} />
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