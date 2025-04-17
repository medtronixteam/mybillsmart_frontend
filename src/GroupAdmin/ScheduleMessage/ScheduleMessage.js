import React, { useState } from 'react';
import "./ScheduleMessage.css";
import { useAuth } from '../../contexts/AuthContext';

const ScheduleMessage = () => {
  const [formData, setFormData] = useState({
    phone_number: '',
    body: '',
    date_send: '',
    time_send: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Format time to include seconds
      const formattedTime = formData.time_send ? `${formData.time_send}:00` : '';
      
      const response = await fetch('http://34.142.252.64:8080/api/auto-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to_number: formData.phone_number,
          message: formData.body,
          time_send: formattedTime,  // Now includes seconds
          date_send: formData.date_send
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule message');
      }

      setSuccess(true);
      setFormData({
        phone_number: '',
        body: '',
        date_send: '',
        time_send: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-message-container">
      <h2 className="page-title">Schedule New Message</h2>
      
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter recipient's phone number with country code"
            pattern="^\+[1-9]\d{1,14}$"
            required
          />
          <small className="input-hint">Format: +CountryCodeNumber (e.g., +1234567890)</small>
        </div>

        <div className="form-group">
          <label htmlFor="body">Message Content</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Type your message here..."
            rows="5"
            required
          />
        </div>

        <div className="datetime-group">
          <div className="form-group">
            <label htmlFor="date_send">Date</label>
            <input
              type="date"
              id="date_send"
              name="date_send"
              value={formData.date_send}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time_send">Time</label>
            <input
              type="time"
              id="time_send"
              name="time_send"
              value={formData.time_send}
              onChange={handleChange}
              required
            />
            {/* <small className="input-hint">Time will be converted to HH:MM:SS format</small> */}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Message scheduled successfully!</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Scheduling...
            </>
          ) : (
            'Schedule Message'
          )}
        </button>
      </form>
    </div>
  );
};

export default ScheduleMessage;