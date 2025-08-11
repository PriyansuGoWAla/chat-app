import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Profile from './pages/Profile'
import {Toaster} from "react-hot-toast"
import { AuthContext } from '../context/authContext'
const App = () => {
  const {authUser} =useContext(AuthContext)
  return (
    <div className="bg-[url('/bgImage.svg')] bg-no-repeat bg-cover min-h-screen">
      <Toaster/>
      <Routes>
      <Route path='/' element={authUser ? <Homepage/>: <Navigate to="/login"/>} />
        <Route path='/login' element={!authUser ? <Login/> :<Navigate to="/"/>} />
        <Route path='/profile' element={ authUser ? <Profile/> : <Navigate to="/"/> } />
      </Routes>
    </div>
  )
}

export default App
