import React, { useState, useEffect } from "react";
import "./UserPerformance.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";

const UserPerformance = () => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [currentContractPage, setCurrentContractPage] = useState(1);
  const itemsPerPage = 5;
  const { token } = useAuth();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.BASE_URL}/api/group/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.BASE_URL}/api/group/user/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const result = await response.json();
      setSelectedUser(result.data.user);
      setCurrentInvoicePage(1);
      setCurrentContractPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination functions
  const paginate = (array, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return array.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalInvoicePages = selectedUser
    ? Math.ceil(selectedUser.invoices.length / itemsPerPage)
    : 0;
  const totalContractPages = selectedUser
    ? Math.ceil(selectedUser.contracts.length / itemsPerPage)
    : 0;

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="user-performance-container">
      <div className="header-section">
        <h2 className="page-title">User Management</h2>
        {selectedUser && (
          <button className="back-button" onClick={() => setSelectedUser(null)}>
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        )}
      </div>

      {selectedUser ? (
        <div className="user-details-container">
          <div className="user-profile-card">
            <div className="profile-header">
              <div className="avatar">{selectedUser.name.charAt(0)}</div>
              <div className="profile-info">
                <h3>{selectedUser.name}</h3>
                <p className="user-role">{selectedUser.role}</p>
              </div>
              <span
                className={`status-badge ${
                  selectedUser.status === 1 ? "active" : "inactive"
                }`}
              >
                {selectedUser.status === 1 ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  {selectedUser.phone || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Login:</span>
                <span className="detail-value">
                  {selectedUser.last_login_at || "Never logged in"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Member Since:</span>
                <span className="detail-value">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  {selectedUser.city
                    ? `${selectedUser.city}, ${selectedUser.country}`
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Points:</span>
                <span className="detail-value">{selectedUser.points}</span>
              </div>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="data-section">
            <div className="section-header">
              <h3>
                Invoices{" "}
                <span className="count-badge">
                  {selectedUser.invoices.length}
                </span>
              </h3>
              {selectedUser.invoices.length > 0 && (
                <div className="pagination-info">
                  Page {currentInvoicePage} of {totalInvoicePages}
                </div>
              )}
            </div>

            {selectedUser.invoices.length > 0 ? (
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
                        {/* <th>Details</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(selectedUser.invoices, currentInvoicePage).map(
                        (invoice) => (
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
                            {/* <td data-label="Details">
                            <button className="action-btn view-btn">
                              <i className="fas fa-eye"></i>
                            </button>
                          </td> */}
                          </tr>
                        )
                      )}
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
                  {selectedUser.contracts.length}
                </span>
              </h3>
              {selectedUser.contracts.length > 0 && (
                <div className="pagination-info">
                  Page {currentContractPage} of {totalContractPages}
                </div>
              )}
            </div>

            {selectedUser.contracts.length > 0 ? (
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
                        selectedUser.contracts,
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
                              ? new Date(contract.end_date).toLocaleDateString()
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
      ) : (
        <div className="users-list-container">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td data-label="ID">{user.id}</td>
                      <td data-label="Name">{user.name}</td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Role">{user.role}</td>
                      <td data-label="Status">
                        <span
                          className={`status-badge ${
                            user.status === 1 ? "active" : "inactive"
                          }`}
                        >
                          {user.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td data-label="Actions">
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
                              onClick={() => fetchUserDetails(user.id)}
                            >
                              View
                            </a>
                          </div>
                        )}
                        {/* <button
                          onClick={() => fetchUserDetails(user.id)}
                          className="action-btn view-btn"
                        >
                          <i className="fas fa-eye"></i> View
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <i className="fas fa-users"></i>
                      <p>No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPerformance;
