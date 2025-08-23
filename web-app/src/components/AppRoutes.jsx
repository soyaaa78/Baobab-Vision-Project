import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Layout from "./Layout";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import StatisticsPage from "../pages/StatisticsPage";
import EyeglassPage from "../pages/eyeglass/EyeglassPage";
import EyeglassCataloguePage from "../pages/eyeglass/EyeglassCataloguePage";
import EditEyeglassPage from "../pages/eyeglass/EditEyeglassPage";
import AddEyeglassPage from "../pages/eyeglass/AddEyeglassPage";
import ManageUsersPage from "../pages/ManageUsersPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route
          path="catalogue"
          element={
            <RoleProtectedRoute blockRoles={["staff_order"]}>
              <EyeglassCataloguePage />
            </RoleProtectedRoute>
          }
        />
        <Route path="eyeglasses/:id" element={<EyeglassPage />} />
        <Route
          path="addeyeglasses"
          element={
            <RoleProtectedRoute blockRoles={["staff_order"]}>
              <AddEyeglassPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="editeyeglasses/:id"
          element={
            <RoleProtectedRoute blockRoles={["staff_order"]}>
              <EditEyeglassPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="statistics"
          element={
            <RoleProtectedRoute blockRoles={["staff_order"]}>
              <StatisticsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="manageusers"
          element={
            <RoleProtectedRoute blockRoles={["staff_product"]}>
              <ManageUsersPage />
            </RoleProtectedRoute>
          }
        />
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
