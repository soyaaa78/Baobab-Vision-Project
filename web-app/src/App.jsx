import './App.css'
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatisticsPage from './pages/StatisticsPage';
import EyeglassPage from './pages/EyeglassPage';
import EditEyeglassPage from './pages/EditEyeglassPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const routes = [
  {
    path: '/',
    element: <LoginPage />
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
