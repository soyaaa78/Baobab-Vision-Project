import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Blocks access when the current role is in blockRoles. Falls back to 404.
const RoleProtectedRoute = ({
  blockRoles = [],
  redirectTo = "/404",
  children,
}) => {
  const role = Cookies.get("role");
  if (role && blockRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

export default RoleProtectedRoute;
