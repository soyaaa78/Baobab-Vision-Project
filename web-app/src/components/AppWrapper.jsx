import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import ToastContainer from "./ToastContainer";

function AppWrapper() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;
