import React, { useEffect, useState } from "react";
import "./AdminContractList.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";

const AdminContractList = () => {
  const [contracts, setContracts] = useState([]); // Default to an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(
          `${config.BASE_URL}/api/group/contracts/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
          }
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setContracts(data);
        } else {
          setContracts([]); // Set to empty array if data is not an array
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContracts();
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        {" "}
        <div class="spinner-border" role="status" style={{ color: "#3598db" }}>
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="contract-list-container mx-0">
      <Breadcrumbs homePath={"/group_admin/dashboard"} />
      <h1>Agreement List</h1>
      <div className="table-responsive">
        {contracts.length === 0 ? (
          <div className="no-contracts-message">
            <p className="text-center">No agreements list available.</p>
          </div>
        ) : (
          <table className="contract-table">
            <thead>
              <tr>
                <th className="contract-table-header">Client Name</th>
                <th className="contract-table-header">Agreemented Provider</th>
                <th className="contract-table-header">Agreemented Rate</th>
                <th className="contract-table-header">Closure Date</th>
                <th className="contract-table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract, index) => (
                <tr key={index} className="contract-table-row">
                  <td className="contract-table-cell">{contract.clientName}</td>
                  <td className="contract-table-cell">
                    {contract.contractedProvider}
                  </td>
                  <td className="contract-table-cell">
                    {contract.contractedRate}
                  </td>
                  <td className="contract-table-cell">
                    {contract.closureDate}
                  </td>
                  <td className="contract-table-cell">
                    <Link
                      className={`d-block text-center status-button status-${contract.status.toLowerCase()}`}
                      to={`/client/contract-docx`}
                    >
                      {contract.status}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminContractList;
