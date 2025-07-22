import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "../pages/auth/SignInPage.js";
import SignUpPage from "../pages/auth/SignUpPage.js";
import RequireAuth from "../components/RequireAuth.js";
import MainLayout from "../layouts/MainLayout.js";
import Dashboard from "../pages/dashboard/Dashboard.js";
import CategoriesPage from "@/pages/categories/index.js";
import TeamsPage from "@/pages/teams/index.js";
// Import other pages as needed

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <RequireAuth roles={["ADMIN", "AGENT"]}>
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* Index route */}
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<CategoriesPage/>} />
        <Route path="teams" element={<TeamsPage/>} />
        {/* Example nested routes: */}
        {/* <Route path="chats" element={<ChatsPage />} /> */}
        {/* <Route path="profile" element={<ProfilePage />} /> */}
        {/* Add more shared or role-based routes here */}
      </Route>
      
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}