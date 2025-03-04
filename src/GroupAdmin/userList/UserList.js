import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserList.css";

const UserList = ({ users, onDeleteUser, onEditUser }) => {
  const [editIndex, setEditIndex] = useState(null); 
  const [editData, setEditData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const handleEditClick = (index, user) => {
    setEditIndex(index);
    setEditData(user); 
    setIsModalOpen(true); 
  };

  const handleSaveClick = () => {
    if (
      !editData.name ||
      !editData.email ||
      !editData.password ||
      !editData.phone ||
      !editData.country ||
      !editData.city ||
      !editData.postalCode
    ) {
      toast.error("All fields are required!"); 
      return;
    }
    onEditUser(editIndex, editData); 
    setIsModalOpen(false);
    toast.success("User updated successfully!"); 
  };

  const handleDeleteClick = (index) => {
    onDeleteUser(index); 
    toast.success("User deleted successfully!"); 
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  return (
    <div className="user-list-container">
      <h1>User List</h1>
      {users.length === 0 ? (
        <p>
          No users added yet. <Link to="/provider/add-user">Add User</Link>
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEditClick(index, user)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteClick(index)}>
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
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={editData.password || ""}
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
                  value={editData.role || "sale_agent"}
                  onChange={handleEditChange}
                >
                  <option value="sale_agent">Sale Agent</option>
                  <option value="sale_supervisor">Sale Supervisor</option>
                  <option value="provider">Provider</option>
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