import "./App.css";
import RequireAuth from "./components/RequireAuth";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import StatisticsPage from "./pages/StatisticsPage";
import EyeglassPage from "./pages/eyeglass/EyeglassPage";
import EyeglassCataloguePage from "./pages/eyeglass/EyeglassCataloguePage";
import EditEyeglassPage from "./pages/eyeglass/EditEyeglassPage";
import AddEyeglassPage from "./pages/eyeglass/AddEyeglassPage";
import ManageUsersPage from "./pages/ManageUsersPage";

const routes = [
  {
    path: "/",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    element: <RequireAuth />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "", element: <HomePage /> },
          { path: "catalogue", element: <EyeglassCataloguePage /> },
          { path: "eyeglasses/:id", element: <EyeglassPage /> },
          { path: "addeyeglasses", element: <AddEyeglassPage /> },
          { path: "editeyeglasses/:id", element: <EditEyeglassPage /> },
          { path: "statistics", element: <StatisticsPage /> },
          { path: "manageusers", element: <ManageUsersPage /> },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
