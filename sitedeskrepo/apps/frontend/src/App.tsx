import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/auth/SignInPage.js';
import SignUpPage from './pages/auth/SignUpPage.js';
import RequireAuth from './components/RequireAuth.js';
import AdminLayout from './layouts/AdminLayout.js';
import AgentLayout from './layouts/AgentLayout.js';
import Dashboard from './pages/Dashboard.js';

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route element={<RequireAuth roles={[ 'ADMIN' ]}><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
      </Route>

      <Route element={<RequireAuth roles={[ 'AGENT' ]}><AgentLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}