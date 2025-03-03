import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";
import config from "../../config";
const Products = () => {
  const [products, setProducts] = useState([]);  
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    status: 1,  
  });
  const [loading, setLoading] = useState(true); 

  const fetchProducts = () => {
    setLoading(true);  
    axios
      .get(`${config.BASE_URL}/api/products`)
      .then((response) => {
        setProducts(response.data.data || []);
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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openDetailsModal = (product) => setSelectedProduct(product);
  const closeDetailsModal = () => setSelectedProduct(null);
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewProduct({ name: "", description: "", price: "", status: 1 });
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.description && newProduct.price) {
      axios
        .post(`${config.BASE_URL}/api/products`, newProduct)
        .then((response) => {
          fetchProducts();  
          closeCreateModal();
        })
        .catch((error) => {
          console.error("Error adding product:", error);
        });
    } else {
      alert("Please fill out all fields.");
    }
  };

  const deleteProduct = (id) => {
    axios
      .delete(`${config.BASE_URL}/api/products/${id}`)
      .then(() => {
        fetchProducts(); 
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  };

  const editProduct = (id, updatedProduct) => {
    axios
      .put(
        `${id}/api/products/${id}`,
        updatedProduct
      )
      .then(() => {
        fetchProducts();  
      })
      .catch((error) => {
        console.error("Error editing product:", error);
      });
  };

  const toggleStatus = (id, currentStatus) => {
    const updatedStatus = currentStatus === 1 ? 0 : 1;
    axios
      .put(`${id}/api/products/${id}`, {
        status: updatedStatus,
      })
      .then(() => {
        fetchProducts();  
      })
      .catch((error) => {
        console.error("Error toggling product status:", error);
      });
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Products</h2>
        <button className="create-btn" onClick={openCreateModal}>
          Create Product +
        </button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                
                    <td>
                      {product.status === 1 ? "Disable" : "Enable"}
                    </td>
                
                  <td>
                    <button
                      className="btn"
                      onClick={() => openDetailsModal(product)}
                    >
                      View Details
                    </button>{" "}
                    <button
                      className="btn btn-secondry"
                      
                      onClick={() => editProduct(product.id, product)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="btn btn-danger"
                      id="btn-danger"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No products available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

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

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeDetailsModal}>
              ✖
            </button>
            <h3>{selectedProduct.name}</h3>
            <p>{selectedProduct.description}</p>
            <p>{selectedProduct.price}</p>
          </div>
        </div>
      )}

      {/* Create New Product Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeCreateModal}>
              ✖
            </button>
            <h3>Create New Product</h3>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newProduct.description}
              onChange={handleChange}
            />
            <input
              type="text"
              name="price"
              placeholder="Price"
              value={newProduct.price}
              onChange={handleChange}
            />
            <select
              name="status"
              value={newProduct.status}
              onChange={handleChange}
            >
              <option value={1}>Enable</option>
              <option value={0}>Disable</option>
            </select>
            <button className="add-btn" onClick={addProduct}>
              Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
