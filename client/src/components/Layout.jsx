// Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Foot from './Footer';


const Layout = () => {
  return (
    <>
     <div className='flex flex-col justify-between h-screen'>
        <div className='flex-grow-1 h-screen bg-gradient-to-r from-cyan-800 to-blue-800" text-white'>
            <Nav/>
            <Outlet />
        </div>
        <Foot/>
      </div>
    </>
  );
};

export default Layout;