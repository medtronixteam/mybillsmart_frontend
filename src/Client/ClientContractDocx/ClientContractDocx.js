import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Swal from "sweetalert2";
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

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#3598db',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#3598db',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      // Append files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formDataObj.append(key, file);
        }
      });
      
      // Append contract ID if exists
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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit documents");
      }

      // Show success message
      showSuccessAlert(responseData.message || 'Documents uploaded successfully!');

      // Reset form
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
      // Show error message
      showErrorAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-contract-docx-container container">
      <h1 className="mb-4">Client Agreement Documents</h1>

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Please Enter Full Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="Please Enter Phone Number"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-12">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            id="address"
            placeholder="Please Enter Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
          <input
            type="date"
            className="form-control"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="expiration_date" className="form-label">Expiration Date</label>
          <input
            type="date"
            className="form-control"
            id="expiration_date"
            name="expiration_date"
            value={formData.expiration_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="differentiation" className="form-label">Individual/Company</label>
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

        <div className="col-md-6">
          <label htmlFor="cnic_front" className="form-label">ID Card Front</label>
          <input
            type="file"
            className="form-control"
            id="cnic_front"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="cnic_back" className="form-label">ID Card Back</label>
          <input
            type="file"
            className="form-control"
            id="cnic_back"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="bank_receipt" className="form-label">Bank Receipt</label>
          <input
            type="file"
            className="form-control"
            id="bank_receipt"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="last_service_invoice" className="form-label">Last Service Invoice</label>
          <input
            type="file"
            className="form-control"
            id="last_service_invoice"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="lease_agreement" className="form-label">Lease Agreement (if applicable)</label>
          <input
            type="file"
            className="form-control"
            id="lease_agreement"
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="bank_account_certificate" className="form-label">Bank Account Certificate</label>
          <input
            type="file"
            className="form-control"
            id="bank_account_certificate"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="col-12 mt-4">
          <button 
            type="submit" 
            className="btn btn-primary px-4 py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Submit Documents'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientContractDocx;