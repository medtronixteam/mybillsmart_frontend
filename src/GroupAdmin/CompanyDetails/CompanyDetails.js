import React, { useState } from 'react';
import axios from 'axios';
import './CompanyDetails.css';
import config from '../../config';
import { useAuth } from "../../contexts/AuthContext";
import Swal from 'sweetalert2';

const CompanyDetails = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_email: '',
    company_city: '',
    company_state: '',
    company_zip: '',
    company_country: '',
    company_phone: '',
    company_logo: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      company_logo: e.target.files[0]
    }));
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post(`${config.BASE_URL}/api/group/company/details`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        }
      });

      const successMessage = response.data?.message || 'Company details submitted successfully!';
      showSuccessAlert(successMessage);
      
      // Clear form after successful submission
      setFormData({
        company_name: '',
        company_address: '',
        company_email: '',
        company_city: '',
        company_state: '',
        company_zip: '',
        company_country: '',
        company_phone: '',
        company_logo: null
      });
      
    } catch (error) {
      console.error('Error submitting company details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit company details. Please try again.';
      showErrorAlert(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="company-details-container">
      <h2>Company Details</h2>
      
      <form onSubmit={handleSubmit} className="company-details-form">
        <div className='row'>
          <div className="col-md-6 form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>Company Address</label>
            <input
              type="text"
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>Email</label>
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>City</label>
            <input
              type="text"
              name="company_city"
              value={formData.company_city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>State</label>
            <input
              type="text"
              name="company_state"
              value={formData.company_state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              name="company_zip"
              value={formData.company_zip}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>Country</label>
            <input
              type="text"
              name="company_country"
              value={formData.company_country}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="company_phone"
              value={formData.company_phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 form-group">
            <label>Company Logo</label>
            <input
              type="file"
              name="company_logo"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CompanyDetails;