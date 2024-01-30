import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import RoomGen from './roomGeneration.jsx'
import Home from './Home'
import Signin from './Signin'
import Signup from './Signup'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
        <Route path="/roomGen" element={<RoomGen />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/join/:roomID" element={<App />} />
    </Routes>
  </BrowserRouter>
)
