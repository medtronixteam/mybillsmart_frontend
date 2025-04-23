import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaFileAlt,
  FaHistory,
  FaCoins,
  FaChartBar
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
  ResponsiveContainer
} from "recharts";

const ProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try { 
        setLoading(true);
        const response = await fetch(
          `${config.BASE_URL}/api/supervisor/dashboard/stats`,
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
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Prepare data for the chart
  const chartData = [
    {
      name: "Users",
      "Total Users": dashboardData?.total_users || 0,
    },
    {
      name: "Products",
      "Total Products": dashboardData?.total_products || 0,
    }
  ];

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

        {/* Total Products Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <div className="card bg-white h-100">
            <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
              <div className="numbers text-center">
                <p className="text-sm mb-0 text-capitalize font-weight-bold">
                  Total Products
                </p>
                <h5 className="font-weight-bolder mb-0">
                  {dashboardData?.total_products || 0}
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

       

        {/* Referral Points Card */}
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
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
                style={{ backgroundColor: "#1abc9c" }}
              >
                <FaCoins className="text-white text-lg opacity-10" />
              </div>
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
                    dataKey="Total Users"
                    fill="#3498db"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Total Products"
                    fill="#f39c12"
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

export default ProviderDashboard;