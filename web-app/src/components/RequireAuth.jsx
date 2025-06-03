import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;