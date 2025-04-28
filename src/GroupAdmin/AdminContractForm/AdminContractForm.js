import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./AdminContractForm.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const AdminContractForm = () => {
  const location = useLocation();
  const [supplierData, setSupplierData] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [clients, setClients] = useState([]);
  const [agreements, setAgreements] = useState([]); // New state for agreements
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    selectedClient: "",
    client_id: "",
    selectedAgreement: "", // New field for agreement selection
    agreement_id: "", // New field for agreement ID
    contracted_provider: "",
    contracted_rate: "",
    status: "pending",
    closure_date: "",
  });

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
          `${config.BASE_URL}/api/group/client/list`,
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
      text: "Agreement submitted to client successfully ",
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
      !formData.name ||
      !formData.selectedClient ||
      !formData.selectedAgreement ||
      !formData.contracted_provider ||
      !formData.contracted_rate ||
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
      name: formData.name,
      client_id: formData.client_id,
      offer_id: offerData.id,
      agreement_id: formData.agreement_id, // Include agreement_id in payload
      contracted_provider: formData.contracted_provider,
      contracted_rate: formData.contracted_rate,
      status: formData.status,
      closure_date: formData.closure_date,
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
    <div className="add-Contract-container">
      <h2 className="add-Contract-heading">Client Agreement</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Please Enter Contract Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

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

        {/* New Agreement Selection Field */}
        <select
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
        </select>

        <input
          type="text"
          name="contracted_provider"
          placeholder="Please Enter Contracted Provider"
          value={formData.contracted_provider}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="contracted_rate"
          placeholder="Please Enter Contracted Rate"
          value={formData.contracted_rate}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="closure_date"
          placeholder="Please Enter Closure Date"
          value={formData.closure_date}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Contract</button>
      </form>
    </div>
  );
};

export default AdminContractForm;