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
        path: 'home',
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
