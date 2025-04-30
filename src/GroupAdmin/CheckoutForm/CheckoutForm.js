import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Swal from "sweetalert2";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./CheckoutForm.css";
import Breadcrumbs from "../../Breadcrumbs";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const {
    planDetails,
    clientSecret,
    paymentIntentId,
    amount = planDetails ? parseFloat(planDetails.price) * 100 : 0,
    currency = "usd",
  } = location.state || {};

  const displayAmount = (amount / 100).toFixed(2);
  const displayCurrency = currency.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: localStorage.getItem("userName") || "Customer",
            },
          },
        }
      );

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: error.message,
          confirmButtonColor: "#3085d6",
        });
      } else if (paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
        Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          text: "Your payment has been processed successfully.",
          confirmButtonColor: "#3085d6",
        });
        // await savePaymentRecord(paymentIntent, planDetails);
      }
    } catch (err) {
      console.error("Payment error:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Processing Failed",
        text: "An error occurred while processing your payment.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // const savePaymentRecord = async (paymentIntent, plan) => {
  //   try {
  //     await axios.post(
  //       `${config.BASE_URL}/api/save-payment`,
  //       {
  //         paymentId: paymentIntent.id,
  //         amount: paymentIntent.amount,
  //         currency: paymentIntent.currency,
  //         status: paymentIntent.status,
  //         planId: plan?.id,
  //         planName: plan?.name,
  //         customerName: localStorage.getItem('userName') || 'Customer',
  //       },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );
  //   } catch (err) {
  //     console.error('Failed to save payment record:', err);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Failed to Save Payment',
  //       text: 'Failed to save payment details to our records.',
  //       confirmButtonColor: '#3085d6',
  //     });
  //   }
  // };

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  if (!clientSecret) {
    return (
      <div className="payment-error">
        <h2>Payment Error</h2>
        <p>Missing payment information. Please select a plan again.</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
            <div className="icon-fix"></div>
          </div>
        </div>
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />
      </div>
      <div className="payment-form-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <h3>Payment Details</h3>
          {planDetails && (
            <div className="plan-summary">
              <h4>{planDetails.name}</h4>
              <p>
                ${displayAmount} {displayCurrency} per{" "}
                {planDetails.period || "month"}
              </p>
            </div>
          )}
          <div className="card-element-container">
            <CardElement options={cardStyle} />
          </div>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="payment-button"
          >
            {isProcessing ? "Processing..." : `Pay $${displayAmount}`}
          </button>
        </form>
      </div>
    </>
  );
};

export default CheckoutForm;
