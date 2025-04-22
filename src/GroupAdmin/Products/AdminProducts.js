import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminProducts.css";
import config from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
const AdminProducts = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductData, setEditProductData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { token } = useAuth();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Fields to exclude from modal display
  const excludedFields = [
    "group_id",
    "addedby_id",
    "updated_at",
    "created_at",
    "id",
  ];

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${config.BASE_URL}/api/supervisor/list/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProducts(response.data || []);
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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  // Delete confirmation dialog
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setShowDeleteConfirm(false);
  };

  const executeDelete = () => {
    if (!productToDelete) return;

    axios
      .delete(
        `${config.BASE_URL}/api/supervisor/products/${productToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        fetchProducts();
        toast.success("Product deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
      })
      .finally(() => {
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      });
  };

  const enterEditMode = (product) => {
    setEditProductData(product);
    setIsEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "fixed_rate" && isNaN(value)) {
      toast.error("Fixed rate must be a valid number.");
      return;
    }

    setEditProductData({ ...editProductData, [name]: value });
  };

  const saveEditedProduct = () => {
    const id = editProductData.id;

    if (!id || isNaN(id)) {
      toast.error("Invalid Product ID.");
      return;
    }

    const fixedRate = parseFloat(editProductData.fixed_rate);
    if (isNaN(fixedRate)) {
      toast.error("Fixed rate must be a valid number.");
      return;
    }

    axios
      .put(
        `${config.BASE_URL}/api/supervisor/products/${id}`,
        { ...editProductData, fixed_rate: fixedRate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        fetchProducts();
        setIsEditMode(false);
        toast.success("Product updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        toast.error("Failed to update product.");
      });
  };

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
        <div className="edit-product-card">
          <h3>Edit Product</h3>
          <form>
            <div className="edit-form-grid">
              {Object.entries(editProductData).map(
                ([key, value]) =>
                  key !== "id" &&
                  key !== "created_at" && (
                    <div className="form-group" key={key}>
                      <label>
                        {key.replace(/_/g, " ")}:
                        <input
                          type={key.includes("date") ? "date" : "text"}
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
                currentProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{product.product_name}</td>
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
                          className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                          style={{ marginLeft: "-140px" }}
                        >
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => openModal(product)}
                          >
                            View Details
                          </a>
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => enterEditMode(product)}
                          >
                            Edit
                          </a>
                          <a
                            className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                            onClick={() => confirmDelete(product)}
                          >
                            Delete
                          </a>
                        </div>
                      )}
                      {/* <button
                        className="btn"
                        onClick={() => openModal(product)}
                      >
                        View Details
                      </button> */}
                      {/* <button
                        className="btn btn-edit"
                        onClick={() => enterEditMode(product)}
                      >
                        Edit
                      </button> */}
                      {/* <button
                        className="btn btn-danger"
                        onClick={() => confirmDelete(product)}
                      >
                        Delete
                      </button> */}
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
                .filter(([key]) => !excludedFields.includes(key))
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, " ")}:</strong> {value}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal-content">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete "{productToDelete.product_name}"?
            </p>
            <div className="confirmation-buttons">
              <button className="btn btn-danger" onClick={executeDelete}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
