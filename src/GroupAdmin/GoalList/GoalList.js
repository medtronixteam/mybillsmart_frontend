import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GoalList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const { token } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [goalsPerPage] = useState(10); // You can adjust this number

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    // Apply filters whenever goals, statusFilter or searchTerm changes
    let result = [...goals];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(goal => goal.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(goal => 
        goal.task_name.toLowerCase().includes(term) ||
        goal.status.toLowerCase().includes(term)
      );
    }
    
    setFilteredGoals(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [goals, statusFilter, searchTerm]);

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
      console.error("Error fetching goals:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch goals. Please try again.",
      });
      setLoading(false);
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
      Swal.fire("Deleted!", "Goal has been deleted successfully.", "success");
      fetchGoals();
    } catch (err) {
      console.error("Error deleting goal:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete goal. Please try again.",
      });
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
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Goal updated successfully!",
      });
      setEditingGoal(null);
      fetchGoals();
    } catch (err) {
      console.error("Error updating goal:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update goal. Please try again.",
      });
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

  // Get current goals for pagination
  const indexOfLastGoal = currentPage * goalsPerPage;
  const indexOfFirstGoal = indexOfLastGoal - goalsPerPage;
  const currentGoals = filteredGoals.slice(indexOfFirstGoal, indexOfLastGoal);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="goal-list-container">
      <h2>Goals List</h2>

      {/* Filter Controls */}
      <div className="filter-controls mb-4">
        <div className="row">
          <div className="col-md-4 mb-2">
            <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
            <select
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label htmlFor="searchTerm" className="form-label">Search</label>
            <input
              type="text"
              id="searchTerm"
              className="form-control"
              placeholder="Search by task name or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

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
            <>
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
                    {currentGoals.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No goals found
                        </td>
                      </tr>
                    ) : (
                      currentGoals.map((goal, index) => (
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
                                  onClick={() => {
                                    handleEdit(goal);
                                    setActiveDropdown(false);
                                  }}
                                  disabled={loading}
                                >
                                  Edit
                                </a>
                                <a
                                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                                  onClick={() => {
                                    handleDelete(goal.id);
                                    setActiveDropdown(false);
                                  }}
                                  disabled={loading}
                                >
                                  Delete
                                </a>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredGoals.length > goalsPerPage && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Pre
                      </button>
                    </li>
                    
                    {Array.from({ length: Math.ceil(filteredGoals.length / goalsPerPage) }).map((_, index) => (
                      <li 
                        key={index} 
                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === Math.ceil(filteredGoals.length / goalsPerPage) ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredGoals.length / goalsPerPage)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}

              {/* Results count */}
              <div className="text-muted mt-2">
                Showing {indexOfFirstGoal + 1} to {Math.min(indexOfLastGoal, filteredGoals.length)} of {filteredGoals.length} goals
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GoalList;