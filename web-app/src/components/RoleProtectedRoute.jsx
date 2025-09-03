import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Blocks access when the current role is in blockRoles. Falls back to 404.
// Allows access only when the current role is in allowRoles (if specified).
const RoleProtectedRoute = ({
  blockRoles = [],
  allowRoles = [],
  redirectTo = "/404",
  children,
}) => {
  const role = Cookies.get("role");

  // If allowRoles is specified, check if current role is allowed
  if (allowRoles.length > 0 && (!role || !allowRoles.includes(role))) {
    return <Navigate to={redirectTo} replace />;
  }

  // If blockRoles is specified, check if current role is blocked
  if (role && blockRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
