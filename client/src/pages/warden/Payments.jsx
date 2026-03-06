import { useEffect, useState } from "react";
import api from "../../services/api";
import "./WardenPayments.css";

const WardenPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, statusFilter, payments]);

  const loadPayments = async () => {
    try {
      const res = await api.get("/payments/all");
      setPayments(res.data);
      setFilteredPayments(res.data);
    } catch (err) {
      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = payments;

    if (search) {
      data = data.filter(
        (p) =>
          p.student?.fullName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          p.student?.rollNumber
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((p) => p.paymentStatus === statusFilter);
    }

    setFilteredPayments(data);
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const paidCount = payments.filter(
    (p) => p.paymentStatus === "Paid"
  ).length;

  const pendingCount = payments.length - paidCount;

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h2>Student Payments</h2>
        <p>Complete overview of all hostel fee payments</p>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Payments</h4>
          <p>{payments.length}</p>
        </div>

        <div className="stat-card">
          <h4>Total Amount</h4>
          <p>₹{totalAmount.toLocaleString()}</p>
        </div>

        <div className="stat-card paid">
          <h4>Paid</h4>
          <p>{paidCount}</p>
        </div>

        <div className="stat-card pending">
          <h4>Pending</h4>
          <p>{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or roll..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loader">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty">No payment records found</div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
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
              {filteredPayments.map((p, index) => (
                <tr key={p._id}>
                  <td>{index + 1}</td>
                  <td>{p.student?.fullName || "N/A"}</td>
                  <td>{p.student?.rollNumber || "N/A"}</td>
                  <td className="amount">
                    ₹{p.amount.toLocaleString()}
                  </td>
                  <td>{p.academicYear}</td>
                  <td>
                    <span
                      className={`status ${
                        p.paymentStatus === "Paid"
                          ? "paid"
                          : "pending"
                      }`}
                    >
                      {p.paymentStatus}
                    </span>
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
    </div>
  );
};

export default WardenPayments;
