import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GoalList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const { token } = useAuth();
  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };
  useEffect(() => {
    fetchGoals();
  }, []);

  const showAlert = (type, title, text) => {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      confirmButtonColor: "#3085d6",
    });
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.BASE_URL}/api/group/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch goals. Please try again.");
      showAlert("error", "Error", "Failed to fetch goals. Please try again.");
      setLoading(false);
      console.error("Error fetching goals:", err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (goalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.delete(`${config.BASE_URL}/api/group/goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Goal deleted successfully!");
      showAlert("success", "Deleted!", "Goal deleted successfully!");
      fetchGoals();
    } catch (err) {
      setError("Failed to delete goal. Please try again.");
      showAlert("error", "Error", "Failed to delete goal. Please try again.");
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
        `${config.BASE_URL}/api/group/goals/${editingGoal.id}/status`,
        editingGoal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Goal updated successfully!");
      showAlert("success", "Success!", "Goal updated successfully!");
      setEditingGoal(null);
      fetchGoals();
    } catch (err) {
      setError("Failed to update goal. Please try again.");
      showAlert("error", "Error", "Failed to update goal. Please try again.");
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
                    goals.map((goal, index) => (
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
                          <HiDotsHorizontal
                            size={30}
                            onClick={() => toggleDropdown(index)}
                            className="cursor-pointer"
                          />

                          {activeDropdown === index && (
                            <div
                              className="dropdown-menu show shadow rounded-3 bg-white mt-4 p-2 border-0"
                              style={{ marginLeft: "-140px" }}
                            >
                              <a
                                className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                                onClick={() => handleEdit(goal)}
                                disabled={loading}
                              >
                                Edit
                              </a>
                              <a
                                className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                                onClick={() => handleDelete(goal.id)}
                                disabled={loading}
                              >
                                Delete
                              </a>
                            </div>
                          )}
                          {/* <button
                            onClick={() => handleEdit(goal)}
                            className="btn btn-edit"
                            disabled={loading}
                          >
                            Edit
                          </button> */}
                          {/* <button
                            onClick={() => handleDelete(goal.id)}
                            className="btn btn-delete"
                            disabled={loading}
                          >
                            Delete
                          </button> */}
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

export default GoalList;