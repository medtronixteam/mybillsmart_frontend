import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AgentNotifications.css";
import { useAuth } from "../../contexts/AuthContext";

const AgentNotifications = () => {
  const [notificationDetail, setNotificationDetail] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const api = axios.create({
    baseURL: "https://bill.medtronix.world",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications");
      // Access the notifications array from response data
      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationDetails = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/notification/${id}`);
      setSelectedNotification(response.data);
      setNotificationDetail(true);

      await api.put(`/api/notification/read/${id}`);
    } catch (err) {
      setError("Failed to fetch notification details");
      console.error("Error fetching notification details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Notifications</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchNotifications}
          >
            Retry
          </button>
        </div>
      ) : notificationDetail ? (
        <div className="card">
          <div className="card-body">
            <button
              className="btn btn-sm btn-outline-secondary mb-3"
              onClick={() => setNotificationDetail(false)}
            >
              ← Back to notifications
            </button>
            <h3>{selectedNotification?.title || "Notification Details"}</h3>
            <div className="card-text">
              <p>{selectedNotification?.message || "No details available"}</p>
              {selectedNotification?.timestamp && (
                <small className="text-muted">
                  {new Date(selectedNotification.timestamp).toLocaleString()}
                </small>
              )}
            </div>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-bell-slash fs-1 text-muted mb-3"></i>
            <h5>No notifications yet</h5>
            <p className="text-muted">
              You'll see notifications here when they become available
            </p>
            <button
              className="btn btn-outline-primary mt-2"
              onClick={fetchNotifications}
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <ul className="list-group list-group-flush">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`list-group-item ${
                    notification.read ? "" : "unread-notification"
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        {notification.title || "Notification"}
                      </h6>
                      <p className="mb-1 text-muted">
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </p>
                      {notification.timestamp && (
                        <small className="text-muted">
                          {new Date(notification.timestamp).toLocaleString()}
                        </small>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => fetchNotificationDetails(notification.id)}
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentNotifications;
