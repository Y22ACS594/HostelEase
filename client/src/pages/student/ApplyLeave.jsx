import { useState } from "react";
import { applyLeave } from "../../services/leaveService";
import "./ApplyLeave.css";

const ApplyLeave = () => {

  const [form, setForm] = useState({
    leaveType: "Casual",
    fromDate: "",
    toDate: "",
    destination: "",
    reason: "",
    emergencyContact: ""
  });

  const [days, setDays] = useState(0);
  const [message, setMessage] = useState("");

  // calculate leave days
  const calculateDays = (from, to) => {

    if (!from || !to) {
      setDays(0);
      return;
    }

    const start = new Date(from);
    const end = new Date(to);

    if (end < start) {
      setDays(0);
      return;
    }

    const diff =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    setDays(diff);
  };


  const handleChange = (e) => {

    const { name, value } = e.target;

    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);

    calculateDays(updatedForm.fromDate, updatedForm.toDate);

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (days === 0) {
      setMessage("❌ Invalid leave dates");
      return;
    }

    try {

      await applyLeave(form);

      setMessage("✅ Leave submitted successfully");

      setForm({
        leaveType: "Casual",
        fromDate: "",
        toDate: "",
        destination: "",
        reason: "",
        emergencyContact: ""
      });

      setDays(0);

    } catch (err) {

      setMessage("❌ Failed to submit leave");

    }

  };


  return (

    <div className="leave-container">

      <div className="leave-card">

        <h2 className="title">New Leave Request</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Leave Type</label>

            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
            >
              <option>Casual</option>
              <option>Medical</option>
              <option>Emergency</option>
            </select>

          </div>


          <div className="date-row">

            <div className="form-group">

              <label>From Date</label>

              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>To Date</label>

              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <div className="form-group">

            <label>Destination</label>

            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Where are you going?"
              required
            />

          </div>


          <div className="form-group">

            <label>Reason</label>

            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Write reason..."
              required
            />

          </div>


          <div className="form-group">

            <label>Emergency Contact</label>

            <input
              type="text"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              placeholder="Parent / Guardian number"
              required
            />

          </div>


          <button type="submit" className="apply-btn">

            {days > 0
              ? `Apply for ${days} Days Leave`
              : "Apply Leave"}

          </button>

        </form>

        {message && <p className="msg">{message}</p>}

      </div>

    </div>

  );

};

export default ApplyLeave;