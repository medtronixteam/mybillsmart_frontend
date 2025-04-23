import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";
import config from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2"; 
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";

const Products = () => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductData, setEditProductData] = useState({});
  const { token } = useAuth();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${config.BASE_URL}/api/supervisor/list/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        setProducts(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch products',
        });
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const deleteProduct = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${config.BASE_URL}/api/supervisor/products/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            fetchProducts();
            Swal.fire(
              'Deleted!',
              'Product has been deleted.',
              'success'
            );
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete product',
            });
          });
      }
    });
  };

  const enterEditMode = (product) => {
    console.log("Product Data:", product);
    setEditProductData(product);
    setIsEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "fixed_rate" && isNaN(value)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Fixed rate must be a valid number.',
      });
      return;
    }

    setEditProductData({ ...editProductData, [name]: value });
  };

  const saveEditedProduct = () => {
    const id = editProductData.id;

    if (!id || isNaN(id)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid Product ID.',
      });
      return;
    }

    const fixedRate = parseFloat(editProductData.fixed_rate);
    if (isNaN(fixedRate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Fixed rate must be a valid number.',
      });
      return;
    }

    const apiUrl = `${config.BASE_URL}/api/supervisor/products/${id}`;
    console.log("API URL:", apiUrl);

    const requestBody = { ...editProductData, fixed_rate: fixedRate };

    axios
      .put(apiUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        fetchProducts();
        setIsEditMode(false);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product updated successfully!',
        });
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        if (error.response) {
          console.error("API Error Response:", error.response.data);
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update product.',
        });
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
        <Link to="/supervisor/add-product">
          <button className="btn btn-primary mb-0">Add Product</button>
        </Link>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : isEditMode ? (
        <div className="edit-product-card shadow-none">
          <h3>Edit Product</h3>
          <form>
            <div className="edit-form-grid custom-form-fields-gap">
              {Object.entries(editProductData).map(
                ([key, value]) =>
                  key !== "id" &&
                  key !== "created_at" && (
                    <div className="form-group mb-0" key={key}>
                      <label>
                        {key.replace(/_/g, " ")}:
                        <input
                          type={key.includes("date") ? "date" : "text"}
                          name={key}
                          value={value || ""}
                          onChange={handleEditChange}
                          className="form-control"
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
                            onClick={() => deleteProduct(product.id)}
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

export default Products;