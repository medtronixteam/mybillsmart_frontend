import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./ContractForm.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Swal from "sweetalert2";

const ContractForm = () => {
  const location = useLocation();
  const [supplierData, setSupplierData] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [clients, setClients] = useState([]);
  const { token, groupId } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    selectedClient: "",
    client_id: "",
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
          toast.error("Failed to fetch clients.");
        }
      }
    };

    fetchClients();

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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const showSuccessAlert = () => {
    Swal.fire({
      title: "Success!",
      text: "Agreement added successfully!",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    }).then(() => {
      setFormData({
        name: "",
        selectedClient: "",
        client_id: "",
        contracted_provider: "",
        contracted_rate: "",
        status: "pending",
        closure_date: "",
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!offerData) {
      toast.error("Offer data is missing!");
      return;
    }

    if (!groupId) {
      toast.error("Group information is missing!");
      return;
    }

    if (
      !formData.name ||
      !formData.selectedClient ||
      !formData.contracted_provider ||
      !formData.contracted_rate ||
      !formData.closure_date
    ) {
      toast.error("All fields are required!");
      return;
    }

    const payload = {
      name: formData.name,
      client_id: formData.client_id,
      offer_id: offerData.id,
      contracted_provider: formData.contracted_provider,
      contracted_rate: formData.contracted_rate,
      status: formData.status,
      closure_date: formData.closure_date,
      group_id: groupId,
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
      showSuccessAlert();
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error);
      Swal.fire({
        title: "Error!",
        text: "Failed to submit agreement.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="add-Contract-container">
      <h2 className="add-Contract-heading">Add Agreements Data</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Please Enter Agreement Name"
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

        <input
          type="text"
          name="contracted_provider"
          placeholder="Please Enter Agreemented Provider"
          value={formData.contracted_provider}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="contracted_rate"
          placeholder="Please Enter Agreemented Rate"
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

        <button type="submit">Add Agreement</button>
      </form>
    </div>
  );
};

export default ContractForm;