import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Breadcrumbs from "../../Breadcrumbs";
import "./ReffredUserList.css";

const ReffredUserList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Commission modal state
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedUserForCommission, setSelectedUserForCommission] = useState(null);
  const [commissionAmount, setCommissionAmount] = useState("");
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [notifyUser, setNotifyUser] = useState("yes");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users ? [...users] : [];

    if (statusFilter !== "all") {
      const statusValue = statusFilter === "active" ? 1 : 0;
      result = result.filter((user) => user.status === statusValue);
    }

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
    setCurrentPage(1);
  }, [users, statusFilter, searchTerm]);

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/api/agent/referral/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success" && Array.isArray(result.refferedUsers)) {
        setUsers(result.refferedUsers);
        setFilteredUsers(result.refferedUsers);
      } else {
        throw new Error(result.message || "Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch users!",
      });
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Commission handlers
  const handleCommissionClick = (user) => {
    setSelectedUserForCommission(user);
    setShowCommissionModal(true);
    setActiveDropdown(null);
  };

  const handleCommissionSubmit = async () => {
    if (!commissionAmount || isNaN(commissionAmount) || parseFloat(commissionAmount) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Amount",
        text: "Please enter a valid commission amount",
      });
      return;
    }

    setCommissionLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/api/agent/commission/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: selectedUserForCommission.id,
          commission : parseFloat(commissionAmount),
          notify_user: notifyUser,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Commission of ${commissionAmount}% set successfully for ${selectedUserForCommission.name}`,
        });
        setShowCommissionModal(false);
        setCommissionAmount("");
        fetchUsers(); // Refresh the user list to show updated commission
      } else {
        throw new Error(result.message || "Failed to set commission");
      }
    } catch (error) {
      console.error("Error setting commission:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to set commission",
      });
    } finally {
      setCommissionLoading(false);
    }
  };

  const handleCommissionCancel = () => {
    setShowCommissionModal(false);
    setCommissionAmount("");
    setSelectedUserForCommission(null);
  };

  const handleDisableClick = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to disable ${name}!`,
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
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "User disabled successfully!",
          });
          fetchUsers();
        } else {
          throw new Error(result.message || "Failed to disable user");
        }
      } catch (error) {
        console.error("Error disabling user:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to disable user!",
        });
      }
    }
  };

  const handleEnableClick = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to enable ${name}!`,
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
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "User enabled successfully!",
          });
          fetchUsers();
        } else {
          throw new Error(result.message || "Failed to enable user");
        }
      } catch (error) {
        console.error("Error enabling user:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to enable user!",
        });
      }
    }
  };

  const getStatusText = (status) => {
    return status === 1 ? "Active" : "Inactive";
  };

  const getStatusClass = (status) => {
    return status === 1 ? "status-active" : "status-inactive";
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  // Calculate pagination data safely
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser) || [];
  const totalPages = Math.ceil((filteredUsers?.length || 0) / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="user-list-container">
      {/* Commission Modal */}
      {showCommissionModal && selectedUserForCommission && (
        <div className="modal-overlay">
          <div className="commission-modal">
            <h2>Set Commission for {selectedUserForCommission.name}</h2>
            <p className="commission-description">
              Current commission: {selectedUserForCommission.commission || 0}%
            </p>
            <p className="commission-description">
              Please enter the commission percentage you want to assign to this referred user.
              This percentage will be applied to all transactions made by this user.
            </p>
            
            <div className="form-group">
              <label>Commission Percentage</label>
              <div className="input-with-symbol">
                <input
                  type="number"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  placeholder={`Current: ${selectedUserForCommission.commission || 0}%`}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span>%</span>
              </div>
            </div>
            <div className="form-group">
              <label>Notify User</label>
              <select
                value={notifyUser}
                onChange={(e) => setNotifyUser(e.target.value)}
                className="form-select"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={handleCommissionSubmit}
                disabled={commissionLoading}
                className="btn btn-primary confirm-btn"
              >
                {commissionLoading ? "Processing..." : "Confirm Commission"}
              </button>
              <button
                onClick={handleCommissionCancel}
                disabled={commissionLoading}
                className="btn btn-secondary cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Breadcrumbs homePath={"/agent/dashboard"} />
      <h1>Referred User List</h1>

      {/* Filter Controls */}
      <div className="container my-3">
        <div className="row g-3 align-items-end w-100">
          <div className="col-12 col-md-4">
            <div className="form-group mb-0">
              <label htmlFor="statusFilter" className="form-label mx-0 mb-0">
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
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="alert alert-info text-center">
          No users found. <Link to="/agent/add-client" className="alert-link">Add New User</Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="user-list-table table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.commission || 0}%</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          onClick={() => toggleDropdown(index)}
                        >
                          <HiDotsHorizontal />
                        </button>
                        {activeDropdown === index && (
                          <div className="dropdown-menu show">
                            <button
                              className="dropdown-item"
                              onClick={() => handleCommissionClick(user)}
                            >
                              Set Commission
                            </button>
                            {user.status === 1 ? (
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDisableClick(user.id, user.name)}
                              >
                                Disable
                              </button>
                            ) : (
                              <button
                                className="dropdown-item text-success"
                                onClick={() => handleEnableClick(user.id, user.name)}
                              >
                                Enable
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={prevPage}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={nextPage}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ReffredUserList;