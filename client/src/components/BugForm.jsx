import React, { useState } from 'react';
import axios from 'axios';
import Button from './Button.jsx'; 

const BugForm = ({ onBugCreated, apiUrl }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Low',
    status: 'Open',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); 
    setSuccess(false);
  };

  const validate = () => {
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return; 
    }

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await axios.post(apiUrl, formData);
      setSuccess(true);
      setFormData({ title: '', description: '', priority: 'Low', status: 'Open' });
      
      if (onBugCreated) {
        onBugCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create bug. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="bug-form" noValidate>
      <h2>Report a New Bug</h2>
      
      {error && (
        <div className="error-message" data-testid="error-message" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" data-testid="success-message" role="alert">
          Bug created successfully!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required 
          data-testid="title-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required 
          data-testid="description-input" 
        />
      </div>

      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          data-testid="priority-select"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          data-testid="status-select"
        >
          <option value="Open">Open</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <Button type="submit" disabled={loading} data-testid="submit-button">
        {loading ? 'Submitting...' : 'Submit Bug'}
      </Button>
    </form>
  );
};

export default BugForm;
