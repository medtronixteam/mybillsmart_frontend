import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminContractForm.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";

const AdminContractForm = () => {
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
    selectedAgreement: "",
    // agreement_id: "",
    contracted_provider: "",
    contracted_rate: "",
    status: "pending",
    start_date: "",
    closure_date: "",
    requires_document: "no",
    note: "",
    required_documents: [] 
  });

  const [showWarning, setShowWarning] = useState(false);
  const [showDocumentSelection, setShowDocumentSelection] = useState(false);
  const navigate = useNavigate();

  const documentOptions = [
    { value: "id_card_front", label: "ID Card Front" },
    { value: "id_card_back", label: "ID Card Back" },
    { value: "bank_receipt", label: "Bank Receipt" },
    { value: "last_service_invoice", label: "Last Service Invoice" },
    { value: "lease_agreement", label: "Lease Agreement" },
    { value: "bank_account_certificate", label: "Bank Account Certificate" }
  ];

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

    // const fetchAgreements = async () => {
    //   try {
    //     const response = await axios.get(
    //       `${config.BASE_URL}/api/group/agreements`,
    //       {
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${token}`,
    //         },
    //       }
    //     );
    //     if (response.status === 401) {
    //       localStorage.removeItem("authToken");
    //       localStorage.removeItem("role");
    //       navigate("/login");
    //       return;
    //     }
    //     if (isMounted && response.data && Array.isArray(response.data.data)) {
    //       setAgreements(response.data.data);
    //     }
    //   } catch (error) {
    //     if (isMounted) {
    //       console.error("Error fetching agreements:", error);
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: 'Failed to fetch agreements.',
    //         showConfirmButton: true,
    //         confirmButtonColor: '#3085d6'
    //       });
    //     }
    //   }
    // };

    fetchClients();
    // fetchAgreements();

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
        required_documents: value === "no" ? [] : formData.required_documents
      });
      setShowWarning(value === "yes");
      setShowDocumentSelection(value === "yes");
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDocumentChange = (e) => {
    const { value, checked } = e.target;
    let updatedDocuments = [...formData.required_documents];
    
    if (checked) {
      updatedDocuments.push(value);
    } else {
      updatedDocuments = updatedDocuments.filter(doc => doc !== value);
    }
    
    setFormData({
      ...formData,
      required_documents: updatedDocuments
    });
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

    if (!formData.selectedClient) {
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

    // Validate that at least one document is selected if requires_document is yes
    if (formData.requires_document === "yes" && formData.required_documents.length === 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select at least one document type when document upload is required!',
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
      required_documents: formData.required_documents,
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
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

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
        start_date: "",
        closure_date: "",
        requires_document: "no",
        required_documents: [],
        note: "",
      });
      setShowWarning(false);
      setShowDocumentSelection(false);
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
            <textarea 
              name="note" 
              value={formData.note} 
              onChange={handleChange} 
              placeholder="Please Enter a note"
            ></textarea>
          </div>
          
          <div className="document-requirement-section">
            <label>Select a Client</label>
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

          {showWarning && (
            <div className="warning-message bg-warning">
              <strong>Warning:</strong> If you select "Yes", the client will need to upload documents for this agreement. 
              The agreement will be marked as "pending" until documents are uploaded.
            </div>
          )}

          {showDocumentSelection && (
            <div className="document-selection-section">
              <h4>Select the documents you want the client to upload:</h4>
              <div className="document-checkboxes">
                {documentOptions.map((doc) => (
                  <div key={doc.value} className="document-checkbox">
                    <input
                      type="checkbox"
                      id={doc.value}
                      name="required_documents"
                      value={doc.value}
                      checked={formData.required_documents.includes(doc.value)}
                      onChange={handleDocumentChange}
                    />
                    <label htmlFor={doc.value}>{doc.label}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" style={{marginBottom : "30px"}}>Add Contract</button>
        </form>
      </div>
    </>
  );
};

export default AdminContractForm;