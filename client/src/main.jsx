import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import RoomGen from './roomGeneration.jsx'
import Signin from './Signin'
import Signup from './Signup'
import Nav from './Nav.jsx'
import Foot from './Footer.jsx'
import './index.css'
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

import { BrowserRouter, Routes, Route } from "react-router-dom";


ReactDOM.createRoot(document.getElementById('root')).render(
  <Theme>
  <div className='flex flex-col justify-between h-screen'>
    <Nav/>
    <div className='flex-grow-1 h-screen bg-gray-800 text-white p-5'>
      <BrowserRouter>
        <Routes>
            <Route path="/roomGen" element={<RoomGen />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/join/:roomID" element={<App/>} />
        </Routes>
      </BrowserRouter>
    </div>
    <Foot/>
  </div>
  </Theme>
)
