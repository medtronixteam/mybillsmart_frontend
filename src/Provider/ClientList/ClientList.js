import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./ClientList.css";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const ClientList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    email: "",
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

  // Filter states
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, roleFilter, statusFilter, searchTerm]);

  const applyFilters = () => {
    let result = [...users];
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }
    if (statusFilter !== "all") {
      const filterStatus = statusFilter === "active" ? 1 : 0;
      result = result.filter((user) => user.status === filterStatus);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term)
      );
    }
    setFilteredUsers(result);
  };

  const resetFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonText: "OK",
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/api/supervisor/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        setUsers(result.data);
      } else {
        showErrorAlert(result.message || "Failed to fetch users!");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showErrorAlert("Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/api/supervisor/user/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        return result.data.user; // Now accessing .user inside .data
      } else {
        showErrorAlert(result.message || "Failed to fetch user details!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      showErrorAlert("Failed to fetch user details!");
      return null;
    }
  };

  const handleEditClick = async (user) => {
    const userDetails = await fetchUserDetails(user.id);
    if (userDetails) {
      setEditData({
        id: userDetails.id,
        name: userDetails.name || "",
        email: userDetails.email || "",
        password: "",
        phone: userDetails.phone || "",
        address: userDetails.address || "",
        country: userDetails.country || "",
        city: userDetails.city || "",
        postalCode: userDetails.postal_code || "",
        role: userDetails.role || "client",
        status: userDetails.status || 1,
      });
      setIsModalOpen(true);
    }
  };

  const handleSaveClick = async () => {
    if (!editData.name || !editData.email || !editData.phone) {
      showErrorAlert("Name, email and phone are required!");
      return;
    }

    try {
      const response = await fetch(
        `${config.BASE_URL}/api/supervisor/user/edit/${editData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        showSuccessAlert("User updated successfully!");
        fetchUsers();
        setIsModalOpen(false);
      } else {
        showErrorAlert(result.message || "Failed to update user!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorAlert("An unexpected error occurred!");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleDeleteClick = async (id) => {
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
      const response = await fetch(
        `${config.BASE_URL}/api/supervisor/user/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultData = await response.json();

      if (response.ok && resultData.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchUsers();
      } else {
        // Show error alert if API returns failure
        Swal.fire({
          icon: "success",
          title: "success",
          text: resultData.message || "Failed to delete user.",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleDisableClick = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to disable this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, disable it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${config.BASE_URL}/api/supervisor/user/disable/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        showSuccessAlert("User disabled successfully!");
        fetchUsers();
      } else {
        showErrorAlert(result.message || "Failed to disable user!");
      }
    } catch (error) {
      console.error("Error disabling user:", error);
      showErrorAlert("Failed to disable user!");
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

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${config.BASE_URL}/api/supervisor/user/enable/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        showSuccessAlert("User enabled successfully!");
        fetchUsers();
      } else {
        showErrorAlert(result.message || "Failed to enable user!");
      }
    } catch (error) {
      console.error("Error enabling user:", error);
      showErrorAlert("Failed to enable user!");
    }
  };

  const getStatusText = (status) => {
    return status === 1 ? "Active" : "Inactive";
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "badge-admin";
      case "supervisor":
        return "badge-supervisor";
      case "agent":
        return "badge-agent";
      case "client":
        return "badge-client";
      default:
        return "badge-default";
    }
  };

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/supervisor/dashboard"} />
      </div>
      <div className="user-management-container">
        <div className="header-section">
          <h1>User Management</h1>
          <Link to="/supervisor/add-client" className="add-user-btn">
            Add New User
          </Link>
        </div>

        {/* Filters Section */}
        <div className="filters-section mb-4 rounded bg-transparent shadow-none">
          <div className="row g-3 align-items-end w-100 justify-content-center">
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label m-0">Role</label>
              <select
                className="form-select my-0"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="agent">Agent</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label m-0">Status</label>
              <select
                className="form-select my-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label m-0">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-3 d-flex">
              <button
                className="btn btn-primary w-100 my-0"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div
            class="spinner-border d-block mx-auto"
            role="status"
            style={{ color: "#3598db" }}
          >
            <span class="visually-hidden">Loading...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-users-message">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
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
                {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`role-badge ${getRoleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.status === 1 ? "active" : "inactive"
                        }`}
                      >
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="actions-cell">
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
                          {user.status === 1 && (
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                handleEditClick(user);
                                setActiveDropdown(false);
                              }}
                            >
                              Edit
                            </a>
                          )}

                          {user.status === 1 ? (
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                handleDisableClick(user.id);
                                setActiveDropdown(false);
                              }}
                            >
                              Disable
                            </a>
                          ) : (
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                handleEnableClick(user.id);
                                setActiveDropdown(false);
                              }}
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
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="edit-user-modal">
              <div className="modal-header">
                <h2>Edit User</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone*</label>
                    <input
                      type="text"
                      name="phone"
                      value={editData.phone}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  {/* <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editData.address}
                      onChange={handleEditChange}
                    />
                  </div> */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={editData.country}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={editData.city}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={editData.postalCode}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        name="role"
                        value={editData.role}
                        onChange={handleEditChange}
                      >
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={editData.status}
                        onChange={handleEditChange}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveClick}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientList;
