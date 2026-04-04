import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentView from './pages/StudentView';
// Placeholder components for your next steps
const StudentBot = () => <div className="text-white p-10">Voice Agent Interface Coming Soon...</div>;
const CounsellorDash = () => <div className="text-white p-10">Counsellor Dashboard Coming Soon...</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<StudentBot />} />
        <Route path="/counsellor" element={<CounsellorDash />} />
        <Route path="/student" element={<StudentView />} />
      </Routes>
    </Router>
  );
}

export default App;