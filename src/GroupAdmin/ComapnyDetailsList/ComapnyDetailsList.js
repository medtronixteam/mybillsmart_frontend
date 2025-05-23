import React, { useState, useEffect } from 'react';
import "./ComapnyDetailsList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const CompanyDetailsList = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);   
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.BASE_URL}/api/group/company/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
          }

        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }

        const result = await response.json();
        
        if (result.status === "success" && result.data) {
          setCompanyDetails(result.data);
        } else {
          throw new Error(result.message || 'No company details found');
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading company details...</p>
      </div>
    );
  }

  if (!companyDetails) {
    return <div className="no-data">No company details available</div>;
  }

  return (
    <div className="company-details-container">
      <h2>Company Details</h2>
      
      <div className="details-card">
        <div className="detail-row">
          <span className="detail-label">Company Name:</span>
          <span className="detail-value">{companyDetails.company_name || 'N/A'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{companyDetails.company_email || 'N/A'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{companyDetails.company_phone || 'N/A'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Address:</span>
          <span className="detail-value">
            {[
              companyDetails.company_address,
              companyDetails.company_city,
              companyDetails.company_state,
              companyDetails.company_zip,
              companyDetails.company_country
            ].filter(Boolean).join(', ') || 'N/A'}
          </span>
        </div>
        
        {companyDetails.company_logo && (
          <div className="detail-row">
            <span className="detail-label">Company Logo:</span>
            <span className="detail-value">
              <img 
                src={`${config.BASE_URL}/${companyDetails.company_logo}`} 
                alt="Company Logo" 
                className="company-logo"
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailsList;