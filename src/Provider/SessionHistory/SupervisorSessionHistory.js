import React, { useState, useEffect } from "react";
import { FaHistory, FaSync } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const SupervisorSessionHistory = () => {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage] = useState(5);
  const { token } = useAuth();

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#3085d6",
    });
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      confirmButtonColor: "#3085d6",
      timer: 1500,
    });
  };

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
      showSuccessAlert("Session history refreshed successfully");
    } catch (err) {
      setError(err.message);
      showErrorAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Swal.fire({
        title: "Loading Session History",
        html: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await fetchSessionHistory();
        Swal.close();
      } catch (err) {
        Swal.close();
        showErrorAlert(err.message);
      }
    };

    loadData();
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

  const confirmRefresh = async () => {
    const result = await Swal.fire({
      title: "Refresh Session History?",
      text: "Are you sure you want to refresh the session history?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, refresh it!",
    });

    if (result.isConfirmed) {
      await fetchSessionHistory();
    }
  };

  return (
    <div className="container mt-3">
      <Breadcrumbs homePath={"/supervisor/dashboard"} />
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Session History</h5>
          <button
            onClick={confirmRefresh}
            className="btn btn-sm btn-primary"
            disabled={loading}
          >
            {loading ? <FaSync className="fa-spin" /> : "Refresh"}
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
                        <td>{session.logged_in_at || "N/A"}</td>
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

export default SupervisorSessionHistory;
