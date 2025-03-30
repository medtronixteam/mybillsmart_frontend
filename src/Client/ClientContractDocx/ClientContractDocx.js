import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import "./ClientContractDocx.css";

const ClientContractDocx = () => {
  const { state } = useLocation();
  const { token } = useAuth();
  const contractId = state?.contractId;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    date_of_birth: "",
    differentiation: "Individual",
    expiration_date: ""
  });

  const [files, setFiles] = useState({
    cnic_front: null,
    cnic_back: null,
    bank_receipt: null,
    last_service_invoice: null,
    lease_agreement: null,
    bank_account_certificate: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { id, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [id]: fileList[0] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataObj = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formDataObj.append(key, file);
        }
      });
      
      if (contractId) {
        formDataObj.append("contract_id", contractId);
      }

      const response = await fetch(`${config.BASE_URL}/api/client/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit documents");
      }

      setSuccess(true);
      setFormData({
        name: "",
        phone: "",
        address: "",
        date_of_birth: "",
        differentiation: "Individual",
        expiration_date: ""
      });
      setFiles({
        cnic_front: null,
        cnic_back: null,
        bank_receipt: null,
        last_service_invoice: null,
        lease_agreement: null,
        bank_account_certificate: null
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-contract-docx-container container">
      <h1>Client Contract Documents</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Documents uploaded successfully!</div>}
      
      <form className="row" onSubmit={handleSubmit}>
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="number"
            className="form-control"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="col-12 mb-3">
          <label className="form-label m-0" htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            className="form-control"
            placeholder="Enter complete address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="date_of_birth">Date of Birth</label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            className="form-control"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="expiration_date">Expiration Date</label>
          <input
            id="expiration_date"
            name="expiration_date"
            type="date"
            className="form-control"
            value={formData.expiration_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="cnic_front">ID Card/NIE (Front)</label>
          <input
            id="cnic_front"
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="cnic_back">ID Card/NIE (Back)</label>
          <input
            id="cnic_back"
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="differentiation">Individual and Company</label>
          <select 
            className="form-select"
            id="differentiation"
            name="differentiation"
            value={formData.differentiation}
            onChange={handleInputChange}
            required
          >
            <option value="Individual">Individual</option>
            <option value="Company">Company</option>
          </select>
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="bank_receipt">Bank Receipt</label>
          <input
            id="bank_receipt"
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="last_service_invoice">Last Service Invoice</label>
          <input
            id="last_service_invoice"
            type="file"
            accept="image/*,.pdf"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="lease_agreement">Lease Agreement (if applicable)</label>
          <input
            id="lease_agreement"
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="col-lg-6 mb-3">
          <label className="form-label m-0" htmlFor="bank_account_certificate">Bank Account Ownership Certificate</label>
          <input
            id="bank_account_certificate"
            type="file"
            accept="image/*,.pdf"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="col-12 mt-2 mb-4">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientContractDocx;