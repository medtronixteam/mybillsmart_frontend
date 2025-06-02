import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClientContractList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";

const ClientContractList = () => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 New state for search term
  const { token } = useAuth();
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

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

  // 🔍 Apply search filter on all contracts
  const filteredContracts = contracts.filter((contract) =>
    contract.contracted_provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contracted_rate?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.closure_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 Pagination logic based on filtered results
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleViewDetails = (contractId) => {
    navigate(`/client/contract-docx`, { state: { contractId } });
  };

  const renderStepContent = () => {
    return (
      <>
        <h1 className="text-center">Agreement List</h1>
        <div className="d-flex justify-content-start align-items-center">
          {/* 🔍 Search Input */}
          <input
            type="text"
            placeholder="Search by Provider, Rate, Date or Status"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page after typing
            }}
            className="form-control w-50"
          />
        </div>
        <div className="table-responsive">
          {filteredContracts.length === 0 ? (
            <div className="no-data-message text-center">
              No matching agreements found.
            </div>
          ) : (
            <table className="contract-table">
              <thead>
                <tr>
                  <th className="contract-table-header">Provider</th>
                  <th className="contract-table-header">Rate</th>
                  <th className="contract-table-header">Closure Date</th>
                  <th className="contract-table-header">Status</th>
                  <th className="contract-table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentContracts.map((contract, index) => (
                  <tr key={index} className="contract-table-row">
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
                      <HiDotsHorizontal
                        size={30}
                        onClick={() => toggleDropdown(index)}
                        className="cursor-pointer"
                      />
                      {contract.status === "pending" &&
                        activeDropdown === index && (
                          <div
                            className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                            style={{ marginLeft: "-130px" }}
                          >
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                handleViewDetails(contract.id);
                                setActiveDropdown(false);
                              }}
                            >
                              Upload Document
                            </a>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination UI */}
          {totalPages > 0 && (
            <div className="pagination justify-content-center mt-3">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline-primary me-2"
              >
                Previous
              </button>
              <span className="page-info me-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-outline-primary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  if (loading)
    return (
      <div className="loader-container">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "#3598db" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contract-list-container">
      {renderStepContent()}
    </div>
  );
};

export default ClientContractList;