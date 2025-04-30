import React, { useState, useEffect, useRef } from "react";
import "./AgrementList.css";
import axios from "axios";
import config from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const AgreementList = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editData, setEditData] = useState({
    id: "",
    title: "",
    description: "",
    status: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { token } = useAuth();
  const itemsPerPage = 10;
  // const dropdownRefs = useRef([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDropdown = (index) => {
    // e.stopPropagation();
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       !dropdownRefs.current.some((ref) => ref && ref.contains(event.target))
  //     ) {
  //       setActiveDropdown(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  useEffect(() => {
    fetchAgreements();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.BASE_URL}/api/group/agreements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let filteredData = [...response.data.data];

      if (statusFilter !== "all") {
        filteredData = filteredData.filter(
          (agreement) => agreement.status === statusFilter
        );
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (agreement) =>
            agreement.title.toLowerCase().includes(term) ||
            agreement.description.toLowerCase().includes(term)
        );
      }

      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPages);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setAgreements(paginatedData);
    } catch (error) {
      console.error("Error fetching agreements:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch agreements",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgreementDetails = async (id) => {
    try {
      const response = await axios.get(
        `${config.BASE_URL}/api/group/agreement/view/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      // Access the nested agreement object from the response
      return response.data.data.agreement;
    } catch (error) {
      console.error("Error fetching agreement details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch agreement details",
        confirmButtonColor: "#3085d6",
      });
      return null;
    }
  };

  const handleEditAgreement = async (id) => {
    const agreementData = await fetchAgreementDetails(id);
    if (agreementData) {
      console.log("Setting edit data:", agreementData);
      setEditData({
        id: agreementData.id, // Make sure this matches your API response
        title: agreementData.title,
        description: agreementData.description,
        status: agreementData.status,
      });
      setIsEditModalOpen(true);
      setActiveDropdown(null);
    }
  };

  const handleUpdateAgreement = async () => {
    console.log("Submitting with data:", editData);

    if (!editData.id) {
      console.error("No ID found in editData:", editData);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No agreement ID found for update",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${config.BASE_URL}/api/group/agreement/edit/${editData.id}`,
        {
          title: editData.title,
          description: editData.description,
          status: editData.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Agreement updated successfully!",
        confirmButtonColor: "#3085d6",
        timer: 2000,
      });
      setIsEditModalOpen(false);
      fetchAgreements();
    } catch (error) {
      console.error("Error updating agreement:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update agreement",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgreement = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(
          `${config.BASE_URL}/api/group/agreement/delete/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Agreement has been deleted.",
          confirmButtonColor: "#3085d6",
          timer: 2000,
        });
        fetchAgreements();
      } catch (error) {
        console.error("Error deleting agreement:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete agreement",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="agreement-list-container">
      <Breadcrumbs homePath={"/group_admin/dashboard"} />
      <h2 className="text-center">Agreements List</h2>
      <div className="filters-section mb-4 p-4 bg-transparent shadow-none">
        <div className="row g-3 align-items-end w-100">
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label m-0">Status</label>
            <select
              className="form-select my-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="global">Global</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label m-0">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="col-12 col-lg-4">
            <button
              className="btn btn-primary w-100 my-0"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : agreements.length === 0 ? (
        <div className="no-agreements">No agreements found</div>
      ) : (
        <>
          <table className="agreements-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agreements.map((agreement, index) => (
                <tr key={agreement.id}>
                  <td>{agreement.title}</td>
                  <td className="description-cell">
                    {agreement.description.length > 100
                      ? `${agreement.description.substring(0, 100)}...`
                      : agreement.description}
                  </td>
                  <td>
                    <span className={`status-badge ${agreement.status}`}>
                      {agreement.status}
                    </span>
                  </td>
                  <td className="actions">
                    <HiDotsHorizontal
                      size={30}
                      onClick={() => toggleDropdown(index)}
                      className="cursor-pointer"
                    />

                    {activeDropdown === index && (
                      <div
                        // ref={(el) => (dropdownRefs.current[index] = el)}
                        className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0 mt-4"
                        style={{ marginLeft: "-130px", marginTop: "50px" }}
                      >
                        <a
                          className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                          onClick={() => handleEditAgreement(agreement.id)}
                          disabled={loading}
                        >
                          Edit
                        </a>
                        <a
                          className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                          onClick={() => handleDeleteAgreement(agreement.id)}
                          disabled={loading}
                        >
                          Delete
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Agreement</h3>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={editData.title || ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editData.description || ""}
                onChange={handleEditChange}
                rows="5"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={editData.status || "private"}
                onChange={handleEditChange}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="global">Global</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleUpdateAgreement}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementList;
