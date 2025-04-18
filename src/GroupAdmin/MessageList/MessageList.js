import React, { useState, useEffect } from "react";
import "./MessageList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return "N/A";
    
    try {
      // If it's already a full ISO string
      if (timeString.includes('T')) {
        return new Date(timeString).toLocaleString();
      }
      
      // If it's just time (HH:MM:SS)
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        const today = new Date();
        const [hours, minutes, seconds] = timeString.split(':');
        today.setHours(hours, minutes, seconds);
        return today.toLocaleTimeString();
      }
      
      // Fallback to original string if format is unknown
      return timeString;
    } catch (e) {
      console.error("Error formatting date:", e);
      return timeString;
    }
  };

  const fetchMessageDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
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

        // Handle time_send - it might be just time (HH:MM:SS) or full datetime
        let datetime;
        let date = '';
        let time = '';
        
        if (messageData.time_send) {
          // If it's just time (HH:MM:SS)
          if (/^\d{2}:\d{2}:\d{2}$/.test(messageData.time_send)) {
            const today = new Date();
            const [hours, minutes] = messageData.time_send.split(':');
            today.setHours(hours, minutes);
            date = today.toISOString().split('T')[0];
            time = `${hours}:${minutes}`;
          } 
          // If it's a full datetime string
          else if (!isNaN(new Date(messageData.time_send).getTime())) {
            datetime = new Date(messageData.time_send);
            date = datetime.toISOString().split('T')[0];
            time = datetime.toTimeString().substring(0, 5);
          }
        }

        // Fallback to current date/time if not set
        if (!date || !time) {
          datetime = new Date();
          date = datetime.toISOString().split('T')[0];
          time = datetime.toTimeString().substring(0, 5);
        }

        setEditForm({
          to_number: messageData.to_number || "",
          message: messageData.message || "",
          date_send: date,
          time_send: time,
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching message details:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Combine date and time
      const datetime = `${editForm.date_send}T${editForm.time_send}:00`;

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
            time_send: datetime,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update message");
      }

      fetchMessages(currentPage);
      setEditMode(false);
      setSelectedMessage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    try {
      setLoading(true);
      setError(null);

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
        throw new Error("Failed to delete message");
      }

      fetchMessages(currentPage);
      setSelectedMessage(null);
    } catch (err) {
      setError(err.message);
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

  if (loading && messages.length === 0)
    return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="message-list-container">
      <h2 className="page-title">Scheduled Messages</h2>

      {selectedMessage ? (
        editMode ? (
          <div className="edit-form">
            <h3>Edit Message</h3>

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
              <label>Message Content</label>
              <textarea
                name="message"
                value={editForm.message}
                onChange={handleEditChange}
                placeholder="Type your message"
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
                <label>Time</label>
                <input
                  type="time"
                  name="time_send"
                  value={editForm.time_send}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

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
              <h3>Message Details</h3>
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
                <span className="detail-label">Message:</span>
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
                  <th>Message</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.length > 0 ? (
                  messages.map((message) => (
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
                      <td>
                        {formatDateTime(message.time_send)}
                      </td>
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
                        <button
                          className="view-btn"
                          onClick={() => fetchMessageDetails(message.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-messages">
                      No scheduled messages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageList;