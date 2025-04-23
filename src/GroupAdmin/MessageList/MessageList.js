import React, { useState, useEffect } from "react";
import "./MessageList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";

const MessageList = () => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();
  const itemsPerPage = 10;

  const [editForm, setEditForm] = useState({
    to_number: "",
    message: "",
    time_send: "",
    date_send: "",
  });
// some changing
  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.BASE_URL}/api/auto-messages?page=${page}&per_page=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      setMessages(data.data || []);
      setTotalPages(data.last_page || 1);
      setCurrentPage(data.current_page || 1);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return "N/A";

    try {
      if (timeString.includes("T")) {
        return new Date(timeString).toLocaleString();
      }

      if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        const today = new Date();
        const [hours, minutes, seconds] = timeString.split(":");
        today.setHours(hours, minutes, seconds);
        return today.toLocaleTimeString();
      }

      return timeString;
    } catch (e) {
      console.error("Error formatting date:", e);
      return timeString;
    }
  };

  const fetchMessageDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.BASE_URL}/api/auto-messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to fetch message details"
        );
      }

      const messageData = responseData.data || responseData;

      if (messageData) {
        setSelectedMessage(messageData);

        let datetime;
        let date = "";
        let time = "";

        if (messageData.time_send) {
          if (/^\d{2}:\d{2}:\d{2}$/.test(messageData.time_send)) {
            const today = new Date();
            const [hours, minutes, seconds] = messageData.time_send.split(":");
            date = today.toISOString().split("T")[0];
            time = `${hours}:${minutes}:${seconds}`;
          }
          else if (!isNaN(new Date(messageData.time_send).getTime())) {
            datetime = new Date(messageData.time_send);
            date = datetime.toISOString().split("T")[0];
            const hours = datetime.getHours().toString().padStart(2, '0');
            const minutes = datetime.getMinutes().toString().padStart(2, '0');
            const seconds = datetime.getSeconds().toString().padStart(2, '0');
            time = `${hours}:${minutes}:${seconds}`;
          }
        }

        if (!date || !time) {
          datetime = new Date();
          date = datetime.toISOString().split("T")[0];
          const hours = datetime.getHours().toString().padStart(2, '0');
          const minutes = datetime.getMinutes().toString().padStart(2, '0');
          const seconds = datetime.getSeconds().toString().padStart(2, '0');
          time = `${hours}:${minutes}:${seconds}`;
        }

        setEditForm({
          to_number: messageData.to_number || "",
          message: messageData.message || "",
          date_send: date,
          time_send: time,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
      console.error("Error fetching message details:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async (id) => {
    try {
      setLoading(true);

      // Combine date and time into a single datetime string
      const datetimeString = `${editForm.date_send}T${editForm.time_send}`;
      
      const response = await fetch(
        `${config.BASE_URL}/api/auto-messages/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to_number: editForm.to_number,
            message: editForm.message,
            time_send: datetimeString, // Send combined datetime
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update message");
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Campaign updated successfully!",
      });

      fetchMessages(currentPage);
      setEditMode(false);
      setSelectedMessage(null);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    try {
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

      setLoading(true);
      const response = await fetch(
        `${config.BASE_URL}/api/auto-messages/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your campaign has been deleted.",
      });

      fetchMessages(currentPage);
      setSelectedMessage(null);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchMessages(newPage);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading && messages.length === 0) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="message-list-container">
      <h2 className="page-title">Scheduled Campaigns</h2>

      {selectedMessage ? (
        editMode ? (
          <div className="edit-form">
            <h3>Edit Campaign</h3>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="to_number"
                value={editForm.to_number}
                onChange={handleEditChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Campaign Content</label>
              <textarea
                name="message"
                value={editForm.message}
                onChange={handleEditChange}
                placeholder="Type your campaign"
                rows="5"
                required
              />
            </div>

            <div className="datetime-group">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date_send"
                  value={editForm.date_send}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time (HH:MM:SS)</label>
                <input
                  type="time"
                  name="time_send"
                  value={editForm.time_send}
                  onChange={handleEditChange}
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={() => updateMessage(selectedMessage.id)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="message-details">
            <div className="detail-header">
              <h3>Campaign Details</h3>
              <button
                className="back-button"
                onClick={() => setSelectedMessage(null)}
              >
                ← Back to List
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">
                  {selectedMessage.id || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">To:</span>
                <span className="detail-value">
                  {selectedMessage.to_number || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Campaign:</span>
                <span className="detail-value">
                  {selectedMessage.message || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Scheduled Time:</span>
                <span className="detail-value">
                  {formatDateTime(selectedMessage.time_send)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {selectedMessage.status || "Pending"}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteMessage(selectedMessage.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="messages-table-container">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>To Number</th>
                  <th>Campaign</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <tr key={message.id}>
                      <td>{message.id || "N/A"}</td>
                      <td>{message.to_number || "N/A"}</td>
                      <td className="message-preview">
                        {message.message
                          ? message.message.length > 50
                            ? `${message.message.substring(0, 50)}...`
                            : message.message
                          : "N/A"}
                      </td>
                      <td>{formatDateTime(message.time_send)}</td>
                      <td>
                        <span
                          className={`status-badge ${(
                            message.status || ""
                          ).toLowerCase()}`}
                        >
                          {message.status || "Pending"}
                        </span>
                      </td>
                      <td>
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
                              onClick={() => fetchMessageDetails(message.id)}
                            >
                              View
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-messages">
                      No scheduled campaigns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageList;