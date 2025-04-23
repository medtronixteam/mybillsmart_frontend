import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClientContractList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const ClientContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/client/contracts/list`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setContracts(result.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContracts();
  }, [token]);

  // Function to handle view details click
  const handleViewDetails = (contractId) => {
    navigate(`/client/contract-docx`, { state: { contractId } });
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="custom-loader"></div>
      </div>
    );

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contract-list-container">
      <h1>Agreement List</h1>
      <div className="table-responsive">
        {contracts.length === 0 ? (
          <div className="no-data-message text-center">No Agreement found.</div>
        ) : (
          <table className="contract-table">
            <thead>
              <tr>
                <th className="contract-table-header">Client ID</th>
                <th className="contract-table-header">Agreemented Provider</th>
                <th className="contract-table-header">Agreemented Rate</th>
                <th className="contract-table-header">Closure Date</th>
                <th className="contract-table-header">Status</th>
                <th className="contract-table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract, index) => (
                <tr key={index} className="contract-table-row">
                  <td className="contract-table-cell">{contract.client_id}</td>
                  <td className="contract-table-cell">
                    {contract.contracted_provider}
                  </td>
                  <td className="contract-table-cell">
                    {contract.contracted_rate}
                  </td>
                  <td className="contract-table-cell">
                    {contract.closure_date}
                  </td>
                  <td className="contract-table-cell">
                    <button
                      className={`w-100 status-button status-${contract.status.toLowerCase()}`}
                    >
                      {contract.status}
                    </button>
                  </td>
                  <td className="contract-table-cell">
                    <button
                      onClick={() => handleViewDetails(contract.id)}
                      className="view-document-button"
                    >
                      View Details
                    </button>
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

export default ClientContractList;