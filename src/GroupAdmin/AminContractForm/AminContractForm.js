import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {  useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./AminContractForm.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";
const AminContractForm = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [supplierData, setSupplierData] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [offerId, setOfferId] = useState(null);
  const [clients, setClients] = useState([]);
  const [agreements, setAgreements] = useState([]); 
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    selectedClient: "",
    client_id: "",
    selectedAgreement: "",
    agreement_id: "",
    contracted_provider: "",
    contracted_rate: "",
    status: "pending",
    closure_date: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // First try to get offer_id from URL query parameters
    const urlOfferId = searchParams.get("offer_id");
    
    if (urlOfferId) {
      setOfferId(urlOfferId);
    } 
    // If not in URL, check location state
    else if (location.state) {
      if (location.state.offerData) {
        setOfferData(location.state.offerData);
        setOfferId(location.state.offerData.id);
      }
      if (location.state.offer_id) {
        setOfferId(location.state.offer_id);
      }
      if (location.state.supplierData) {
        setSupplierData(location.state.supplierData);
      }
    }
  }, [location.state, searchParams]);

  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}/api/group/client/list`,
          {
            headers: {
              "Content-Type": "application/json",
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

        if (isMounted && response.data && Array.isArray(response.data.data)) {
          setClients(response.data.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching clients:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch clients.',
            showConfirmButton: true,
            confirmButtonColor: '#3085d6'
          });
        }
      }
    };

    const fetchAgreements = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}/api/group/agreements`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isMounted && response.data && Array.isArray(response.data.data)) {
          setAgreements(response.data.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching agreements:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch agreements.',
            showConfirmButton: true,
            confirmButtonColor: '#3085d6'
          });
        }
      }
    };

    fetchClients();
    fetchAgreements();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "selectedClient") {
      const selectedClient = clients.find((client) => client.name === value);
      setFormData({
        ...formData,
        selectedClient: value,
        client_id: selectedClient ? selectedClient.id : "",
      });
    } 
    else if (name === "selectedAgreement") {
      const selectedAgreement = agreements.find((agreement) => agreement.title === value);
      setFormData({
        ...formData,
        selectedAgreement: value,
        agreement_id: selectedAgreement ? selectedAgreement.id : "",
      });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const showSuccessAlert = () => {
    return Swal.fire({
      title: "Success!",
      text: "Agreement submitted to client successfully",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!offerId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Offer ID is missing! Please make sure you came from a valid offer.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (
      !formData.closure_date
    ) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'All fields are required!',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const payload = {
      // name: formData.name,
      client_id: formData.client_id,
      offer_id: offerId,
      // agreement_id: formData.agreement_id,
      // contracted_provider: formData.contracted_provider,
      // contracted_rate: formData.contracted_rate,
      status: formData.status,
      start_date: formData.start_date,
      closure_date: formData.closure_date,
      requires_document: formData.requires_document === "yes",
      note: formData.note
    };

    try {
      const response = await axios.post(
        `${config.BASE_URL}/api/group/contracts`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      await showSuccessAlert();
      
      setFormData({
        name: "",
        selectedClient: "",
        client_id: "",
        selectedAgreement: "",
        agreement_id: "",
        contracted_provider: "",
        contracted_rate: "",
        status: "pending",
        closure_date: "",
      });
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to submit Contract.",
        confirmButtonColor: "#3085d6"
      }); 
    }
  };

  return (
<>

<div className="mt-4 container">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />
      </div>
      <div className="add-Contract-container">
        <h2 className="add-Contract-heading">Agreement With Client</h2>
        <form onSubmit={handleSubmit}>
          <div className="document-requirement-section">
   <label>Please Enter Note for the Contract</label>
          <textarea  name="note" value={formData.note} onChange={handleChange} placeholder="Please Enter a note"></textarea>
          </div>
   <div className="document-requirement-section">
   <label>Start Date</label>
          <select
            name="selectedClient"
            value={formData.selectedClient}
            onChange={handleChange}
            required
          >
            <option value="">Select a Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>


        </div>

          {/* <select
            name="selectedAgreement"
            value={formData.selectedAgreement}
            onChange={handleChange}
            required
          >
            <option value="">Select an Agreement</option>
            {agreements.map((agreement) => (
              <option key={agreement.id} value={agreement.title}>
                {agreement.title}
              </option>
            ))}
          </select> */}

          {/* <input
            type="text"
            name="contracted_provider"
            placeholder="Please Enter Contracted Provider"
            value={formData.contracted_provider}
            onChange={handleChange}
            required
          /> */}

          {/* <input
            type="number"
            name="contracted_rate"
            placeholder="Please Enter Contracted Rate"
            value={formData.contracted_rate}
            onChange={handleChange}
            required
          /> */}

<div className="document-requirement-section">
<label>Start Date</label>
          <input
            type="date"
            name="start_date"
            placeholder="Please Enter Start Date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
          </div>
          <div className="document-requirement-section">
          <label style={{fontSize: "12px", fontWeight: "bold"}}>Close Date</label>
          <input
            type="date"
            name="closure_date"
            placeholder="Please Enter Closure Date"
            value={formData.closure_date}
            onChange={handleChange}
            required
          />
          </div>

          <div className="document-requirement-section">
            <label>Does this agreement require a document from the client?</label>
            <select
              name="requires_document"
              value={formData.requires_document}
              onChange={handleChange}
              required
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

         
            <div className="warning-message">
              <strong>Warning:</strong> If you select "Yes", the client will NOT be able to upload documents for this agreement. 
              The agreement will be marked as "active" immediately.
            </div>
        

          <button type="submit">Add Contract</button>
        </form>
      </div>
</>
  );
};

export default AminContractForm;