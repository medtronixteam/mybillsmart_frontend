import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GoalList.css";
import { useAuth } from "../../contexts/AuthContext";
import { HiDotsHorizontal } from "react-icons/hi";
import config from "../../config";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const AgentGoalList = () => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const { token } = useAuth();

  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [goalsPerPage] = useState(10);

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#3085d6",
    });
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      confirmButtonColor: "#3085d6",
      timer: 1500,
    });
  };

  const showLoadingAlert = () => {
    return Swal.fire({
      title: "Loading",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [goals, statusFilter, startDateFilter, endDateFilter, searchTerm]);

  const fetchGoals = async () => {
    const loadingAlert = showLoadingAlert();
    try {
      setLoading(true);
      const response = await axios.get(`${config.BASE_URL}/api/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(response.data.data);
      loadingAlert.close();
    } catch (err) {
      loadingAlert.close();
      showErrorAlert("Failed to fetch goals. Please try again.");
      console.error("Error fetching goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const applyFilters = () => {
    let result = [...goals];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((goal) => goal.status === statusFilter);
    }

    // Apply date range filter
    if (startDateFilter) {
      result = result.filter(
        (goal) => new Date(goal.start_date) >= new Date(startDateFilter)
      );
    }

    if (endDateFilter) {
      result = result.filter(
        (goal) => new Date(goal.end_date) <= new Date(endDateFilter)
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((goal) =>
        goal.task_name.toLowerCase().includes(term)
      );
    }

    setFilteredGoals(result);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setSearchTerm("");
  };

  // Get current goals for pagination
  const indexOfLastGoal = currentPage * goalsPerPage;
  const indexOfFirstGoal = indexOfLastGoal - goalsPerPage;
  const currentGoals = filteredGoals.slice(indexOfFirstGoal, indexOfLastGoal);
  const totalPages = Math.ceil(filteredGoals.length / goalsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const confirmDelete = async (goalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await handleDelete(goalId);
    }
  };

  const handleDelete = async (goalId) => {
    const loadingAlert = showLoadingAlert();
    try {
      setLoading(true);
      await axios.delete(`${config.BASE_URL}/api/goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadingAlert.close();
      showSuccessAlert("Goal deleted successfully!");
      fetchGoals();
    } catch (err) {
      loadingAlert.close();
      showErrorAlert("Failed to delete goal. Please try again.");
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
    const loadingAlert = showLoadingAlert();
    try {
      setLoading(true);
      await axios.patch(
        `${config.BASE_URL}/api/goals/${editingGoal.id}/status`,
        editingGoal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      loadingAlert.close();
      showSuccessAlert("Goal updated successfully!");
      setEditingGoal(null);
      fetchGoals();
    } catch (err) {
      loadingAlert.close();
      showErrorAlert("Failed to update goal. Please try again.");
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

  // Pagination component
  const Pagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => paginate(number)}>
                {number}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="goal-list-container ">
      <Breadcrumbs homePath={"/agent/dashboard"} />
      <h2>Goals List</h2>

      {/* Filter Section */}
      <div className="filters-section mb-4 rounded bg-transparent shadow-none justify-content-center px-0">
        <div className="row g-3 align-items-end w-100 justify-content-center">
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label m-0">Status</label>
            <select
              className="form-select my-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-2">
            <label className="form-label m-0">Start Date From</label>
            <input
              type="date"
              className="form-control"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-6 col-xl-2">
            <label className="form-label m-0">End Date To</label>
            <input
              type="date"
              className="form-control"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              min={startDateFilter}
            />
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label m-0">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by task name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="col-12 col-xl-2 text-xl-start  text-center">
            <button className="btn btn-primary my-0" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {loading && !editingGoal ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
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
                    {loading ? "Saving..." : "Save Changes"}
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
                      {/* <th>Action</th> */}
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
                          {/* <td>
                            {goal.status.charAt(0).toUpperCase() +
                              goal.status.slice(1).replace("_", " ")}
                          </td> */}

                          <td className="actions">
                            <HiDotsHorizontal
                              size={30}
                              onClick={() => toggleDropdown(index)}
                              className="cursor-pointer"
                            />
                            {activeDropdown === index && (
                              <div
                                className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                                style={{
                                  marginLeft: "-130px",
                                  marginTop: "40px",
                                }}
                              >
                                <a
                                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                                  onClick={() => {
                                    handleEdit(goal);
                                    setActiveDropdown(false);
                                  }}
                                >
                                  Edit
                                </a>
                                <a
                                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                                  onClick={() => {
                                    confirmDelete(goal.id);
                                    setActiveDropdown(false);
                                  }}
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
                <div className="mt-4">
                  <Pagination />
                  <div className="text-center text-muted">
                    Showing {indexOfFirstGoal + 1} to{" "}
                    {Math.min(indexOfLastGoal, filteredGoals.length)} of{" "}
                    {filteredGoals.length} goals
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AgentGoalList;
