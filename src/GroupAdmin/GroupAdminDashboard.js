import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCoins,
  FaFileInvoiceDollar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import config from "../config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Breadcrumbs from "../Breadcrumbs";
import { Navigate } from "react-router-dom";
import axios from "axios";

const GroupAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(5);
  const { token } = useAuth();
  const [planInfo, setPlanInfo] = useState(null);
  const [loadingPlanInfo, setLoadingPlanInfo] = useState(true);
  const [showPlanError, setShowPlanError] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${config.BASE_URL}/api/group/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          Navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/api/plan/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPlanInfo(response.data);
        setShowPlanError(false);
      } catch (error) {
        console.error("Error fetching plan info:", error);

        setPlanInfo({
          status: error.response?.status || "error",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch plan information",
          code: error.code || null,
        });
        setShowPlanError(true);
      } finally {
        setLoadingPlanInfo(false);
      }
    };

    if (token) {
      fetchPlanInfo();
    }
  }, [token]);

  const chartData = [
    {
      name: "Users",
      "Total Users": dashboardData?.total_users || 0,
      "Active Users": dashboardData?.active_users || 0,
    },
    {
      name: "Contracts",
      "Pending Contracts": dashboardData?.pending_contracts || 0,
      "Completed Contracts": dashboardData?.completed_contracts || 0,
      "Rejected Contracts": dashboardData?.rejected_contracts || 0,
    },
  ];

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices =
    dashboardData?.latest_invoices?.slice(
      indexOfFirstInvoice,
      indexOfLastInvoice
    ) || [];
  const totalPages = Math.ceil(
    (dashboardData?.latest_invoices?.length || 0) / invoicesPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "#3598db" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      
      {showPlanError && (
       <div className="alert alert-primary text-center " role="alert">
             {planInfo?.message || "Unknown error occurred"}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowPlanError(false)}
                aria-label="Close"
              ></button>
            </div>
      )}

      {/* Stats Cards Row */}
      <div className="row">
        <div className="col-12 mb-3">
          <Breadcrumbs homePath={"/group_admin/dashboard"} />
        </div>
        {/* Total Users Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Total Users
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.total_users || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#3498db" }}
              >
                <FaUsers className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Contracts Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Pending Agreements
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.pending_contracts || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#f39c12" }}
              >
                <FaFileAlt className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Completed Contracts Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Completed Agreements
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.completed_contracts || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#2ecc71" }}
              >
                <FaCheckCircle className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Contracts Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Rejected Agreements
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.rejected_contracts || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#e74c3c" }}
              >
                <FaTimesCircle className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your existing dashboard content... */}
      {/* (Keep all the other parts of your dashboard as they were) */}

      {/* Second Row of Cards */}
      <div className="row mt-4">
        {/* Total Invoices Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Total Invoices
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.total_invoices || 0}
                </h5>
              </div>
              <div
                className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#9b59b6" }}
              >
                <FaFileInvoiceDollar className="text-white text-lg opacity-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Invoices Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header"></div>
            <div className="card-body">
              <h5 className="card-title mb-2">Latest Invoices</h5>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th>Bill Type</th>
                      <th>Address</th>
                      <th>CUPS</th>
                      <th>Total Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.length > 0 ? (
                      currentInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.bill_type}</td>
                          <td>{invoice.address}</td>
                          <td>{invoice.CUPS}</td>
                          <td>{invoice.bill_info?.["total bill"] || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {dashboardData?.latest_invoices?.length > invoicesPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {indexOfFirstInvoice + 1} to{" "}
                    {Math.min(
                      indexOfLastInvoice,
                      dashboardData.latest_invoices.length
                    )}{" "}
                    of {dashboardData.latest_invoices.length} entries
                  </div>
                  <nav>
                    <ul className="pagination">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link text-white"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <FaChevronLeft />
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <li
                            key={number}
                            className={`page-item ${
                              currentPage === number ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link text-white"
                              onClick={() => paginate(number)}
                            >
                              {number}
                            </button>
                          </li>
                        )
                      )}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link text-white"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <FaChevronRight />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Comprehensive Bar Chart */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Dashboard Overview</h5>
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
                  <Tooltip
                    formatter={(value) => [value, ""]}
                    labelFormatter={(label) => <strong>{label}</strong>}
                  />
                  <Legend />
                  <Bar
                    dataKey="Total Users"
                    fill="#3498db"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Active Users"
                    fill="#2ecc71"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Pending Contracts"
                    fill="#f39c12"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Completed Contracts"
                    fill="#27ae60"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Rejected Contracts"
                    fill="#e74c3c"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Total Invoices"
                    fill="#9b59b6"
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

export default GroupAdminDashboard;