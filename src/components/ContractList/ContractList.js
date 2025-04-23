import React, { useEffect, useState } from "react";
import "./ContractList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [documents, setDocuments] = useState([]); // New state for documents
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false); // For document API loading
  const [error, setError] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null); // Track which contract's docs are shown
  const { token } = useAuth();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/agent/contracts/list `, {
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

  // Function to fetch documents for a contract
  const fetchDocuments = async (contractId) => {
    setDocumentsLoading(true);
    setSelectedContractId(contractId);
    try {
      const response = await fetch(
        `${config.BASE_URL}/api/agent/documents/${contractId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch documents");
      const result = await response.json();
      setDocuments(result.data || []);
    } catch (err) {
      setError(err.message);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Function to go back to contracts list
  const handleBackToList = () => {
    setSelectedContractId(null);
    setDocuments([]);
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="custom-loader"></div>
      </div>
    );

  if (error) return <div>Error: {error}</div>;

  // Show documents view if a contract is selected
  if (selectedContractId) {
    return (
      <div className="document-view-container">
        <button onClick={handleBackToList} className="back-button">
          &larr; Back to Agreements
        </button>
        <h2>Documents for Agreement #{selectedContractId}</h2>

        {documentsLoading ? (
          <div className="loader-container">
            <div className="custom-loader"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="no-data-message">
            No documents uploaded for this agreement yet.
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((doc, index) => (
              <div key={index} className="document-card">
                {doc.type === "image" ? (
                  <img
                    src={doc.url}
                    alt={`Document ${index + 1}`}
                    className="document-image"
                  />
                ) : (
                  <div className="document-file">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
                  </div>
                )}
                <div className="document-meta">
                  <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Original contracts list view
  return (
    <div className="contract-list-container">
      <h1>Agreement List</h1>
      <div className="table-responsive">
        {contracts.length === 0 ? (
          <div className="no-data-message text-center">
            No agreements found.
          </div>
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
                      onClick={() => fetchDocuments(contract.id)}
                      className="view-document-button"
                    >
                      View Documents
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