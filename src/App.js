import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivitiesMapPage from './pages/ActivitiesMapPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProviderActivitiesPage from './pages/ProviderActivitiesPage';
import ToastNotification from './components/ToastNotification';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastNotification />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/map" element={<ActivitiesMapPage />} />
            <Route path="/activities/:id" element={<ActivityDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute roles={['client']}>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-activities"
              element={
                <ProtectedRoute roles={['prestataire', 'admin']}>
                  <ProviderActivitiesPage />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Auth pages use a bare layout (no Navbar/Footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

