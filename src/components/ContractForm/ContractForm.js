import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./ContractForm.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";

const ContractForm = () => {
  const location = useLocation();
  const [supplierData, setSupplierData] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [clients, setClients] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    selectedClient: "",
    client_id: "",
    agreement_id: "",
    contracted_provider: "",
    contracted_rate: "",
    status: "pending",
    start_date: "",
    closure_date: "",
    requires_document: "no", // New field for document requirement
  });

  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.supplierData) {
        setSupplierData(location.state.supplierData);
      }
      if (location.state.offerData) {
        setOfferData(location.state.offerData);
      }
    }
  }, [location.state]);

  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}/api/agent/client/list`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
      // try {
      //   const response = await axios.get(
      //     `${config.BASE_URL}/api/agent/agreements`,
      //     {
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: `Bearer ${token}`,
      //       },
      //     }
      //   );

      //   if (isMounted && response.data && Array.isArray(response.data.data)) {
      //     setAgreements(response.data.data);
      //   }
      // } catch (error) {
      //   if (isMounted) {
      //     console.error("Error fetching agreements:", error);
      //     Swal.fire({
      //       icon: 'error',
      //       title: 'Error',
      //       text: 'Failed to fetch agreements.',
      //       showConfirmButton: true,
      //       confirmButtonColor: '#3085d6'
      //     });
      //   }
      // }
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
    else if (name === "requires_document") {
      setFormData({
        ...formData,
        requires_document: value,
        status: value === "yes" ? "pending" : "active",
      });
      setShowWarning(value === "yes");
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

    if (!offerData) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Offer data is missing!',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (
   
      !formData.selectedClient
    ) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'All fields are required!',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Validate that start date is before closure date
    if (new Date(formData.start_date) > new Date(formData.closure_date)) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Start date must be before closure date!',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const payload = {
      client_id: formData.client_id,
      offer_id: offerData.id,
      agreement_id: formData.agreement_id,
      status: formData.status,
      start_date: formData.start_date,
      closure_date: formData.closure_date,
      requires_document: formData.requires_document === "yes",
      note: formData.note
    };

    try {
      const response = await axios.post(
        `${config.BASE_URL}/api/agent/contracts`,
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
        agreement_id: "",
        contracted_provider: "",
        contracted_rate: "",
        status: "pending",
        start_date: "",
        closure_date: "",
        requires_document: "no",
        note: "",
      });
      setShowWarning(false);
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

         
            <div className="warning-message bg-warning">
              <strong>Warning:</strong> If you select "Yes", the client will NOT be able to upload documents for this agreement. 
              The agreement will be marked as "active" immediately.
            </div>
        

          <button type="submit">Add Contract</button>
        </form>
      </div>
    </>
  );
};

export default ContractForm;