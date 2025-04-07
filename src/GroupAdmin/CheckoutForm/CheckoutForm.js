import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
// import './Checkout.css';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const { planDetails, paymentData } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !paymentData?.clientSecret) {
      setMessage('Payment system not ready');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
    
      const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Customer Name'
          }
        }
      });

      if (result.error) {
        setMessage(`Payment failed: ${result.error.message}`);
      } else if (result.paymentIntent.status === 'succeeded') {
        setMessage('✅ Payment succeeded!');

      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!planDetails || !paymentData) {
    return (
      <div className="checkout-error">
        <h2>Invalid Checkout Session</h2>
        <p>Please select a plan first</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Complete Your {planDetails.name} Subscription</h2>
      <div className="order-summary">
        <p>Amount: ${planDetails.price}</p>
        <p>Billing Cycle: {planDetails.period}ly</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-element-wrapper">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="pay-button"
        >
          {isProcessing ? 'Processing...' : `Pay $${planDetails.price}`}
        </button>

        {message && (
          <div className={`payment-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;