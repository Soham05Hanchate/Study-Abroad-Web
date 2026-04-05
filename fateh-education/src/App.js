import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages
import LandingPage from './pages/LandingPage';
import StudentView from './pages/StudentView';
import CounsellorBookingFlow from './pages/CounsellorBookingFlow';
import CounsellorLogin from './pages/CounsellorLogin';
import CounsellorDashboard from './pages/CounsellorDashboard';
import CGPAScholarshipRecommender from './pages/CGPAScholarshipRecommender';
import StudentAIOutputReport from './pages/StudentAIOutputReport';
import KnowledgeBaseFAQ from './pages/KnowledgeBaseFAQ'; // <-- ADDED IMPORT

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Shared / General Pages */}
        <Route path="/faqs" element={<KnowledgeBaseFAQ />} /> {/* <-- ADDED ROUTE */}
        
        {/* Student Flow */}
        <Route path="/student" element={<StudentView />} />
        <Route path="/scholarships" element={<CGPAScholarshipRecommender />} />
        <Route path="/book" element={<CounsellorBookingFlow isOpen={true} />} />
        
        {/* Counsellor Flow */}
        <Route path="/counsellor-login" element={<CounsellorLogin />} />
        <Route 
          path="/counsellor-dashboard" 
          element={<CounsellorDashboard onLogout={() => window.location.href = '/'} />} 
        />
        <Route path="/report" element={<StudentAIOutputReport />} /> 
      </Routes>
    </Router>
  );
}

export default App;