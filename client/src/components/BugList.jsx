import React, { useState } from 'react';
import axios from 'axios';
import Button from './Button.jsx'; 


const BugList = ({ bugs, setBugs, onBugDeleted, apiUrl }) => {
  const [error, setError] = useState('');

  
  const handleDelete = async (bugId) => {
    
    
    
    try {
      await axios.delete(`${apiUrl}/${bugId}`);
      setBugs(bugs.filter(bug => bug._id !== bugId));
      
      if (onBugDeleted) {
        onBugDeleted(bugId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete bug. Please try again.');
    }
  };

  const handleUpdateStatus = async (bugId, newStatus) => {
    try {
      const response = await axios.put(`${apiUrl}/${bugId}`, { status: newStatus });
      setBugs(bugs.map(bug => bug._id === bugId ? response.data : bug));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update bug status. Please try again.');
    }
  };

  return (
    <div data-testid="bug-list">
      <h2>Bug List</h2>
      
      {error && (
        <div className="error-message" data-testid="error-message" role="alert">
          {error}
        </div>
      )}

      {bugs.length === 0 ? (
        <div data-testid="empty-message">No bugs found. Create one to get started!</div>
      ) : (
        <ul data-testid="bug-list-items">
          {bugs.map((bug) => (
            <li key={bug._id} data-testid={`bug-item-${bug._id}`}>
              <div className="bug-item">
                <h3>{bug.title}</h3>
                <p>{bug.description}</p>
                <div className="bug-meta">
                  <span>Priority: {bug.priority}</span>
                  <span>Status: {bug.status}</span>
                </div>
                <div className="bug-actions">
                  <select
                    value={bug.status}
                    onChange={(e) => handleUpdateStatus(bug._id, e.target.value)}
                    data-testid={`status-select-${bug._id}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <Button
                    onClick={() => handleDelete(bug._id)}
                    variant="danger"
                    data-testid={`delete-button-${bug._id}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BugList;
