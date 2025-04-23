import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaCoins,
  FaHistory,
  FaChartBar,
  FaFileContract
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_contracts: 0,
    total_documents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Session history states
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [currentSessionPage, setCurrentSessionPage] = useState(1);
  const [sessionsPerPage] = useState(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://bill.medtronix.world/api/client/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData({
          ...data.data,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchSessionHistory(); // Fetch session history on initial load
  }, [token]);

  const fetchSessionHistory = async () => {
    try {
      setSessionLoading(true);
      setSessionError(null);
      const response = await fetch(
        "https://bill.medtronix.world/api/session/history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session history");
      }

      const result = await response.json();
      setSessionHistory(result.message || []);
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSessionLoading(false);
    }
  };

  // Prepare data for the chart
  const chartData = [
    {
      name: "Contracts",
      "Total Contracts": dashboardData?.total_contracts || 0,
    },
    {
      name: "Documents",
      "Total Documents": dashboardData?.total_documents || 0,
    }
  ];

  // Get current sessions for pagination
  const indexOfLastSession = currentSessionPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessionHistory.slice(indexOfFirstSession, indexOfLastSession);

  // Change page for session history
  const paginateSessions = (pageNumber) => setCurrentSessionPage(pageNumber);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="text-center">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#3598db" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-5 text-danger">Error: {error}</div>;
  }

  return (
    <div className="container-fluid py-4">
      {/* Stats Cards Row */}
      <div className="row">
        {/* Total Contracts Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Total Agreements
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.total_contracts || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#3498db" }}
              >
                <FaFileContract className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Documents Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Total Documents
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.total_documents || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#2ecc71" }}
              >
                <FaFileAlt className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Session History Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Session History
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {sessionHistory.length || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#34495e" }}
              >
                <FaHistory className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Referral Points Card */}
        {/* <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Referral Points
                </p>
                <h5 className="font-weight-bolder mb-0">0</h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#e74c3c" }}
              >
                <FaCoins className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Session History Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Session History</h5>
              <button
                onClick={fetchSessionHistory}
                className="btn btn-sm btn-primary"
                disabled={sessionLoading}
              >
                {sessionLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="card-body">
              {sessionLoading ? (
                <div className="text-center py-1">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : sessionError ? (
                <div className="alert alert-danger">{sessionError}</div>
              ) : sessionHistory.length === 0 ? (
                <div className="alert alert-info">
                  No session history available
                </div>
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
                          currentSessionPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            paginateSessions(currentSessionPage - 1)
                          }
                          disabled={currentSessionPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({
                        length: Math.ceil(
                          sessionHistory.length / sessionsPerPage
                        ),
                      }).map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${
                            currentSessionPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => paginateSessions(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          currentSessionPage ===
                          Math.ceil(sessionHistory.length / sessionsPerPage)
                            ? "disabled"
                            : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            paginateSessions(currentSessionPage + 1)
                          }
                          disabled={
                            currentSessionPage ===
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
      </div>

      {/* Bar Chart Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Dashboard Statistics</h5>
            </div>
            <div className="card-body" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Total Contracts"
                    fill="#3498db"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Total Documents"
                    fill="#2ecc71"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;