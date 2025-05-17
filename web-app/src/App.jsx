import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatisticsPage from './pages/StatisticsPage';
import EyeglassPage from './pages/eyeglass/EyeglassPage';
import EditEyeglassPage from './pages/eyeglass/EditEyeglassPage';
import AddEyeglassPage from './pages/eyeglass/AddEyeglassPage';
import ManageUsersPage from './pages/ManageUsersPage';


const routes = [
  {
    path: '/',
    element: <LoginPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/dashboard',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <HomePage />
      },
      {
        path: 'eyeglasses',
        element: <EyeglassPage />
      },
      {
        path: 'editeyeglasses',
        element: <EditEyeglassPage />
      },
      {
        path: 'addeyeglasses',
        element: <AddEyeglassPage />
      },
      {
        path: 'statistics',
        element: <StatisticsPage />
      },
      {
        path: 'manageusers',
        element: <ManageUsersPage />
      }
    ]
  }
]

const router = createBrowserRouter(routes);


function App() {


  return (
    <>
      <RouterProvider router={router} />

    </>
  )
}

export default App;
