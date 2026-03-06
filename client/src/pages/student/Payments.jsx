import { useEffect, useState } from "react";
import {
  getMyPayments,
  initiatePayment,
  confirmPayment,
} from "../../services/paymentService";
import "./Payments.css";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const res = await getMyPayments();
    setPayments(res.data);
  };

  const startPayment = async () => {
    setProcessing(true);

    const res = await initiatePayment({
      amount: 25000,
      academicYear: "2025-26",
      paymentMode,
    });

    // Simulated gateway processing
    setTimeout(async () => {
      await confirmPayment(res.data._id);
      await loadPayments();
      setProcessing(false);
      setShowModal(false);
      alert("✅ Payment Successful");
    }, 2000);
  };

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1>Hostel Fee Payments</h1>
        <p>Pay your hostel fees securely</p>
      </div>

      <div className="pay-card">
        <h2>₹25,000</h2>
        <p>Academic Year 2025–26</p>
        <button className="pay-btn" onClick={() => setShowModal(true)}>
          Pay Now
        </button>
      </div>

      <h3 className="history-title">Payment History</h3>

      <div className="payment-table">
        {payments.length === 0 && (
          <p className="empty">No payments found</p>
        )}

        {payments.map((p) => (
          <div className="payment-row" key={p._id}>
            <span>₹{p.amount}</span>
            <span>{p.paymentMode}</span>
            <span className={`status ${p.paymentStatus.toLowerCase()}`}>
              {p.paymentStatus}
            </span>
            <span>{p.receiptNumber || "-"}</span>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h2>Complete Payment</h2>
            <p className="amount">₹25,000</p>

            <div className="modes">
              {["UPI", "Card", "NetBanking"].map((mode) => (
                <div
                  key={mode}
                  className={`mode-card ${
                    paymentMode === mode ? "active" : ""
                  }`}
                  onClick={() => setPaymentMode(mode)}
                >
                  {mode}
                </div>
              ))}
            </div>

            <button
              className="confirm-btn"
              onClick={startPayment}
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm & Pay"}
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowModal(false)}
              disabled={processing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
