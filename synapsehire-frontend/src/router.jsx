import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { VerifyEmailSentPage } from './pages/auth/VerifyEmailSentPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { OtpPage } from './pages/auth/OtpPage';
import { SessionsPage } from './pages/auth/SessionsPage';
import { DashboardPage } from './pages/DashboardPage';
import { InterviewRoomPage } from './pages/interview/InterviewRoomPage';
import { AIAnalyticsPage } from './pages/ai/AIAnalyticsPage';
import { VideoInterviewPage } from './pages/video/VideoInterviewPage';
import { RecruiterMonitoringPage } from './pages/video/RecruiterMonitoringPage';
import { AssessmentBuilderPage } from './pages/recruiter/AssessmentBuilderPage';
import { ScheduleInterviewPage } from './pages/recruiter/ScheduleInterviewPage';
import { RecruiterInterviewsPage } from './pages/recruiter/RecruiterInterviewsPage';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

const RecruiterAnalyticsDashboard = lazy(() =>
  import('./pages/analytics/RecruiterAnalyticsDashboard').then((module) => ({
    default: module.RecruiterAnalyticsDashboard
  }))
);
const CandidateAnalyticsDashboard = lazy(() =>
  import('./pages/analytics/CandidateAnalyticsDashboard').then((module) => ({
    default: module.CandidateAnalyticsDashboard
  }))
);

const LazyPage = ({ children }) => (
  <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-panel text-sm text-slate-600">Loading dashboard...</div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/verify-email-sent', element: <VerifyEmailSentPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/otp', element: <OtpPage /> },
      { path: '/sessions', element: <SessionsPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/interviews/:interviewId/room', element: <InterviewRoomPage /> },
      { path: '/interviews/:interviewId/video', element: <VideoInterviewPage /> },
      { path: '/interviews/:interviewId/monitoring', element: <RecruiterMonitoringPage /> },
      { path: '/recruiter/assessments', element: <AssessmentBuilderPage /> },
      { path: '/recruiter/interviews', element: <RecruiterInterviewsPage /> },
      { path: '/recruiter/interviews/new', element: <ScheduleInterviewPage /> },
      { path: '/candidate/profile', element: <CandidateProfilePage /> },
      { path: '/ai/analytics', element: <AIAnalyticsPage /> },
      {
        path: '/analytics/recruiter',
        element: (
          <LazyPage>
            <RecruiterAnalyticsDashboard />
          </LazyPage>
        )
      },
      {
        path: '/analytics/candidate',
        element: (
          <LazyPage>
            <CandidateAnalyticsDashboard />
          </LazyPage>
        )
      }
    ]
  }
]);
