import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ClientList.css";
import { useAuth } from "../../contexts/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]); // State to store users list
  const [editIndex, setEditIndex] = useState(null);
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

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on mount

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://34.142.252.64:8080/api/users/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        // Filter users to only include clients
        const clients = result.data.filter((user) => user.role === "client");
        setUsers(clients); // Set filtered clients list
      } else {
        toast.error("Failed to fetch users!");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details for editing
  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(
        `http://34.142.252.64:8080/api/user/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        return result.data; // Return user details
      } else {
        toast.error("Failed to fetch user details!");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details!");
    }
  };

  // Disable a user
  const handleDisableClick = async (id) => {
    try {
      const response = await fetch(
        `http://34.142.252.64:8080/api/user/disable/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("User disabled successfully!");
        fetchUsers(); // Refresh users list
      } else {
        toast.error("Failed to disable user!");
      }
    } catch (error) {
      console.error("Error disabling user:", error);
      toast.error("Failed to disable user!");
    }
  };

  // Enable a user
  const handleEnableClick = async (id) => {
    try {
      const response = await fetch(
        `http://34.142.252.64:8080/api/user/enable/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("User enabled successfully!");
        fetchUsers(); // Refresh users list
      } else {
        toast.error("Failed to enable user!");
      }
    } catch (error) {
      console.error("Error enabling user:", error);
      toast.error("Failed to enable user!");
    }
  };

  // Delete a user
  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch(
        `http://34.142.252.64:8080/api/user/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("User deleted successfully!");
        fetchUsers(); // Refresh users list
      } else {
        toast.error("Failed to delete user!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user!");
    }
  };

  // Handle edit click
  const handleEditClick = async (index, user) => {
    const userDetails = await fetchUserDetails(user.id); // Fetch user details
    if (userDetails) {
      console.log("User Details:", userDetails); // Debugging: Log the API response
      setEditData({
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        password: "", // Password is usually not returned for security reasons
        phone: userDetails.phone || "",
        address: userDetails.address || "",
        country: userDetails.country || "",
        city: userDetails.city || "",
        postalCode: userDetails.postal_code || "",
        role: userDetails.role,
        status: userDetails.status,
      });
      setIsModalOpen(true); // Open the modal
    }
  };

  // Handle save click
  const handleSaveClick = () => {
    if (
      !editData.name ||
      !editData.email ||
      !editData.phone ||
      !editData.country ||
      !editData.city ||
      !editData.postalCode
    ) {
      toast.error("All fields are required!");
      return;
    }
    // Call API to update user here (if needed)
    setIsModalOpen(false);
    toast.success("User updated successfully!");
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // Display user status as "Active" or "Inactive"
  const getStatusText = (status) => {
    return status === 1 ? "Active" : "Inactive";
  };

  return (
    <div className="user-list-container">
      <h1>Client List</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>
          No clients added yet. <Link to="/group_admin/add-user">Add Client</Link>
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{getStatusText(user.status)}</td>
                <td>
                  <button onClick={() => handleEditClick(index, user)}>
                    Edit
                  </button>
                  {user.status === 1 ? (
                    <button onClick={() => handleDisableClick(user.id)}>
                      Disable
                    </button>
                  ) : (
                    <button onClick={() => handleEnableClick(user.id)}>
                      Enable
                    </button>
                  )}
                  <button onClick={() => handleDeleteClick(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email || ""}
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
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={editData.address || ""}
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
                  value={editData.role || ""}
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
                  value={editData.status || ""}
                  onChange={handleEditChange}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleSaveClick}>
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;