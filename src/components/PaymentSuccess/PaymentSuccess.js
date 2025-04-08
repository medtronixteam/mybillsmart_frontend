import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'react-bootstrap-icons';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card">
            <div className="card-body p-5">
              <CheckCircle color="green" size={48} className="mb-3" />
              <h2 className="mb-3">Payment Successful!</h2>
              <p className="lead mb-4">Your transaction has been completed successfully.</p>
              <button 
                onClick={() => navigate('/group_admin/dashboard')}
                className="btn btn-primary"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;