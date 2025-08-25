import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CityDetail from './pages/CityDetail';
import About from './pages/About';
import SubscriptionOverlay from './components/SubscriptionOverlay';
// import AdminPanel from './components/AdminPanel';
import { AQIProvider } from './context/AQIContext';
import { useSubscriptionOverlay } from './hooks/useSubscriptionOverlay';

function App() {
  const {
    isOverlayVisible,
    isSubscribed,
    handleSubscribe,
    handleCloseOverlay
  } = useSubscriptionOverlay();

  return (
    <AQIProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/city/:cityName" element={<CityDetail />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          
          {/* Subscription Overlay */}
          <SubscriptionOverlay
            isVisible={isOverlayVisible}
            onClose={handleCloseOverlay}
            onSubscribe={handleSubscribe}
          />
          
          {/* Admin Panel - Only show in development or for admins */}
          {/* {import.meta.env.DEV && <AdminPanel />} */}
        </div>
      </Router>
    </AQIProvider>
  );
}

export default App;