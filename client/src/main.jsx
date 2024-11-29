import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import RoomGen from './components/roomGeneration.jsx'
import Signin from './auth/Signin.jsx'
import Signup from './auth/Signup.jsx'
import Logout from './auth/Logout.jsx'
import './index.css'
import { Routes, Route, HashRouter } from "react-router-dom";
import Layout from './components/Layout.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <>  
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="/" element={<Signin/>} />
          <Route path="/roomGen" element={<RoomGen />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/join/:roomID" element={<App/>} />
        </Route>
      </Routes>
    </HashRouter>
  </>
)
