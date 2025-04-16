import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./ManageGoal.css";
import { useAuth } from "../../contexts/AuthContext";

const ManageGoal = () => {
  const [formData, setFormData] = useState({
    task_name: '',
    start_date: '',
    end_date: '',
    points: '',
    user_ids: [],
    status: 'pending'
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://34.142.252.64:8080/api/group/users/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const filteredUsers = response.data.data.filter(user => 
        user.role === 'supervisor' || user.role === 'agent'
      );

      setUsers(filteredUsers);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      setLoading(false);
      console.error('Error fetching users:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUserCheckbox = (userId) => {
    setFormData(prev => {
      const newUserIds = prev.user_ids.includes(userId)
        ? prev.user_ids.filter(id => id !== userId)
        : [...prev.user_ids, userId];
      
      return {
        ...prev,
        user_ids: newUserIds
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.task_name || !formData.start_date || !formData.end_date || !formData.points || formData.user_ids.length === 0) {
      setError('Please fill in all fields');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after start date');
      return;
    }

   

    try {
      setLoading(true);
      const response = await axios.post('http://34.142.252.64:8080/api/group/goals', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess('Goal created successfully!');
      setFormData({
        task_name: '',
        start_date: '',
        end_date: '',
        points: '',
        user_ids: [],
        status: 'pending'
      });
    } catch (err) {
      setError('Failed to create goal. Please try again.');
      console.error('Error creating goal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-goal-container">
      <h2>Create New Goal</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task_name">Task Name</label>
          <input
            type="text"
            id="task_name"
            name="task_name"
            value={formData.task_name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="form-control"
              required
              min={formData.start_date}
            />
          </div>

          <div className="form-group">
            <label htmlFor="points">Points</label>
            <input
              type="number"
              id="points"
              name="points"
              value={formData.points}
              onChange={handleInputChange}
              className="form-control"
              required
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Assign to Users</label>
          <div className="users-checkbox-container">
            {loading ? (
              <div>Loading users...</div>
            ) : (
              users.map(user => (
                <div key={user.id} className="user-checkbox-item">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={formData.user_ids.includes(user.id)}
                    onChange={() => handleUserCheckbox(user.id)}
                  />
                  <label htmlFor={`user-${user.id}`}>{user.name}</label>
                </div>
              ))
            )}
          </div>
          {formData.user_ids.length === 0 && (
            <small className="text-danger">Please select at least one user</small>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Create Goal'}
        </button>
      </form>
    </div>
  );
};

export default ManageGoal;