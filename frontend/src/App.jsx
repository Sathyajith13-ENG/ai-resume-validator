import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AnalysisPage from './pages/AnalysisPage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'analysis'
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setPage('analysis');
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setPage('landing');
  };

  return (
    <>
      {page === 'landing' ? (
        <LandingPage onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <AnalysisPage
          data={analysisData}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </>
  );
}
