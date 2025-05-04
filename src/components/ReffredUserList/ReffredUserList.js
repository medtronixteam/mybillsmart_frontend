import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Breadcrumbs from "../../Breadcrumbs";

const ReffredUserList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    password: "",
    phone: "",
    address: "",
    country: "",
    city: "",
    postalCode: "",
    role: "",
    status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Session history states
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [selectedUserForSessions, setSelectedUserForSessions] = useState(null);
  const [currentSessionPage, setCurrentSessionPage] = useState(1);
  const [sessionsPerPage] = useState(5);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters whenever users or filter criteria change
  useEffect(() => {
    let result = [...users];

    // Apply status filter
    if (statusFilter !== "all") {
      const statusValue = statusFilter === "active" ? 1 : 0;
      result = result.filter((user) => user.status === statusValue);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.role && user.role.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, statusFilter, searchTerm]);

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/api/agent/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        setUsers(result.data);
        setFilteredUsers(result.data); // Initialize filtered users
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch users!",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic for filtered users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Session history pagination
  const indexOfLastSession = currentSessionPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessionHistory.slice(
    indexOfFirstSession,
    indexOfLastSession
  );

  const paginateSessions = (pageNumber) => setCurrentSessionPage(pageNumber);
  const prevSessionPage = () =>
    currentSessionPage > 1 && setCurrentSessionPage(currentSessionPage - 1);
  const nextSessionPage = () => {
    if (
      currentSessionPage < Math.ceil(sessionHistory.length / sessionsPerPage)
    ) {
      setCurrentSessionPage(currentSessionPage + 1);
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/api/agent/user/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        return result.data.user;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch user details!",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch user details!",
      });
      return null;
    }
  };

  const fetchSessionHistory = async (userId) => {
    try {
      const response = await fetch(`${config.BASE_URL}/api/session/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        setSessionHistory(result.message || []);
        setSelectedUserForSessions(userId);
        setShowSessionHistory(true);
        setCurrentSessionPage(1);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Failed to fetch session history!",
        });
      }
    } catch (error) {
      console.error("Error fetching session history:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch session history!",
      });
    }
  };

  const handleDisableClick = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to disable this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, disable it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${config.BASE_URL}/api/agent/user/disable/${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "User disabled successfully!",
          });
          fetchUsers();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to disable user!",
          });
        }
      } catch (error) {
        console.error("Error disabling user:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to disable user!",
        });
      }
    }
  };

  const handleEnableClick = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to enable this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, enable it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${config.BASE_URL}/api/agent/user/enable/${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "User enabled successfully!",
          });
          fetchUsers();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to enable user!",
          });
        }
      } catch (error) {
        console.error("Error enabling user:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to enable user!",
        });
      }
    }
  };

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${config.BASE_URL}/api/agent/user/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
          });
          fetchUsers();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete user!",
          });
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete user!",
        });
      }
    }
  };

  const handleEditClick = async (index, user) => {
    const userDetails = await fetchUserDetails(user.id);
    if (userDetails) {
      setEditData({
        id: userDetails.id,
        name: userDetails.name,
        phone: userDetails.phone || "",
        address: userDetails.address || "",
        country: userDetails.country || "",
        city: userDetails.city || "",
        postalCode: userDetails.postal_code || "",
        role: userDetails.role,
        status: userDetails.status,
      });
      setIsModalOpen(true);
    }
  };

  const handleSaveClick = async () => {
    if (
      !editData.name ||
      !editData.phone ||
      !editData.country ||
      !editData.city ||
      !editData.postalCode
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "All fields are required!",
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.BASE_URL}/api/agent/user/edit/${editData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editData.name,
            phone: editData.phone,
            address: editData.address,
            country: editData.country,
            city: editData.city,
            postal_code: editData.postalCode,
            role: editData.role,
            status: editData.status,
          }),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "User updated successfully!",
        });
        fetchUsers();
        setIsModalOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Failed to update user!",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update user!",
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const getStatusText = (status) => {
    return status === 1 ? "Active" : "Inactive";
  };

  const handleViewSessionDetails = (session) => {
    setSelectedSession(session);
  };

  const handleBackFromSessionDetails = () => {
    setSelectedSession(null);
  };

  const handleBackFromSessionHistory = () => {
    setShowSessionHistory(false);
    setSelectedUserForSessions(null);
    setSessionHistory([]);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  return (
    <div className="user-list-container">
      {showSessionHistory ? (
        <div className="session-history-container">
          <button
            onClick={handleBackFromSessionHistory}
            className="back-button"
          >
            Back to User List
          </button>

          {selectedSession ? (
            <div className="session-details-card">
              <button
                onClick={handleBackFromSessionDetails}
                className="back-button"
              >
                Back to Session History
              </button>
              <h2>Session Details</h2>
              <div className="session-details">
                {Object.entries(selectedSession).map(([key, value]) => (
                  <div key={key} className="session-detail-item">
                    <strong>{key.replace(/_/g, " ")}:</strong> {value || "N/A"}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-center">Session History</h2>
              {sessionHistory.length === 0 ? (
                <p>No session history available for this user.</p>
              ) : (
                <>
                  <table className="session-history-table">
                    <thead>
                      <tr>
                        <th>Logged In At</th>
                        <th>IP Address</th>
                        <th>Device</th>
                        <th>Platform</th>
                        <th>Browser</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSessions.map((session, index) => (
                        <tr key={index}>
                          <td>{session.logged_in_at || "N/A"}</td>
                          <td>{session.ip_address || "N/A"}</td>
                          <td>{session.device || "N/A"}</td>
                          <td>{session.platform || "N/A"}</td>
                          <td>{session.browser || "N/A"}</td>
                          <td>
                            <button
                              onClick={() => handleViewSessionDetails(session)}
                              className="view-details-btn"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pagination">
                    <button
                      onClick={prevSessionPage}
                      disabled={currentSessionPage === 1}
                      className="page-button"
                    >
                      Previous
                    </button>

                    {Array.from({
                      length: Math.ceil(
                        sessionHistory.length / sessionsPerPage
                      ),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => paginateSessions(index + 1)}
                        className={`page-button ${
                          currentSessionPage === index + 1 ? "active" : ""
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={nextSessionPage}
                      disabled={
                        currentSessionPage ===
                        Math.ceil(sessionHistory.length / sessionsPerPage)
                      }
                      className="page-button"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <Breadcrumbs homePath={"/agent/dashboard"} />
          <h1>Reffred User List</h1>

          {/* Filter Controls */}
          <div className="container my-3">
            <div className="row g-3 align-items-end w-100">
              {/* Status Filter */}
              <div className="col-12 col-md-4">
                <div className="form-group mb-0">
                  <label
                    htmlFor="statusFilter"
                    className="form-label mx-0 mb-0"
                  >
                    Status
                  </label>
                  <select
                    className="form-select my-0"
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Search Input */}
              <div className="col-12 col-md-4">
                <div className="form-group mb-0">
                  <label htmlFor="searchTerm" className="form-label mx-0 mb-0">
                    Search
                  </label>
                  <input
                    type="text"
                    className="form-control my-0"
                    id="searchTerm"
                    placeholder="Search by name, email or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-primary my-0 w-100 filter-btn"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p>
              No users found. <Link to="/agent/add-client">Add User</Link>
            </p>
          ) : (
            <>
              <table className="user-list-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.status === 1 ? "active" : "inactive"
                          }`}
                        >
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="actions-cell w-100">
                        <HiDotsHorizontal
                          size={30}
                          onClick={() => toggleDropdown(index)}
                          className="cursor-pointer"
                        />
                        {activeDropdown === index && (
                          <div
                            className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                            style={{ marginTop: "40px", marginLeft: "-140px" }}
                          >
                          
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                fetchSessionHistory(user.id);
                                setActiveDropdown(false);
                              }}
                            >
                              Reffred User Commsion
                            </a>
                            {user.status === 1 ? (
                              <a
                                onClick={() => {
                                  handleDisableClick(user.id);
                                  setActiveDropdown(false);
                                }}
                                className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              >
                                Disable
                              </a>
                            ) : (
                              <a
                                onClick={() => {
                                  handleEnableClick(user.id);
                                  setActiveDropdown(false);
                                }}
                                className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              >
                                Enable
                              </a>
                            )}
                           
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="page-button"
                >
                  Previous
                </button>

                {Array.from({
                  length: Math.ceil(filteredUsers.length / usersPerPage),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`page-button ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={nextPage}
                  disabled={
                    currentPage ===
                    Math.ceil(filteredUsers.length / usersPerPage)
                  }
                  className="page-button"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="edit-user-modal">
                <h2>Edit User</h2>
                <form>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={editData.phone || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={editData.country || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={editData.city || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={editData.postalCode || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={editData.role || "client"}
                      onChange={handleEditChange}
                    >
                      <option value="client">Client</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={editData.status || 1}
                      onChange={handleEditChange}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      className="save-btn"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReffredUserList;
