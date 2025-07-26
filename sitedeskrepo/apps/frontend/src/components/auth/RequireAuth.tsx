import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/auth.js'; // Adjust the path as needed
import type { GetMeResponse } from '@repo/common/types';

interface RequireAuthProps {
  roles: GetMeResponse['role'][];
  children: React.ReactNode;
}

export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !user || !roles.includes(user.role)) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
