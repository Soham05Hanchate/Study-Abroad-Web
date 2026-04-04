import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentView from './pages/StudentView';
import CounsellorBookingFlow from './pages/CounsellorBookingFlow';
import CounsellorLogin from './pages/CounsellorLogin';

function App() {
  return (
    <Router>
      <Routes>
        {/* This is your "localhost:3000/" */}
        <Route path="/" element={<LandingPage />} />
        
        {/* This is your "localhost:3000/student" */}
        <Route path="/student" element={<StudentView />} />
        <Route path="/book" element={<CounsellorBookingFlow isOpen={true} />} />
        <Route path="/counsellor-login" element={<CounsellorLogin />} />
      </Routes>
    </Router>
  );
}

export default App;