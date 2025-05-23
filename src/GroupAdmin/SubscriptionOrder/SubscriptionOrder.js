import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import "./SubscriptionOrder.css";
import { FaFilePdf } from "react-icons/fa";
import Swal from "sweetalert2";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import Breadcrumbs from "../../Breadcrumbs";

const SubscriptionOrder = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let endpoint = "";
        if (activeTab === "subscriptions") {
          endpoint = `${config.BASE_URL}/api/group/subscription/history`;
        } else if (activeTab === "orderHistory") {
          endpoint = `${config.BASE_URL}/api/group/order/history`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        const data = result.data || [];

        const formattedData = data.map((item) => {
          if (activeTab === "subscriptions") {
            return {
              id: item.id,
              planName: item.plan_name,
              amount: (parseFloat(item.amount) / 100).toFixed(2),
              status: item.status,
              startDate: new Date(item.start_date).toLocaleDateString(),
              paymentMethod: "Credit Card",
              currency: "EUR"
            };
          } else {
            return {
              id: item.id,
              planName: item.plan_name,
              amount: (parseFloat(item.amount) / 100).toFixed(2),
              status: item.status,
              date: new Date(item.created_at).toLocaleDateString(),
              currency: "EUR"
            };
          }
        });

        if (activeTab === "subscriptions") {
          setSubscriptionData(formattedData);
        } else {
          setOrderData(formattedData);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
        if (activeTab === "subscriptions") {
          setSubscriptionData([]);
        } else {
          setOrderData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, token]);

  // Handle receipt download
  const downloadReceipt = async (orderId) => {
    try {
      Swal.fire({
        title: "Generating Receipt",
        text: "Please wait while we generate your receipt...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(`${config.BASE_URL}/api/payment/receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate receipt");
      }

      const result = await response.json();
      if (result.message) {
        window.open(result.message, "_blank");
        Swal.close();
      } else {
        throw new Error("Something Went Wrong");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to download receipt",
      });
    }
  };

  // Pagination and Filtering Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get current items based on active tab
  const currentItems =
    activeTab === "subscriptions" ? subscriptionData : orderData;

  // Apply search filter
  const filteredItems = currentItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    
    return (
      item.planName?.toLowerCase().includes(query) ||
      item.amount.toString().includes(query) ||
      item.status?.toLowerCase().includes(query) ||
      (item.startDate && item.startDate.toLowerCase().includes(query)) ||
      (item.date && item.date.toLowerCase().includes(query))
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderTableHeaders = () => {
    if (activeTab === "subscriptions") {
      return (
        <>
          <th>Plan Name</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Start Date</th>
          <th>Payment Method</th>
        </>
      );
    } else {
      return (
        <>
          <th>Plan Name</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
          <th>Receipt</th>
        </>
      );
    }
  };

  const renderTableRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={activeTab === "orderHistory" ? 5 : 5} className="loading-cell">
            Loading...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={activeTab === "orderHistory" ? 5 : 5} className="error-cell">
            Error: {error}
          </td>
        </tr>
      );
    }

    if (paginatedItems.length === 0) {
      return (
        <tr>
          <td colSpan={activeTab === "orderHistory" ? 5 : 5} className="empty-cell">
            No matching results found.
          </td>
        </tr>
      );
    }

    return paginatedItems.map((item, index) => {
      if (activeTab === "subscriptions") {
        return (
          <tr key={index}>
            <td>{item.planName || "N/A"}</td>
            <td>€{item.amount || "0.00"}</td>
            <td>
              <span
                className={`status-badge ${
                  item.status?.toLowerCase() || "pending"
                }`}
              >
                {item.status || "Pending"}
              </span>
            </td>
            <td>{item.startDate || "N/A"}</td>
            <td>{item.paymentMethod || "N/A"}</td>
          </tr>
        );
      } else {
        return (
          <tr key={index}>
            <td>{item.planName || "N/A"}</td>
            <td>€{item.amount || "0.00"}</td>
            <td>
              <span
                className={`status-badge ${
                  item.status?.toLowerCase() || "pending"
                }`}
              >
                {item.status || "Pending"}
              </span>
            </td>
            <td>{item.date || "N/A"}</td>
            <td>
              <button
                onClick={() => downloadReceipt(item.id)}
                className="pdf-icon-btn"
                title="Download Receipt"
              >
                <HiOutlineDocumentDownload size={25} />
              </button>
            </td>
          </tr>
        );
      }
    });
  };

  return (
    <div className="subscription-container">
      <Breadcrumbs homePath={"/group_admin/dashboard"} />

      <h1>Subscription and Order History</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "subscriptions" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("subscriptions");
            setCurrentPage(1);
            setSearchQuery(""); // Reset search when switching tabs
          }}
        >
          Subscriptions
        </button>
        <button
          className={`tab ${activeTab === "orderHistory" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("orderHistory");
            setCurrentPage(1);
            setSearchQuery(""); // Reset search when switching tabs
          }}
        >
          Order History
        </button>
      </div>

      {/* Search Input */}
      <div className="search-filter mt-3 mb-3">
        <input
          type="text"
          placeholder="Search by Plan Name, Amount, Status, or Date..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Go to first page after search
          }}
          className="form-control"
        />
      </div>

      {/* Results info */}
      <div className="results-info mb-3">
        <span>
          {filteredItems.length}{" "}
          {activeTab === "subscriptions" ? "subscription(s)" : "order(s)"}
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table table table-bordered table-striped">
          <thead>
            <tr>{renderTableHeaders()}</tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &larr; Previous
          </button>

          <div className="page-numbers">
            {/* Show first page */}
            <button
              onClick={() => paginate(1)}
              className={`pagination-btn ${currentPage === 1 ? "active" : ""}`}
            >
              1
            </button>

            {/* Show ellipsis if needed */}
            {currentPage > 3 && <span className="ellipsis">...</span>}

            {/* Show adjacent pages */}
            {[currentPage - 1, currentPage + 1].map(
              (number) =>
                number > 1 &&
                number < totalPages && (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-btn ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                )
            )}

            {/* Show last page if needed */}
            {totalPages > 1 && (
              <button
                onClick={() => paginate(totalPages)}
                className={`pagination-btn ${
                  currentPage === totalPages ? "active" : ""
                }`}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionOrder;