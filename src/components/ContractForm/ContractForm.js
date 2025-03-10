import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom"; // Import useLocation
import "./ContractForm.css";

const ContractForm = () => {
  const location = useLocation(); // Access the location object
  const [supplierData, setSupplierData] = useState(null); // State to store the passed supplier data

  const [formData, setFormData] = useState({
    name: "",
    ContractedProvider: "",
    ContractedRate: "",
    ClosureDate: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // To control modal visibility
  const [modalMessage, setModalMessage] = useState(""); // Modal success message

  // Get the supplier data from the location state
  useEffect(() => {
    if (location.state && location.state.supplierData) {
      setSupplierData(location.state.supplierData); // Set the supplier data
      console.log("Supplier Data Received:", location.state.supplierData); // Log the data to the console
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.ContractedProvider ||
      !formData.ContractedRate ||
      !formData.ClosureDate
    ) {
      toast.error("All fields are required!");
      return;
    }

    // Simulate adding data to the list (you can add logic to send data to an API or store here)
    console.log("Form Data Submitted:", formData);

    // Show modal on success
    setModalMessage("Contract added successfully!");
    setIsModalOpen(true);

    // Reset the form
    setFormData({
      name: "",
      ContractedProvider: "",
      ContractedRate: "",
      ClosureDate: "",
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="add-Contract-container">
        <h2 className="add-Contract-heading">Add Contracts Data</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Please Enter Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ContractedProvider"
            placeholder="Please Enter Contracted Provider"
            value={formData.ContractedProvider}
            onChange={handleChange}
          />
          <input
            type="number"
            name="ContractedRate"
            placeholder="Please Enter Contracted Rate"
            value={formData.ContractedRate}
            onChange={handleChange}
          />
          <input
            type="date"
            name="ClosureDate"
            placeholder="Please Enter Closure Date"
            value={formData.ClosureDate}
            onChange={handleChange}
          />

          <button type="submit">Add Contract</button>
        </form>
      </div>

      {/* Modal for success message */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              {/* Add any icon you like (this is an example using emoji) */}
              ✔️
            </div>
            <p className="modal-message">{modalMessage}</p>
            <button className="modal-ok-button" onClick={handleModalClose}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Display Supplier Data (Optional) */}
      {supplierData && (
        <div className="supplier-data-container">
          <h3>Supplier Data</h3>
          <pre>{JSON.stringify(supplierData, null, 2)}</pre>
        </div>
      )}
    </>
  );
};

export default ContractForm;