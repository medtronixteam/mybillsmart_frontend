import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import "./SubscriptionOrder.css";

const SubscriptionOrder = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const { token } = useAuth();

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let endpoint = '';
        if (activeTab === 'subscriptions') {
          endpoint = `${config.BASE_URL}/api/group/subscription/history`;
        } else if (activeTab === 'orderHistory') {
          endpoint = `${config.BASE_URL}/api/group/order/history`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        
        // Extract data array from response and format it
        const data = result.data || [];
        const formattedData = data.map(item => {
          if (activeTab === 'subscriptions') {
            return {
              planName: item.plan_name,
              amount: parseFloat(item.amount).toFixed(2),
              status: item.status,
              startDate: new Date(item.start_date).toLocaleDateString(),
              paymentMethod: 'Credit Card' // Default since not in response
            };
          } else {
            return {
              planName: item.plan_name,
              amount: parseFloat(item.amount).toFixed(2),
              status: item.status,
              date: new Date(item.created_at).toLocaleDateString(),
              currency: item.currency
            };
          }
        });

        if (activeTab === 'subscriptions') {
          setSubscriptionData(formattedData);
        } else {
          setOrderData(formattedData);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
        if (activeTab === 'subscriptions') {
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Get current items based on active tab
  const currentItems = (activeTab === 'subscriptions' ? subscriptionData : orderData) || [];
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderTableHeaders = () => {
    if (activeTab === 'subscriptions') {
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
          <th>Currency</th>
          <th>Status</th>
          <th>Date</th>
        </>
      );
    }
  };

  const renderTableRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="loading-cell">
            Loading...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={5} className="error-cell">
            Error: {error}
          </td>
        </tr>
      );
    }

    if (paginatedItems.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="empty-cell">
            No data available
          </td>
        </tr>
      );
    }

    return paginatedItems.map((item, index) => {
      if (activeTab === 'subscriptions') {
        return (
          <tr key={index}>
            <td>{item.planName || 'N/A'}</td>
            <td>${item.amount || '0.00'}</td>
            <td>
              <span className={`status-badge ${item.status?.toLowerCase() || 'pending'}`}>
                {item.status || 'Pending'}
              </span>
            </td>
            <td>{item.startDate || 'N/A'}</td>
            <td>{item.paymentMethod || 'N/A'}</td>
          </tr>
        );
      } else {
        return (
          <tr key={index}>
            <td>{item.planName || 'N/A'}</td>
            <td>{item.amount || '0.00'}</td>
            <td>{item.currency?.toUpperCase() || 'N/A'}</td>
            <td>
              <span className={`status-badge ${item.status?.toLowerCase() || 'pending'}`}>
                {item.status || 'Pending'}
              </span>
            </td>
            <td>{item.date || 'N/A'}</td>
          </tr>
        );
      }
    });
  };

  return (
    <div className="subscription-container">
      <h1>Subscription and Order History</h1>
        
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('subscriptions');
            setCurrentPage(1);
          }}
        >
          Subscriptions
        </button>
        <button 
          className={`tab ${activeTab === 'orderHistory' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('orderHistory');
            setCurrentPage(1);
          }}
        >
          Order History
        </button>
      </div>
      
      <div className="results-header">
        <span>{currentItems.length} {activeTab === 'subscriptions' ? 'subscriptions' : 'orders'}</span>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      </div>
      
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
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