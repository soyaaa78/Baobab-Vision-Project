import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import StatisticsPage from "../pages/StatisticsPage";
import EyeglassPage from "../pages/eyeglass/EyeglassPage";
import EyeglassCataloguePage from "../pages/eyeglass/EyeglassCataloguePage";
import EditEyeglassPage from "../pages/eyeglass/EditEyeglassPage";
import AddEyeglassPage from "../pages/eyeglass/AddEyeglassPage";
import ManageUsersPage from "../pages/ManageUsersPage";

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
        <Route path="catalogue" element={<EyeglassCataloguePage />} />
        <Route path="eyeglasses/:id" element={<EyeglassPage />} />
        <Route path="addeyeglasses" element={<AddEyeglassPage />} />
        <Route path="editeyeglasses/:id" element={<EditEyeglassPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="manageusers" element={<ManageUsersPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
