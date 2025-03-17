import React, { useEffect, useState } from "react";
import "./ContractList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";


const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/contracts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setContracts(result.data || []); // Use result.data instead of result.contracts
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContracts();
  }, [token]);

  if (loading)
    return (
      <div className="loader-container">
        <div className="custom-loader"></div>
      </div>
    );

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contract-list-container">
      <h1>Contract List</h1>
  
      <div className="table-responsive">
        {contracts.length === 0 ? (
          <div className="no-data-message text-center">No contracts found.</div>
        ) : (
          <table className="contract-table">
            <thead>
              <tr>
                <th className="contract-table-header">Client ID</th>
                <th className="contract-table-header">Contracted Provider</th>
                <th className="contract-table-header">Contracted Rate</th>
                <th className="contract-table-header">Closure Date</th>
                <th className="contract-table-header">Status</th>
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
                  <td className="contract-table-cell">{contract.closure_date}</td>
                  <td className="contract-table-cell">
                    <button
                      className={`w-100 status-button status-${contract.status.toLowerCase()}`}
                    >
                      {contract.status}
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

export default ContractList;