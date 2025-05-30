import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminProducts.css";
import config from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import Breadcrumbs from "../../Breadcrumbs";

const AdminProducts = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductData, setEditProductData] = useState({});
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search

  const { token } = useAuth();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Fields to exclude from modal display
  const excludedFields = ["group_id", "addedby_id", "updated_at", "created_at", "id"];

  // Field groups for edit form based on agreement type
  const commonFields = [
    "provider_name",
    "product_name",
    "light_category",
    "fixed_rate",
    "contract_duration",
    "customer_type",
    "sales_commission",
    "points_per_deal",
    "meter_rental",
    "validity_period_from",
    "validity_period_to",
    "discount_period_start",
    "discount_period_end",
    "contact_terms",
    "commision_type"
  ];

  const electricityFields = [
    ...commonFields,
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "power_term",
    "peak",
    "off_peak",
    "energy_term_by_time",
    "variable_term_by_tariff"
  ];

  const gasFields = [
    ...commonFields,
    "rl1",
    "rl2",
    "rl3",
    "power_term",
    "peak",
    "off_peak",
    "energy_term_by_time",
    "variable_term_by_tariff"
  ];

  const combinedFields = [
    ...commonFields,
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "rl1",
    "rl2",
    "rl3",
    "dual_discount"
  ];

  // Explicit list of numeric fields for validation
  const numericFields = [
    "fixed_rate",
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "rl1",
    "rl2",
    "rl3",
    "sales_commission",
    "points_per_deal",
    "meter_rental",
    "dual_discount"
  ];

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${config.BASE_URL}/api/group/list/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const productsData = response.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Agreements:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply both type and search filters
  useEffect(() => {
    let result = [...products];

    // Apply agreement type filter
    if (filterType !== "all") {
      result = result.filter(
        (product) => product.agreement_type === filterType
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.product_name?.toLowerCase().includes(lowerCaseQuery) ||
          product.provider_name?.toLowerCase().includes(lowerCaseQuery) ||
          product.agreement_type?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset pagination when filters change
  }, [filterType, searchQuery, products]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  // Delete confirmation using SweetAlert
  const confirmDelete = (product) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${product.product_name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        executeDelete(product);
      }
    });
  };

  const executeDelete = (product) => {
    axios
      .delete(`${config.BASE_URL}/api/group/products/${product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchProducts();
        Swal.fire({
          title: "Deleted!",
          text: "Agreement has been deleted.",
          icon: "success",
        });
      })
      .catch((error) => {
        console.error("Error deleting Agreement:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete Agreement.",
          icon: "error",
        });
      });
  };

  const enterEditMode = (product) => {
    const processedProduct = {};
    Object.keys(product).forEach((key) => {
      // Initialize all fields to prevent disappearing
      processedProduct[key] = product[key] === null ? "" : product[key];
    });
    setEditProductData(processedProduct);
    setIsEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // Only validate numeric fields
    if (numericFields.includes(name)) {
      if (value !== "" && isNaN(value)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Input",
          text: "Please enter a valid number.",
        });
        return;
      }
    }

    setEditProductData({ ...editProductData, [name]: value });
  };

  const saveEditedProduct = () => {
    const id = editProductData.id;
    if (!id || isNaN(id)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid Agreement ID.",
      });
      return;
    }

    const dataToSend = {};
    Object.keys(editProductData).forEach((key) => {
      dataToSend[key] = editProductData[key] === "" ? null : editProductData[key];
    });

    axios
      .put(`${config.BASE_URL}/api/group/products/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchProducts();
        setIsEditMode(false);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Agreement updated successfully!",
        });
      })
      .catch((error) => {
        console.error("Error updating Agreement:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update Agreement.",
        });
      });
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setEditProductData({});
  };

  const renderEditFormField = (field) => {
    const isElectricityRate = field.startsWith("p");
    const isGasRate = field.startsWith("rl");
    const isNumeric = numericFields.includes(field);

    // Always render the field if it exists in editProductData, even if empty
    if (editProductData[field] === undefined) {
      return null;
    }

    return (
      <div className="form-group mb-3" key={field}>
        <label className="form-label">
          {field.replace(/_/g, " ")}:
        </label>
        {field === "customer_type" ? (
          <select
            name={field}
            value={editProductData[field] || ""}
            onChange={handleEditChange}
            className="form-control"
          >
            <option value="residential">Residential</option>
            <option value="business">Business</option>
          </select>
        ) : field === "commision_type" ? (
          <select
            name={field}
            value={editProductData[field] || ""}
            onChange={handleEditChange}
            className="form-control"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        ) : field.includes("period") || field.includes("date") ? (
          <input
            type="date"
            name={field}
            value={editProductData[field] || ""}
            onChange={handleEditChange}
            className="form-control"
          />
        ) : isNumeric ? (
          <input
            type="number"
            step={isElectricityRate || isGasRate ? "0.0001" : "0.01"}
            name={field}
            value={editProductData[field] || ""}
            onChange={handleEditChange}
            className="form-control"
          />
        ) : (
          <input
            type="text"
            name={field}
            value={editProductData[field] || ""}
            onChange={handleEditChange}
            className="form-control"
          />
        )}
      </div>
    );
  };

  const renderEditFormSection = (fields, title = null) => {
    // Always render all fields in the section, even if empty
    const fieldsToRender = fields.filter(
      (field) => editProductData[field] !== undefined
    );

    // Don't render the section if no fields exist
    if (fieldsToRender.length === 0) {
      return null;
    }

    return (
      <div className="edit-form-section mb-4" key={title}>
        {title && <h4 className="mb-3">{title}</h4>}
        <div className="row">
          {fieldsToRender.map((field) => (
            <div className="col-md-6" key={field}>
              {renderEditFormField(field)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editProductData.agreement_type) return null;

    switch (editProductData.agreement_type) {
      case "electricity":
        return (
          <div className="edit-product-form">
            <h3 className="mb-4">Edit Electricity Agreement</h3>
            {renderEditFormSection(
              ["provider_name", "product_name", "light_category", "fixed_rate", "customer_type", "commision_type"],
              "Basic Information"
            )}
            {renderEditFormSection(["p1", "p2", "p3", "p4", "p5", "p6"], "Energy Terms (€/kWh)")}
            {renderEditFormSection(
              ["power_term", "peak", "off_peak", "energy_term_by_time", "variable_term_by_tariff"],
              "Power Terms"
            )}
            {renderEditFormSection(
              ["contract_duration", "sales_commission", "points_per_deal", "meter_rental"],
              "Contract Details"
            )}
            {renderEditFormSection(
              ["validity_period_from", "validity_period_to", "discount_period_start", "discount_period_end"],
              "Validity Period"
            )}
            {renderEditFormSection(["contact_terms"], "Contract Terms")}
          </div>
        );
      case "gas":
        return (
          <div className="edit-product-form">
            <h3 className="mb-4">Edit Gas Agreement</h3>
            {renderEditFormSection(
              ["provider_name", "product_name", "light_category", "fixed_rate", "customer_type", "commision_type"],
              "Basic Information"
            )}
            {renderEditFormSection(["rl1", "rl2", "rl3"], "Variable Terms (€/kWh)")}
            {renderEditFormSection(
              ["power_term", "peak", "off_peak", "energy_term_by_time", "variable_term_by_tariff"],
              "Power Terms"
            )}
            {renderEditFormSection(
              ["contract_duration", "sales_commission", "points_per_deal", "meter_rental"],
              "Contract Details"
            )}
            {renderEditFormSection(
              ["validity_period_from", "validity_period_to", "discount_period_start", "discount_period_end"],
              "Validity Period"
            )}
            {renderEditFormSection(["contact_terms"], "Contract Terms")}
          </div>
        );
      case "combined":
      case "both":
        return (
          <div className="edit-product-form">
            <h3 className="mb-4">Edit Combined Agreement</h3>
            {renderEditFormSection(
              ["provider_name", "product_name", "light_category", "fixed_rate", "customer_type", "dual_discount", "commision_type"],
              "Basic Information"
            )}
            <div className="electricity-section mb-4">
              <h5 className="mb-3">Electricity Terms</h5>
              {renderEditFormSection(["p1", "p2", "p3", "p4", "p5", "p6"], "Energy Terms (€/kWh)")}
            </div>
            <div className="gas-section mb-4">
              <h5 className="mb-3">Gas Terms</h5>
              {renderEditFormSection(["rl1", "rl2", "rl3"], "Variable Terms (€/kWh)")}
            </div>
            {renderEditFormSection(
              ["contract_duration", "sales_commission", "points_per_deal", "meter_rental"],
              "Contract Details"
            )}
            {renderEditFormSection(
              ["validity_period_from", "validity_period_to", "discount_period_start", "discount_period_end"],
              "Validity Period"
            )}
            {renderEditFormSection(["contact_terms"], "Contract Terms")}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="products-container">
      <div className="mb-3">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />
      </div>
      <div className="products-header d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Agreements</h2>
        <Link to="/group_admin/add-Agreement">
          <button className="btn btn-primary mb-0">Add New Agreements</button>
        </Link>
      </div>

    

      {/* Filter Controls */}
      <div className="filter-controls mb-3">
        <div className="btn-group">
          <button
            className={`btn ${
              filterType === "all" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilterType("all")}
          >
            All Products
          </button>
          <button
            className={`btn ${
              filterType === "electricity" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilterType("electricity")}
          >
            Electricity
          </button>
          <button
            className={`btn ${
              filterType === "gas" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilterType("gas")}
          >
            Gas
          </button>
          <button
            className={`btn ${
              filterType === "Combined" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilterType("both")}
          >
            Combined
          </button>
        </div>

          {/* Search Input */}
      <div className="search-control mb-3">
        <input
          type="text"
          placeholder="Search Agreements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control form-control-lg"
          style={{ maxWidth: "300px" }}
        />
      </div>
      </div>

      {loading ? (
        <div
          className="spinner-border d-block mx-auto"
          role="status"
          style={{ color: "#3598db" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : isEditMode ? (
        <div className="edit-product-card bg-white p-4 rounded shadow">
          {renderEditForm()}
          <div className="form-actions mt-4">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={exitEditMode}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveEditedProduct}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Provider Name</th>
                <th>Agreement Type</th>
                <th>Light Category</th>
                <th>Fixed Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{product.product_name}</td>
                    <td>{product.provider_name}</td>
                    <td>{product.agreement_type}</td>
                    <td>{product.light_category}</td>
                    <td>{product.fixed_rate}</td>
                    <td>
                      <HiDotsHorizontal
                        size={30}
                        onClick={() => toggleDropdown(index)}
                        className="cursor-pointer"
                      />
                      {activeDropdown === index && (
                        <div
                          className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0 mt-2"
                          style={{ marginLeft: "-130px" }}
                        >
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => {
                              openModal(product);
                              setActiveDropdown(false);
                            }}
                          >
                            View Details
                          </a>
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => {
                              enterEditMode(product);
                              setActiveDropdown(false);
                            }}
                          >
                            Edit
                          </a>
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => {
                              confirmDelete(product);
                              setActiveDropdown(false);
                            }}
                          >
                            Delete
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No Agreements available</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastProduct >= filteredProducts.length}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Product Details Modal */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <button className="close-btn" onClick={closeModal}>
              <IoClose size={25} />
            </button>
            <h3>{selectedProduct.product_name}</h3>
            <div className="modal-scrollable-content">
              {Object.entries(selectedProduct)
                .filter(
                  ([key, value]) =>
                    !excludedFields.includes(key) &&
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                )
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, " ")}:</strong> {value}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;