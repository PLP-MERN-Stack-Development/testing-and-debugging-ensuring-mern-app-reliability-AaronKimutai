import React, { useState, useEffect } from 'react';
import BugForm from './components/BugForm.jsx'; 
import BugList from './components/BugList.jsx';
import './App.css'; 

function App() {
  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/bugs';

  const fetchBugs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBugs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const onBugChange = () => {
    fetchBugs();
  };

  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bug Tracker</h1>
      
      <div data-testid="bug-form-container">
        <BugForm onBugCreated={onBugChange} apiUrl={API_URL} />
      </div>

      <hr style={{ margin: '20px 0' }} />
      <div data-testid="bug-list-container">
        <h2>Reported Bugs</h2>
        {loading && <p data-testid="loading-message">Loading bugs...</p>}
        {error && <p data-testid="error-state">Error: {error}</p>}
        
        {!loading && !error && (
          <BugList 
            bugs={bugs} 
            setBugs={setBugs}
            onBugDeleted={onBugChange} 
            apiUrl={API_URL} 
          />
        )}
      </div>
    </div>
  );
}

export default App;