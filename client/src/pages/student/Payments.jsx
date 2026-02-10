import { useEffect, useState } from "react";
import {
  getMyPayments,
  initiatePayment,
  confirmPayment,
} from "../../services/paymentService";

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

    // ⏳ simulate Razorpay processing delay
    setTimeout(async () => {
      await confirmPayment(res.data._id);
      await loadPayments();
      setProcessing(false);
      setShowModal(false);
      alert("✅ Payment Successful");
    }, 2000);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>
      <h2>💳 Hostel Fee Payments</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowModal(true)}>
          Pay Hostel Fee
        </button>
      </div>

      {/* PAYMENT HISTORY */}
      <h3>Payment History</h3>
      {payments.length === 0 && <p>No payments found</p>}

      <ul>
        {payments.map((p) => (
          <li key={p._id} style={{ marginBottom: "10px" }}>
            <strong>₹{p.amount}</strong> | {p.paymentStatus}
            <br />
            {p.receiptNumber && (
              <small>Receipt: {p.receiptNumber}</small>
            )}
          </li>
        ))}
      </ul>

      {/* PAYMENT MODAL */}
      {showModal && (
        <div style={modalStyle}>
          <div style={modalContent}>
            <h3>HostelEase Payments</h3>
            <p><strong>Amount:</strong> ₹25,000</p>
            <p><strong>Academic Year:</strong> 2025–26</p>

            <div>
              <label>
                <input
                  type="radio"
                  value="UPI"
                  checked={paymentMode === "UPI"}
                  onChange={() => setPaymentMode("UPI")}
                />
                UPI
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  value="Card"
                  checked={paymentMode === "Card"}
                  onChange={() => setPaymentMode("Card")}
                />
                Card
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  value="NetBanking"
                  checked={paymentMode === "NetBanking"}
                  onChange={() => setPaymentMode("NetBanking")}
                />
                Net Banking
              </label>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button onClick={startPayment} disabled={processing}>
                {processing ? "Processing..." : "Confirm Payment"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ marginLeft: "10px" }}
                disabled={processing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

/* ---------------- STYLES ---------------- */

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContent = {
  background: "#fff",
  padding: "25px",
  borderRadius: "8px",
  width: "350px",
};
