import { useEffect, useState } from "react";
import api from "../../services/api";

const WardenPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await api.get("/payments/all");
      setPayments(res.data);
    } catch (err) {
      alert("Failed to load payments");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>💼 Student Payments Overview</h2>

      {payments.length === 0 ? (
        <p>No payment records found</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Amount</th>
              <th>Academic Year</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Receipt</th>
              <th>Paid Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{p.student?.fullName}</td>
                <td>{p.student?.rollNumber}</td>
                <td>₹{p.amount}</td>
                <td>{p.academicYear}</td>
                <td
                  style={{
                    color: p.paymentStatus === "Paid" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {p.paymentStatus}
                </td>
                <td>{p.paymentMode}</td>
                <td>{p.receiptNumber || "-"}</td>
                <td>
                  {p.paidDate
                    ? new Date(p.paidDate).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WardenPayments;
