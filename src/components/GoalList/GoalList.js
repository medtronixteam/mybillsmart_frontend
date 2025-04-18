import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GoalList.css";
import { useAuth } from "../../contexts/AuthContext";

const AgentGoalList = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://bill.medtronix.world/api/goals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGoals(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch goals. Please try again.");
      setLoading(false);
      console.error("Error fetching goals:", err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      setLoading(true);
      await axios.delete(
        `https://bill.medtronix.world/api/goals/${goalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Goal deleted successfully!");
      fetchGoals();
    } catch (err) {
      setError("Failed to delete goal. Please try again.");
      console.error("Error deleting goal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.patch(
        `https://bill.medtronix.world/api/goals/${editingGoal.id}/status`,
        editingGoal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Goal updated successfully!");
      setEditingGoal(null);
      fetchGoals();
    } catch (err) {
      setError("Failed to update goal. Please try again.");
      console.error("Error updating goal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingGoal({
      ...editingGoal,
      [name]: value,
    });
  };

  return (
    <div className="goal-list-container">
      <h2>Goals List</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && !editingGoal ? (
        <div className="loading">Loading goals...</div>
      ) : (
        <>
          {editingGoal ? (
            <div className="edit-goal-form">
              <h3>Edit Goal</h3>
              <form onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label>Task Name</label>
                  <input
                    type="text"
                    name="task_name"
                    value={editingGoal.task_name}
                    onChange={handleEditInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={editingGoal.start_date}
                      onChange={handleEditInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={editingGoal.end_date}
                      onChange={handleEditInputChange}
                      className="form-control"
                      required
                      min={editingGoal.start_date}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Points</label>
                  <input
                    type="number"
                    name="points"
                    value={editingGoal.points}
                    onChange={handleEditInputChange}
                    className="form-control"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={editingGoal.status}
                    onChange={handleEditInputChange}
                    className="form-control"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="goals-table-container table-responsive">
              <table className="goals-table table table-bordered">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No goals found
                      </td>
                    </tr>
                  ) : (
                    goals.map((goal) => (
                      <tr key={goal.id}>
                        <td>{goal.task_name}</td>
                        <td>{formatDate(goal.start_date)}</td>
                        <td>{formatDate(goal.end_date)}</td>
                        <td>{goal.points}</td>
                        <td>
                          {goal.status.charAt(0).toUpperCase() +
                            goal.status.slice(1).replace("_", " ")}
                        </td>
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(goal)}
                            className="btn btn-edit"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="btn btn-delete"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentGoalList;
