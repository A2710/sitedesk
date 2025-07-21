import { Routes, Route } from "react-router-dom";
import SignInPage from "../pages/auth/SignInPage.js";
import SignUpPage from "../pages/auth/SignUpPage.js";
import Dashboard from "../pages/dashboard/Dashboard.js";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/" element={<Dashboard />} />
      {/* ...other routes */}
    </Routes>
  );
}
