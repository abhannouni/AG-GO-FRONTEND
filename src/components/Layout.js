import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ userRole, setUserRole }) => (
    <>
        <Navbar userRole={userRole} setUserRole={setUserRole} />
        <Outlet />
        <Footer />
    </>
);

export default Layout;
