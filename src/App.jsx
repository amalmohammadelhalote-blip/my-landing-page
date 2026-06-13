import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import ForgetPassword from "./pages/ForgetPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import Logout from "./pages/Logout";
// الجديد
import DashboardLayout from "./Layout/DashboardLayout";
import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import DeviceDetails from "./pages/DeviceDetails";
import ProfileLayout from "./pages/profile/ProfileLayout";
import ProfileDesktopRedirect from "./pages/profile/ProfileDesktopRedirect";
import ProfileEdit from "./pages/profile/ProfileEdit";
import ProfilePassword from "./pages/profile/ProfilePassword";
import ProfileDelete from "./pages/profile/ProfileDelete";
import ProfilePrivacy from "./pages/profile/ProfilePrivacy";
import ProfileHelp from "./pages/profile/ProfileHelp";
import ProfileLogoutPage from "./pages/profile/ProfileLogout";
import AddDevice from "./pages/AddDevice";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* صفحات عادية */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="devices" element={<Devices />} />
          <Route path="devices/add" element={<AddDevice />} />
          <Route path="devices/:deviceId" element={<DeviceDetails />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<ProfileLayout />}>
            <Route index element={<ProfileDesktopRedirect />} />
            <Route path="edit" element={<ProfileEdit />} />
            <Route path="password" element={<ProfilePassword />} />
            <Route path="delete" element={<ProfileDelete />} />
            <Route path="privacy" element={<ProfilePrivacy />} />
            <Route path="help" element={<ProfileHelp />} />
          </Route>

        </Route>

        
        {/* standalone logout inside dashboard (no profile layout) */}
        <Route
          path="/dashboard/profile/logout"
          element={
            <ProtectedRoute>
              <ProfileLogoutPage />
            </ProtectedRoute>
          }
        />

        {/* auth */}
        <Route path="/logout" element={<Logout />} />

      </Routes>
    </Router>
  );
}

export default App;