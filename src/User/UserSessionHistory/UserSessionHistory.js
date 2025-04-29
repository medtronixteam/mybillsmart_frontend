import React, { useState, useEffect } from "react";
import { FaHistory, FaSync } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";

const UserSessionHistory = () => {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage] = useState(5);
  const { token } = useAuth();

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.BASE_URL}/api/session/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch session history");
      }

      const result = await response.json();
      setSessionHistory(result.message || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionHistory();
  }, [token]);

  // Get current sessions for pagination
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessionHistory.slice(
    indexOfFirstSession,
    indexOfLastSession
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-3">
      <Breadcrumbs homePath={"/user/dashboard"} />
      <div className="card h-100 mt-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <FaHistory className="me-2" />
            Session History
          </h5>
          <button
            onClick={fetchSessionHistory}
            className="btn btn-sm btn-primary"
            disabled={loading}
          >
            <FaSync className={loading ? "fa-spin" : ""} />
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-1">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : sessionHistory.length === 0 ? (
            <div className="alert alert-info">No session history available</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Device</th>
                      <th>Platform</th>
                      <th>Browser</th>
                      <th>Logged In At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSessions.map((session, index) => (
                      <tr key={index}>
                        <td>{session.ip_address || "N/A"}</td>
                        <td>{session.device || "N/A"}</td>
                        <td>{session.platform || "N/A"}</td>
                        <td>{session.browser || "N/A"}</td>
                        <td>
                          {new Date(session.logged_in_at).toLocaleString() ||
                            "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <nav>
                <ul className="pagination justify-content-end">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({
                    length: Math.ceil(sessionHistory.length / sessionsPerPage),
                  }).map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage ===
                      Math.ceil(sessionHistory.length / sessionsPerPage)
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(sessionHistory.length / sessionsPerPage)
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSessionHistory;
