import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/auth/Login";
import RegisterStudent from "./pages/auth/RegisterStudent";
import RegisterRecruiter from "./pages/auth/RegisterRecruiter";
//import RegisterAdmin from "./pages/auth/RegisterAdmin";
import RegisterAlumni from "./pages/auth/RegisterAlumni";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import MyPlacements from "./pages/student/MyPlacements";
import BrowseReferrals from "./pages/student/BrowseReferrals";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import RecruiterJobView from "./pages/recruiter/RecruiterJobView";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import PendingRecruiters from "./pages/admin/PendingRecruiters";
import PendingAlumni from "./pages/admin/PendingAlumni";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageRecruiters from "./pages/admin/ManageRecruiters";
import ManageAlumni from "./pages/admin/ManageAlumni";
import ManageApplications from "./pages/admin/ManageApplications";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminJobDetails from "./pages/admin/AdminJobDetails";
import AdminManagement from "./pages/admin/AdminManagement";
import PendingReferrals from "./pages/admin/PendingReferrals";
import ManageReferrals from "./pages/admin/ManageReferrals";

// Alumni Pages
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import PostReferral from "./pages/alumni/PostReferral";
import MyReferrals from "./pages/alumni/MyReferrals";

// Other
import Unauthorized from "./pages/Unauthorized";

// Import job pages
import BrowseJobs from "./pages/student/BrowseJobs";
import JobDetails from "./pages/student/JobDetails";
import PostJob from "./pages/recruiter/PostJob";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import ManageJobs from "./pages/admin/ManageJobs";
import PendingJobs from "./pages/admin/PendingJobs";
import MyApplications from "./pages/student/MyApplications";
import RecruiterJobApplications from "./pages/recruiter/Recruiterjobapplications";

// Import NotificationsPage
import NotificationsPage from "./components/common/NotificationsPage";

import FeedPage from "./pages/shared/FeedPage";
import ExtensionRequests from "./pages/admin/ExtensionRequests";

const App = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px 20px",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />
          }
        />
        <Route
          path="/register/student"
          element={
            !user ? (
              <RegisterStudent />
            ) : (
              <Navigate to={`/${user.role}/dashboard`} />
            )
          }
        />
        <Route
          path="/register/recruiter"
          element={
            !user ? (
              <RegisterRecruiter />
            ) : (
              <Navigate to={`/${user.role}/dashboard`} />
            )
          }
        />
        {/* <Route
          path="/register/admin"
          element={
            !user ? (
              <RegisterAdmin />
            ) : (
              <Navigate to={`/${user.role}/dashboard`} />
            )
          }
        /> */}
        <Route
          path="/register/alumni"
          element={
            !user ? (
              <RegisterAlumni />
            ) : (
              <Navigate to={`/${user.role}/dashboard`} />
            )
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feed"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/referrals"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BrowseReferrals />
            </ProtectedRoute>
          }
        />

               <Route
          path="/student/placements"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyPlacements />
            </ProtectedRoute>
          }
        />


        {/* Recruiter Routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/profile"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:jobId/applications"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/feed"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <FeedPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/recruiters/pending"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingRecruiters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alumni/pending"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingAlumni />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/recruiters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageRecruiters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alumni"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageAlumni />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feed"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/extension-requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ExtensionRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/:jobId"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminJobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admin-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/referrals/pending"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingReferrals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/referrals"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageReferrals />
            </ProtectedRoute>
          }
        />

        {/* Alumni Routes */}
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/profile"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/feed"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/post-referral"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <PostReferral />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/referrals"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <MyReferrals />
            </ProtectedRoute>
          }
        />
        {/* Student Job Routes */}
        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BrowseJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Job Routes */}
        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/post-job"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        {/* Admin Job Routes */}
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/pending"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={["student", "recruiter", "admin", "alumni"]}
            >
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        {/* Other */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default App;
