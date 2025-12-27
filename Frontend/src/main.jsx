
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { Toaster } from './components/ui/sonner'
import { Provider } from 'react-redux'
import store from './Store/Store'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './pages/ErrorPage'
import Loginpage from './pages/Loginpage'
import Registerpage from './pages/Register'
import App from './App'
import Carlisting from './pages/Carlisting'
import TestDriveRequests from './pages/TestDriveRequests'
import ChangeRoleRequests from './pages/ChangeRoleRequests'
import RequestRoleChange from './pages/RequestRoleChange'
import DealerInventory from './pages/DealerInventory'
import CompleteProfile from './pages/CompleteProfile'
import Features from './pages/Features'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import Sellerdashboard from './pages/Sellerdashboard'
import Testdrive from './pages/Testdrive'
import Profile from './pages/Profile'
import CarDetails from './pages/Cardetails'
import UserDashboard from './pages/UserDashboard'
import ChatPage from './pages/ChatPage'
import SharedCarView from './pages/SharedCarView'
import Wishlist from './pages/Wishlist'
import AddCar from './pages/AddCar'




console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <UserDashboard />,
      },
      // Public Routes
      {
        path: "/features",
        element: <Features />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      // Authenticated Routes (Placeholders)
      {
        path: "/seller-dashboard",
        element: <Sellerdashboard />,
      },
      {
        path: "/user-dashboard",
        element: <UserDashboard />,
      },
      {
        path: "/my-test-drives",
        element: <Testdrive />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/car/:id",
        element: <CarDetails />,
      },
      {
        path: "/cars",
        element: <Carlisting />,
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
      {
        path: "/inventory",
        element: <DealerInventory />,
      },
      {
        path: "/addcar",
        element: <AddCar />,
      },
      {
        path: "/requests",
        element: <TestDriveRequests />,
      },
      {
        path: "/admin/change-role-requests",
        element: <ChangeRoleRequests />,
      },
      {
        path: "/request-role",
        element: <RequestRoleChange />,
      },
      {
        path: "/shared/car/:id",
        element: <SharedCarView />,
      },


    ],
  },
  {
    path: "/login",
    element: <Loginpage />,
  },
  {
    path: "/register",
    element: <Registerpage />,
  },
  {
    path: "/complete-profile",
    element: <CompleteProfile />,
  },
])
createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultTheme="dark">
    <Toaster />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </ThemeProvider>,
)
