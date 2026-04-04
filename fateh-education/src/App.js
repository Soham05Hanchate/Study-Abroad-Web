import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentView from './pages/StudentView';

function App() {
  return (
    <Router>
      <Routes>
        {/* This is your "localhost:3000/" */}
        <Route path="/" element={<LandingPage />} />
        
        {/* This is your "localhost:3000/student" */}
        <Route path="/student" element={<StudentView />} />
      </Routes>
    </Router>
  );
}

export default App;