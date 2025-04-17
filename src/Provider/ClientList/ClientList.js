import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
import "./ClientList.css";

const ClientList = () => {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://bill.medtronix.world/api/supervisor/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (result.status === "success") {
        setUsers(result.data);
      } else {
        toast.error(result.message || "Failed to fetch users!");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(
        `https://bill.medtronix.world/api/supervisor/user/${id}`,
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
        toast.error(result.message || "Failed to fetch user details!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details!");
      return null;
    }
  };

  const handleDisableClick = async (id) => {
    try {
      const response = await fetch(
        `https://bill.medtronix.world/api/supervisor/user/disable/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        toast.success("User disabled successfully!");
        fetchUsers();
      } else {
        toast.error(result.message || "Failed to disable user!");
      }
    } catch (error) {
      console.error("Error disabling user:", error);
      toast.error("Failed to disable user!");
    }
  };

  const handleEnableClick = async (id) => {
    try {
      const response = await fetch(
        `https://bill.medtronix.world/api/supervisor/user/enable/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        toast.success("User enabled successfully!");
        fetchUsers();
      } else {
        toast.error(result.message || "Failed to enable user!");
      }
    } catch (error) {
      console.error("Error enabling user:", error);
      toast.error("Failed to enable user!");
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `https://bill.medtronix.world/api/supervisor/user/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        toast.success("User deleted successfully!");
        fetchUsers();
      } else {
        toast.error(result.message || "Failed to delete user!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user!");
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
      toast.error("Name, email and phone are required!");
      return;
    }

    try {
      const response = await fetch(
        `https://bill.medtronix.world/api/supervisor/user/edit/${editData.id}`,
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
        toast.success("User updated successfully!");
        fetchUsers();
        setIsModalOpen(false);
      } else {
        toast.error(result.message || "Failed to update user!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user!");
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
          <div className="spinner"></div>
          <p>Loading users...</p>
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
              {users.map((user) => (
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
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    {user.status === 1 ? (
                      <button
                        className="disable-btn"
                        onClick={() => handleDisableClick(user.id)}
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        className="enable-btn"
                        onClick={() => handleEnableClick(user.id)}
                      >
                        Enable
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      Delete
                    </button>
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
