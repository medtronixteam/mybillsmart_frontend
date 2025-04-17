import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminProducts.css";
import config from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify"; // For toast messages
import "react-toastify/dist/ReactToastify.css"; // Toast CSS
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";

const AdminProducts = () => {
  const [products, setProducts] = useState([]); // State to store products
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productsPerPage] = useState(10); // Products per page
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isEditMode, setIsEditMode] = useState(false); // Edit mode state
  const [editProductData, setEditProductData] = useState({}); // Product data for editing
  const { token } = useAuth(); // Get token from AuthContext

  // Fetch products from the API
  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${config.BASE_URL}/api/supervisor/list/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("API Response:", response.data); // Log the actual API response
        setProducts(response.data || []); // Use response.data directly
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open modal with product details
  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  // Delete a product
  const deleteProduct = (id) => {
    axios
      .delete(`${config.BASE_URL}/api/supervisor/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchProducts(); // Refresh the product list
        toast.success("Product deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
      });
  };

  const enterEditMode = (product) => {
    console.log("Product Data:", product);
    setEditProductData(product);
    setIsEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // Ensure fixed_rate is a number
    if (name === "fixed_rate" && isNaN(value)) {
      toast.error("Fixed rate must be a valid number.");
      return;
    }

    setEditProductData({ ...editProductData, [name]: value });
  };

  const saveEditedProduct = () => {
    const id = editProductData.id; // Get the product ID from the state
    console.log("Product ID:", id); // Debug: Check if the ID is correct

    if (!id || isNaN(id)) {
      toast.error("Invalid Product ID.");
      return;
    }

    // Ensure the fixed_rate is a number before making the API call
    const fixedRate = parseFloat(editProductData.fixed_rate);
    if (isNaN(fixedRate)) {
      toast.error("Fixed rate must be a valid number.");
      return;
    }

    const apiUrl = `${config.BASE_URL}/api/supervisor/products/${id}`;
    console.log("API URL:", apiUrl);

    const requestBody = { ...editProductData, fixed_rate: fixedRate };
    // console.log("Request Body:", requestBody);

    axios
      .put(apiUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("API Response:", response.data); // Debug: Check the response
        fetchProducts(); // Refresh the product list
        setIsEditMode(false); // Exit edit mode
        toast.success("Product updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        if (error.response) {
          console.error("API Error Response:", error.response.data); // Debug: Check error response
        }
        toast.error("Failed to update product.");
      });
  };

  // Exit edit mode
  const exitEditMode = () => {
    setIsEditMode(false);
    setEditProductData({});
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h2 className="mb-0">Products</h2>
        <Link to="/group_admin/add-product">
          <button className="btn btn-primary mb-0">Back</button>
        </Link>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : isEditMode ? (
        // Edit Mode Card
        <div className="edit-product-card">
          <h3>Edit Product</h3>
          <form>
            <div className="edit-form-grid">
              {Object.entries(editProductData).map(
                ([key, value]) =>
                  // Skip 'id' and 'created_at' fields
                  key !== "id" &&
                  key !== "created_at" && (
                    <div className="form-group" key={key}>
                      <label>
                        {key.replace(/_/g, " ")}:{" "}
                        {/* Replace underscores with spaces */}
                        <input
                          type={key.includes("date") ? "date" : "text"} // Use "date" type for date fields
                          name={key}
                          value={value || ""}
                          onChange={handleEditChange}
                        />
                      </label>
                    </div>
                  )
              )}
            </div>
            <div className="form-actions">
              <button type="button" onClick={saveEditedProduct}>
                Save
              </button>
              <button type="button" onClick={exitEditMode}>
                Back
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Table View
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Light Category</th>
                <th>Fixed Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.product_name}</td>
                    <td>{product.light_category}</td>
                    <td>{product.fixed_rate}</td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => openModal(product)}
                      >
                        View Details
                      </button>{" "}
                      <button
                        className="btn btn-edit"
                        onClick={() => enterEditMode(product)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No products available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
              disabled={indexOfLastProduct >= products.length}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal for displaying additional product details */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <button className="close-btn" onClick={closeModal}>
              <IoClose size={25} />
            </button>
            <h3>{selectedProduct.product_name}</h3>
            <div className="modal-scrollable-content">
              {Object.entries(selectedProduct).map(([key, value]) => (
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
