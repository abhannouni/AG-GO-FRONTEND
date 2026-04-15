import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivitiesMapPage from './pages/ActivitiesMapPage';

function App() {
  const [userRole, setUserRole] = useState('user'); // 'user' | 'prestataire'

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout userRole={userRole} setUserRole={setUserRole} />}>
          <Route path="/" element={<HomePage userRole={userRole} />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/map" element={<ActivitiesMapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
