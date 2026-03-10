// ============================================================
// utils/sendEmail.js
// Req 3: Replace Nodemailer with Resend
// ============================================================
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a transactional email via Resend
 * @param {string}  to       - Recipient email
 * @param {string}  subject  - Email subject
 * @param {string}  html     - HTML body (use buildResetEmail helper below)
 * @param {string}  [text]   - Plain-text fallback
 */
const sendEmail = async (to, subject, html, text = "") => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "SmartHostel <noreply@smarthostel.in>",
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ""),  // strip HTML as fallback
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  return data;
};

// ─── Email Templates ──────────────────────────────────────────

/**
 * Build the password-reset email HTML
 * @param {string} resetLink  - Full reset URL
 * @param {string} userName   - Student's name
 */
const buildResetEmail = (resetLink, userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">
                🏠 SmartHostel
              </h1>
              <p style="margin:6px 0 0;color:#e0e7ff;font-size:14px;">
                Hostel Management System
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">
                Password Reset Request
              </h2>
              <p style="color:#64748b;line-height:1.6;margin:0 0 24px;">
                Hi <strong>${userName}</strong>, we received a request to reset
                your SmartHostel password. Click the button below to set a new
                password. This link expires in <strong>15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                   style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                          color:#fff;text-decoration:none;padding:14px 32px;
                          border-radius:8px;font-size:15px;font-weight:600;
                          display:inline-block;">
                  Reset My Password
                </a>
              </div>
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email.
                Your password will not change unless you click the link above.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;
                        border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} SmartHostel · 
                <a href="${process.env.FRONTEND_URL}"
                   style="color:#6366f1;text-decoration:none;">smarthostel.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Build leave-status notification email
 */
const buildLeaveStatusEmail = (studentName, status, leaveType, reason) => `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${status === "Approved" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"};
                      padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:20px;">
              ${status === "Approved" ? "✅" : "❌"} Leave ${status}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#1e293b;font-size:15px;line-height:1.6;">
              Hi <strong>${studentName}</strong>,
            </p>
            <p style="color:#475569;line-height:1.6;">
              Your <strong>${leaveType}</strong> leave request has been
              <strong style="color:${status === "Approved" ? "#059669" : "#dc2626"};">
                ${status}
              </strong>
              ${status === "Rejected" && reason ? `for the following reason:<br/><br/>
              <em style="background:#fef2f2;border-left:3px solid #ef4444;
                          padding:8px 12px;display:block;border-radius:4px;">
                ${reason}
              </em>` : "."}
            </p>
            <p style="color:#94a3b8;font-size:13px;margin-top:24px;">
              Log in to your SmartHostel portal for more details.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

module.exports = { sendEmail, buildResetEmail, buildLeaveStatusEmail };
