import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import RoomGen from './components/roomGeneration.jsx'
import Signin from './auth/Signin.jsx'
import Signup from './auth/Signup.jsx'
import Logout from './auth/Logout.jsx'
import Nav from './components/Nav.jsx'
import Foot from './components/Footer.jsx'
import './index.css'
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";


ReactDOM.createRoot(document.getElementById('root')).render(
  <div className='flex flex-col justify-between h-screen'>
    <Nav/>
    <div className='flex-grow-1 h-screen bg-gradient-to-r from-cyan-800 to-blue-800" text-white p-5'>
      <HashRouter>
        <Routes>
            <Route path="/roomGen" element={<RoomGen />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/join/:roomID" element={<App/>} />
        </Routes>
      </HashRouter>
    </div>
    <Foot/>
  </div>
)
