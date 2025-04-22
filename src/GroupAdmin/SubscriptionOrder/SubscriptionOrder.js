import React, { useState } from 'react';
import "./SubscriptionOrder.css";

const SubscriptionOrder = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  
  const data = {
    subscriptions: [
      {
        id: 1,
        description: "Microsoft 365 Email Essentials Free Trial",
        billingDate: "Auto Renews 03/07/2025",
        paymentMethod: "MasterCard ****7040 Exp 9/2025"
      },
      {
        id: 2,
        description: "Microsoft 365 Business Standard",
        billingDate: "Auto Renews 15/07/2025",
        paymentMethod: "Visa ****4231 Exp 12/2025"
      },
      {
        id: 3,
        description: "Adobe Creative Cloud",
        billingDate: "Auto Renews 01/08/2025",
        paymentMethod: "MasterCard ****5566 Exp 5/2026"
      },
      {
        id: 4,
        description: "Spotify Premium",
        billingDate: "Auto Renews 05/07/2025",
        paymentMethod: "PayPal"
      }
    ],
    orderHistory: [
      {
        id: 1,
        orderNumber: "ORD-2023-001",
        date: "15/06/2023",
        amount: "$99.00",
        status: "Completed"
      },
      {
        id: 2,
        orderNumber: "ORD-2023-002",
        date: "20/06/2023",
        amount: "$149.00",
        status: "Completed"
      }
    ],
    paymentMethods: [
      {
        id: 1,
        cardType: "MasterCard",
        lastFour: "7040",
        expiry: "09/2025",
        primary: true
      },
      {
        id: 2,
        cardType: "Visa",
        lastFour: "4231",
        expiry: "12/2025",
        primary: false
      }
    ]
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const currentItems = data[activeTab];
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'subscriptions':
        return (
          <>
            <th>Description</th>
            <th>Billing Date</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </>
        );
      case 'orderHistory':
        return (
          <>
            <th>Order Number</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </>
        );
      case 'paymentMethods':
        return (
          <>
            <th>Card Type</th>
            <th>Card Number</th>
            <th>Expiry Date</th>
            <th>Primary</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return currentItems.map((item) => {
      switch (activeTab) {
        case 'subscriptions':
          return (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.billingDate}</td>
              <td>{item.paymentMethod}</td>
              <td>
                <button className="action-btn">Manage</button>
              </td>
            </tr>
          );
        case 'orderHistory':
          return (
            <tr key={item.id}>
              <td>{item.orderNumber}</td>
              <td>{item.date}</td>
              <td>{item.amount}</td>
              <td>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          );
        case 'paymentMethods':
          return (
            <tr key={item.id}>
              <td>{item.cardType}</td>
              <td>**** **** **** {item.lastFour}</td>
              <td>{item.expiry}</td>
              <td>
                {item.primary ? (
                  <span className="primary-badge">Primary</span>
                ) : (
                  <button className="make-primary-btn">Make Primary</button>
                )}
              </td>
            </tr>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="subscription-container">
      <h1>Manage your Billing</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
        <button 
          className={`tab ${activeTab === 'orderHistory' ? 'active' : ''}`}
          onClick={() => setActiveTab('orderHistory')}
        >
          Order History
        </button>
        <button 
          className={`tab ${activeTab === 'paymentMethods' ? 'active' : ''}`}
          onClick={() => setActiveTab('paymentMethods')}
        >
          Payment Methods
        </button>
      </div>
      
      {/* <div className="results-header">
        <span>{currentItems.length} {activeTab === 'subscriptions' ? 'subscriptions' : 
              activeTab === 'orderHistory' ? 'orders' : 'payment methods'}</span>
      </div> */}
      
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
}

export default SubscriptionOrder;