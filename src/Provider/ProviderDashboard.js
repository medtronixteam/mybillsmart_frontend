import React, { useState, useEffect } from "react";
import { FaUsers, FaFileAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const ProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://34.142.252.64:8080/api/supervisor/data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <div 
            className="spinner-border" 
            style={{ 
              width: '3rem', 
              height: '3rem', 
              color: '#3598db' 
            }} 
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
    <div>
      <div className="container-fluid py-4 mx-auto">
        <div className="row">
          {/* Total Users Card */}
          <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div className="card bg-white">
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
                  id="dashboard-icon">
                  <FaUsers className="text-white text-lg opacity-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Rejected Contracts Card */}
          <div className="col-xl-3 col-sm-6">
            <div className="card bg-white">
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
                  id="dashboard-icon">
                  <FaTimesCircle className="text-white text-lg opacity-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;