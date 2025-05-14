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
  const { token } = useAuth();
  const navigate = useNavigate();

  // Agreement process states
  const [currentStep, setCurrentStep] = useState(0); // 0 = list view, 1 = company info
  const [companyData, setCompanyData] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [groupDataLoading, setGroupDataLoading] = useState(false);

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

  const handleViewDetails = (contractId) => {
    navigate(`/client/contract-docx`, { state: { contractId } });
  };

  const startAgreementProcess = async (contractId, groupId) => {
    setSelectedContractId(contractId);
    setCurrentStep(1);
    setCompanyData(null);
    fetchCompanyData(groupId);
  };

  const fetchCompanyData = async (groupId) => {
    try {
      setGroupDataLoading(true);
      const response = await fetch(`${config.BASE_URL}/api/company/info/${groupId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch company data");
      const result = await response.json();
      setCompanyData(result.data);
      setGroupDataLoading(false);
    } catch (err) {
      setGroupDataLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
      setCurrentStep(0);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Skip Step 2 and go directly to document upload/view page
      navigate(`/client/contract-docx`, { state: { contractId: selectedContractId } });
    }
  };

  const handleBackStep = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <h1>Agreement List</h1>
            <div className="table-responsive">
              {contracts.length === 0 ? (
                <div className="no-data-message text-center">No Agreement found.</div>
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
                    {contracts.map((contract, index) => (
                      <tr key={index} className="contract-table-row">
                        <td className="contract-table-cell">{contract.contracted_provider}</td>
                        <td className="contract-table-cell">{contract.contracted_rate}</td>
                        <td className="contract-table-cell">{contract.closure_date}</td>
                        <td className="contract-table-cell">
                          <button className={`w-100 status-button status-${contract.status.toLowerCase()}`}>
                            {contract.status}
                          </button>
                        </td>
                        <td className="contract-table-cell">
                          <HiDotsHorizontal
                            size={30}
                            onClick={() => toggleDropdown(index)}
                            className="cursor-pointer"
                          />
                          {contract.status === "pending" && activeDropdown === index && (
                            <div className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0" style={{ marginLeft: "-130px" }}>
                              <a
                                className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                                onClick={() => {
                                  startAgreementProcess(contract.id, contract.group_id);
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
            </div>
          </>
        );

      case 1:
        return (
          <div className="step-container">
            <div className="step-header">
              <h2>Agreement Process</h2>
              <h3>Company Information</h3>
            </div>
            {groupDataLoading ? (
              <div className="loader-container">
                <div className="custom-loader"></div>
              </div>
            ) : (
              companyData && (
                <div className="company-info">
                  <div className="company-logo-container">
                    {companyData.company_logo && (
                      <img 
                        src={`${config.BASE_URL}/storage/${companyData.company_logo}`} 
                        alt="Company Logo" 
                        className="company-logo"
                      />
                    )}
                  </div>
                  <div className="company-details">
                    <p><strong>Name:</strong> {companyData.company_name}</p>
                    <p><strong>Email:</strong> {companyData.company_email}</p>
                    <p><strong>Phone:</strong> {companyData.company_phone}</p>
                    <p><strong>Address:</strong> {companyData.company_address}</p>
                    <p><strong>City:</strong> {companyData.company_city}</p>
                    <p><strong>State:</strong> {companyData.company_state}</p>
                    <p><strong>Zip:</strong> {companyData.company_zip}</p>
                    <p><strong>Country:</strong> {companyData.company_country}</p>
                  </div>
                </div>
              )
            )}
            <div className="step-actions">
              <button onClick={handleBackStep} className="back-button">Back to List</button>
              <button
                onClick={handleNextStep}
                className="next-button"
                disabled={groupDataLoading}
              >
                Proceed to Document
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div class="spinner-border" role="status" style={{ color: "#3598db" }}>
          <span class="visually-hidden">Loading...</span>
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