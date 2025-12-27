import './App.css'
import Header from "./components/Header/Header"

import { Outlet, useNavigate, Routes, Route, useLocation } from "react-router-dom"
import Footer from "./components/Footer/Footer"
import { useEffect, useState } from 'react'
import authService from './config/authservice'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout } from './Store/authSlice'
import { connectSocket, disconnectSocket } from './Store/authSlice'
import Homepage from './pages/Homepage'
import TestDriveRequests from './pages/TestDriveRequests'
import ChangeRoleRequests from './pages/ChangeRoleRequests'


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  useEffect(() => {
    const fetchUser = async () => {
      authService.getuser().then((userData) => {
        if (userData) {
          dispatch(login({ user: userData.data }))
          if (!userData.data.isprofilecompleted) {
            navigate('/complete-profile');
          }
        } else {
          dispatch(logout())
        }
      }).finally(() => { setLoading(false) })
    }
    fetchUser()
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(connectSocket());
    } else {
      dispatch(disconnectSocket());
    }
  }, [isAuthenticated, dispatch]);

  const isSharedPage = location.pathname.startsWith('/shared/');
  if (loading) return null;

  return isAuthenticated ? (
    <>
      {!isChatPage && !isSharedPage && <Header />}
      <Outlet />
      {!isChatPage && !isSharedPage && <Footer />}
    </>
  ) : (
    <>
      {!isSharedPage && <Header />}
      <Outlet />
      {!isSharedPage && <Footer />}
    </>
  )
}

export default App
