import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./UserList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Breadcrumbs from "../../Breadcrumbs";

const UserList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([]);
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
  const [roleFilter, setRoleFilter] = useState("all");

  // Performance view states
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [currentContractPage, setCurrentContractPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

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

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/api/group/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        setUsers(result.data);
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

  // Filter users based on selected role
  const filteredUsers =
    roleFilter === "all"
      ? users
      : users.filter((user) => user.role === roleFilter);

  // Performance view functions
  const fetchPerformanceData = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.BASE_URL}/api/group/user/detail/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch performance data");
      }

      const result = await response.json();
      setPerformanceData(result.data.user);
      setShowPerformance(true);
      setCurrentInvoicePage(1);
      setCurrentContractPage(1);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to fetch performance data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromPerformance = () => {
    setShowPerformance(false);
    setPerformanceData(null);
  };

  // Pagination functions
  const paginate = (array, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return array.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalInvoicePages = performanceData
    ? Math.ceil(performanceData.invoices.length / itemsPerPage)
    : 0;
  const totalContractPages = performanceData
    ? Math.ceil(performanceData.contracts.length / itemsPerPage)
    : 0;

  // User list pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginateUsers = (pageNumber) => setCurrentPage(pageNumber);
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
        `${config.BASE_URL}/api/group/user/detail/${id}`,
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
      const response = await fetch(
        `${config.BASE_URL}/api/group/session/history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
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
          `${config.BASE_URL}/api/group/user/disable/${id}`,
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
          `${config.BASE_URL}/api/group/user/enable/${id}`,
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
          `${config.BASE_URL}/api/group/user/delete/${id}`,
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
        `${config.BASE_URL}/api/group/user/edit/${editData.id}`,
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

  return (
    <div className="user-list-container">
      <Breadcrumbs homePath={"/group_admin/dashboard"} />
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
      ) : showPerformance ? (
        <div className="performance-view-container">
          <button onClick={handleBackFromPerformance} className="back-button">
            Back to User List
          </button>

          <div className="user-details-container">
            <div className="user-profile-card">
              <div className="profile-header">
                <div className="avatar">{performanceData.name.charAt(0)}</div>
                <div className="profile-info">
                  <h3>{performanceData.name}</h3>
                  <p className="user-role">{performanceData.role}</p>
                </div>
                <span
                  className={`status-badge ${
                    performanceData.status === 1 ? "active" : "inactive"
                  }`}
                >
                  {performanceData.status === 1 ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{performanceData.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">
                    {performanceData.phone || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Login:</span>
                  <span className="detail-value">
                    {performanceData.last_login_at || "Never logged in"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member Since:</span>
                  <span className="detail-value">
                    {new Date(performanceData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {performanceData.city
                      ? `${performanceData.city}, ${performanceData.country}`
                      : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Points:</span>
                  <span className="detail-value">{performanceData.points}</span>
                </div>
              </div>
            </div>

            {/* Invoices Section */}
            <div className="data-section">
              <div className="section-header">
                <h3>
                  Invoices{" "}
                  <span className="count-badge">
                    {performanceData.invoices.length}
                  </span>
                </h3>
                {performanceData.invoices.length > 0 && (
                  <div className="pagination-info">
                    Page {currentInvoicePage} of {totalInvoicePages}
                  </div>
                )}
              </div>

              {performanceData.invoices.length > 0 ? (
                <>
                  <div className="responsive-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Period</th>
                          <th>Address</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(
                          performanceData.invoices,
                          currentInvoicePage
                        ).map((invoice) => (
                          <tr key={invoice.id}>
                            <td data-label="ID">{invoice.id}</td>
                            <td data-label="Type">{invoice.bill_type}</td>
                            <td data-label="Period">
                              {invoice.billing_period}
                            </td>
                            <td data-label="Address">{invoice.address}</td>
                            <td data-label="Total Bill">
                              €{invoice.bill_info?.["total bill"] || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentInvoicePage((p) => Math.max(p - 1, 1))
                      }
                      disabled={currentInvoicePage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentInvoicePage((p) =>
                          Math.min(p + 1, totalInvoicePages)
                        )
                      }
                      disabled={currentInvoicePage === totalInvoicePages}
                      className="pagination-btn"
                    >
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-file-invoice"></i>
                  <p>No invoices found for this user</p>
                </div>
              )}
            </div>

            {/* Contracts Section */}
            <div className="data-section">
              <div className="section-header">
                <h3>
                  Agreements{" "}
                  <span className="count-badge">
                    {performanceData.contracts.length}
                  </span>
                </h3>
                {performanceData.contracts.length > 0 && (
                  <div className="pagination-info">
                    Page {currentContractPage} of {totalContractPages}
                  </div>
                )}
              </div>

              {performanceData.contracts.length > 0 ? (
                <>
                  <div className="responsive-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(
                          performanceData.contracts,
                          currentContractPage
                        ).map((contract) => (
                          <tr key={contract.id}>
                            <td data-label="ID">{contract.id}</td>
                            <td data-label="Type">
                              {contract.contract_type || "N/A"}
                            </td>
                            <td data-label="Start Date">
                              {contract.start_date
                                ? new Date(
                                    contract.start_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td data-label="End Date">
                              {contract.end_date
                                ? new Date(
                                    contract.end_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td data-label="Status">
                              {contract.status || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentContractPage((p) => Math.max(p - 1, 1))
                      }
                      disabled={currentContractPage === 1}
                      className="pagination-btn"
                    >
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentContractPage((p) =>
                          Math.min(p + 1, totalContractPages)
                        )
                      }
                      disabled={currentContractPage === totalContractPages}
                      className="pagination-btn"
                    >
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-file-contract"></i>
                  <p>No agreements found for this user</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1>User List</h1>
          <div className="row align-items-center mb-3">
            <div className="col-12 col-md-4">
              <label htmlFor="role-filter" className="form-label mb-md-0 fs-5">
                Filter by Role:
              </label>
            </div>
            <div className="col-12 col-md-8">
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
              >
                <option value="all">All Roles</option>
                <option value="group_admin">Group Admin</option>
                <option value="client">Client</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p>
              No users found. <Link to="/group_admin/add-user">Add User</Link>
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
                      <td>{getStatusText(user.status)}</td>
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
                                handleEditClick(index, user);
                                setActiveDropdown(false);
                              }}
                            >
                              Edit
                            </a>
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                fetchSessionHistory(user.id);
                                setActiveDropdown(false);
                              }}
                            >
                              Session History
                            </a>
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                fetchPerformanceData(user.id);
                                setActiveDropdown(false);
                              }}
                            >
                              Performance
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
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                handleDeleteClick(user.id);
                                setActiveDropdown(false);
                              }}
                            >
                              Delete
                            </a>
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
                    onClick={() => paginateUsers(index + 1)}
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
                      <option value="agent">Sale Agent</option>
                      {/* <option value="admin">Admin</option> */}
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

export default UserList;
