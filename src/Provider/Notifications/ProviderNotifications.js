import React, { useState, useEffect } from "react";
import axios from "axios";
// import "./GroupAdminNotifications.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";

const ProviderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);
  const { token } = useAuth();

  const api = axios.create({
    baseURL: `${config.BASE_URL}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications");
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

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notification/read/${id}`);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <Breadcrumbs homePath={"/group_admin/dashboard"} />
      <h2 className="text-center">Notifications</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: "#3598db" }}>
            {/* <span className="visually-hidd`en">Loading...</span> */}
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchNotifications}>
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-bell-slash fs-1 text-muted mb-3"></i>
            <h5>No notifications yet</h5>
            <p className="text-muted">
              You'll see notifications here when they become available
            </p>
            <button className="btn btn-outline-primary mt-2" onClick={fetchNotifications}>
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {currentNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`list-group-item ${notification.read ? "" : "unread-notification"}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div>
                      <h6 className="mb-1">{notification.title || "Notification"}</h6>
                      <p className="mb-1">{notification.message}</p>
                      {notification.timestamp && (
                        <small className="text-muted">
                          {new Date(notification.timestamp).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pagination with icons and single page number */}
          {notifications.length > notificationsPerPage && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {/* Show only current page number */}
                <li className="page-item active">
                  <button className="page-link">
                    {currentPage}
                  </button>
                </li>

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
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

export default ProviderNotifications;