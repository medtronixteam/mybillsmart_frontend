import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./SessionHistory.css";
import config from "../../config";

const SessionHistory = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [displayedSessions, setDisplayedSessions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [currentSessionPage, setCurrentSessionPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [showSessions, setShowSessions] = useState(false); // Toggle between views
  const pageSize = 10;

  // Fetch users list
  const fetchUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const response = await fetch(
        `${config.BASE_URL}/api/group/users/list?page=${page}&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUsers(data.data || []);
        setTotalUsers(data.data?.length || 0);
      } else {
        alert(data.message || "Failed to fetch users");
      }
    } catch (error) {
      alert("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch session history for a user
  const fetchSessionHistory = async (userId, userName) => {
    try {
      setLoadingSessions(true);
      setSelectedUserId(userId);
      setSelectedUserName(userName);

      const response = await fetch(
        `${config.BASE_URL}/api/group/session/history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAllSessions(data.sessions || []);
        setTotalSessions(data.sessions?.length || 0);
        updateDisplayedSessions(1, data.sessions || []);
        setShowSessions(true); // Switch to sessions view
      } else {
        alert(data.message || "Failed to fetch session history");
      }
    } catch (error) {
      alert("Error fetching session history");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Update displayed sessions based on pagination
  const updateDisplayedSessions = (page, sessions = allSessions) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedSessions(sessions.slice(startIndex, endIndex));
    setCurrentSessionPage(page);
  };

  // Go back to users list
  const handleBackToUsers = () => {
    setShowSessions(false);
    setSelectedUserId(null);
  };

  useEffect(() => {
    if (!showSessions) {
      fetchUsers();
    }
  }, [showSessions, currentUserPage]);

  return (
    <div className="session-history-container">
      <h2>User Session History</h2>

      {!showSessions ? (
        <div className="users-section">
          <h3>Users List</h3>
          {loadingUsers ? (
            <div
              class="spinner-border"
              role="status"
              style={{ color: "#3598db" }}
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Country</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.status === 1 ? "Active" : "Inactive"}</td>
                      <td>{user.country}</td>
                      <td>
                        <button
                          className="view-sessions-btn"
                          onClick={() =>
                            fetchSessionHistory(user.id, user.name)
                          }
                        >
                          View Sessions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  disabled={currentUserPage === 1}
                  onClick={() => {
                    const newPage = currentUserPage - 1;
                    setCurrentUserPage(newPage);
                  }}
                >
                  &lt;
                </button>
                <span>
                  Page {currentUserPage} of {Math.ceil(totalUsers / pageSize)}
                </span>
                <button
                  disabled={currentUserPage * pageSize >= totalUsers}
                  onClick={() => {
                    const newPage = currentUserPage + 1;
                    setCurrentUserPage(newPage);
                  }}
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="sessions-section">
          <div className="sessions-header">
            <button onClick={handleBackToUsers} className="back-button">
              &larr; Back to Users
            </button>
            <h3>Session History for: {selectedUserName}</h3>
          </div>

          {loadingSessions ? (
            <div
              class="spinner-border"
              role="status"
              style={{ color: "#3598db" }}
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              {allSessions.length > 0 ? (
                <>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                        <th>IP Address</th>
                        <th>Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSessions.map((session) => (
                        <tr key={session.session_id}>
                          <td>{session.session_id}</td>
                          <td>
                            {new Date(session.login_time).toLocaleString()}
                          </td>
                          <td>
                            {session.logout_time
                              ? new Date(session.logout_time).toLocaleString()
                              : "Still active"}
                          </td>
                          <td>{session.ip_address}</td>
                          <td>{session.device_info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button
                      disabled={currentSessionPage === 1}
                      onClick={() =>
                        updateDisplayedSessions(currentSessionPage - 1)
                      }
                    >
                      &lt;
                    </button>
                    <span>
                      Page {currentSessionPage} of{" "}
                      {Math.ceil(allSessions.length / pageSize)}
                    </span>
                    <button
                      disabled={
                        currentSessionPage * pageSize >= allSessions.length
                      }
                      onClick={() =>
                        updateDisplayedSessions(currentSessionPage + 1)
                      }
                    >
                      &gt;
                    </button>
                  </div>
                  <div className="session-count">
                    Showing {displayedSessions.length} of {allSessions.length}{" "}
                    sessions
                  </div>
                </>
              ) : (
                <div className="no-sessions">
                  No session history found for this user
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
