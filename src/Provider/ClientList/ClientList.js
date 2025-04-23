import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./ClientList.css";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from 'sweetalert2';

const ClientList = () => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [users, setUsers] = useState([]);
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

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
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
        `${config.BASE_URL}/api/supervisor/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        return result.data;
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

  const handleDisableClick = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to disable this user!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, disable it!'
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
      title: 'Are you sure?',
      text: "You are about to enable this user!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, enable it!'
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

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
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
      const result = await response.json();
      if (response.ok && result.status === "success") {
        showSuccessAlert("User deleted successfully!");
        fetchUsers();
      } else {
        showErrorAlert(result.message || "Failed to delete user!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showErrorAlert("Failed to delete user!");
    }
  };

  const handleEditClick = async (user) => {
    const userDetails = await fetchUserDetails(user.id);
    if (userDetails) {
      setEditData({
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        password: "",
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
          body: JSON.stringify({
            name: editData.name,
            email: editData.email,
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

      if (response.ok && result.status === "success") {
        showSuccessAlert("User updated successfully!");
        fetchUsers();
        setIsModalOpen(false);
      } else {
        showErrorAlert(result.message || "Failed to update user!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorAlert("Failed to update user!");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
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
    <div className="user-management-container">
      <div className="header-section">
        <h1>User Management</h1>
        <Link to="/supervisor/add-client" className="add-user-btn">
          Add New User
        </Link>
      </div>

      {loading ? (
        <div className="loading-spinner">
         
        </div>
      ) : users.length === 0 ? (
        <div className="no-users-message">
          <p>No users found in the system.</p>
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
              {users.map((user, index) => (
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
                        style={{ marginLeft: "-140px" }}
                      >
                        <a
                          className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                          onClick={() => handleEditClick(user)}
                        >
                          Edit
                        </a>
                        {user.status === 1 ? (
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => handleDisableClick(user.id)}
                          >
                            Disable
                          </a>
                        ) : (
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => handleEnableClick(user.id)}
                          >
                            Enable
                          </a>
                        )}
                        <a
                          className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                          onClick={() => handleDeleteClick(user.id)}
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
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                  />
                </div>
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
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
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
  );
};

export default ClientList;