// ============================================================
// utils/sendEmail.js
// ============================================================
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html, text = "") => {
  const { data, error } = await resend.emails.send({
    from: "HostelEase <noreply@hostelease.online>",   // ✅ updated
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ""),
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  return data;
};

// ─── Password Reset Email ─────────────────────────────────────
const buildResetEmail = (resetLink, userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563EB,#1D4ED8);
                        padding:32px 40px;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">🏠</div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;
                          letter-spacing:-0.5px;">HostelEase</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                Hostel Management System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:700;">
                Reset Your Password
              </h2>
              <p style="color:#6B7280;line-height:1.65;margin:0 0 24px;font-size:14px;">
                Hi <strong style="color:#111827;">${userName}</strong>, we received a request 
                to reset your HostelEase password. Click the button below to set a new password.
                This link expires in <strong>15 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                   style="background:#2563EB;color:#fff;text-decoration:none;
                          padding:14px 36px;border-radius:10px;font-size:15px;
                          font-weight:700;display:inline-block;
                          box-shadow:0 4px 12px rgba(37,99,235,0.35);">
                  Reset My Password →
                </a>
              </div>

              <!-- Security note -->
              <div style="background:#F8FAFF;border:1px solid #E8EEFF;
                           border-radius:10px;padding:14px 16px;margin-bottom:20px;">
                <p style="margin:0;color:#6B7280;font-size:12px;line-height:1.6;">
                  🔒 <strong>Security note:</strong> If you didn't request this reset,
                  you can safely ignore this email. Your password will not change.
                </p>
              </div>

              <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0;">
                Or copy and paste this link in your browser:<br/>
                <a href="${resetLink}" style="color:#2563EB;word-break:break-all;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFF;padding:18px 40px;text-align:center;
                        border-top:1px solid #E5E7EB;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;">
                © ${new Date().getFullYear()} HostelEase ·
                <a href="${process.env.FRONTEND_URL || "https://hostelease.online"}"
                   style="color:#2563EB;text-decoration:none;">hostelease.online</a>
              </p>
              <p style="margin:6px 0 0;color:#D1D5DB;font-size:11px;">
                This email was sent to you because a password reset was requested for your account.
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

// ─── Leave Status Email ───────────────────────────────────────
const buildLeaveStatusEmail = (studentName, status, leaveType, reason) => {
  const isApproved = status === "Approved";
  const headerGrad = isApproved
    ? "linear-gradient(135deg,#059669,#047857)"
    : "linear-gradient(135deg,#DC2626,#B91C1C)";
  const accentColor = isApproved ? "#059669" : "#DC2626";
  const icon = isApproved ? "✅" : "❌";

  return `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#F4F5F7;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${headerGrad};padding:28px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">
              Leave ${status}
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
              HostelEase · Hostel Management
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#111827;font-size:15px;margin:0 0 12px;">
              Hi <strong>${studentName}</strong>,
            </p>
            <p style="color:#6B7280;line-height:1.65;font-size:14px;margin:0 0 20px;">
              Your <strong style="color:#111827;">${leaveType} Leave</strong> request has been
              <strong style="color:${accentColor};">${status}</strong>${isApproved ? " by the warden." : "."}
            </p>

            ${!isApproved && reason ? `
            <div style="background:#FEF2F2;border-left:4px solid #DC2626;
                         border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
              <div style="font-size:11px;font-weight:700;color:#DC2626;
                           text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;">
                Warden Remark
              </div>
              <p style="margin:0;color:#991B1B;font-size:14px;line-height:1.5;">${reason}</p>
            </div>
            ` : ""}

            ${isApproved ? `
            <div style="background:#ECFDF5;border-left:4px solid #059669;
                         border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
              <p style="margin:0;color:#065F46;font-size:13px;line-height:1.5;">
                Your leave has been approved. Please ensure you follow hostel check-out procedures before leaving.
              </p>
            </div>
            ` : ""}

            <div style="text-align:center;margin-top:28px;">
              <a href="${process.env.FRONTEND_URL || "https://hostelease.online"}/student/leave-status"
                 style="background:#2563EB;color:#fff;text-decoration:none;
                        padding:12px 28px;border-radius:10px;font-size:14px;
                        font-weight:700;display:inline-block;">
                View Leave Status
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFF;padding:16px 40px;text-align:center;
                      border-top:1px solid #E5E7EB;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;">
              © ${new Date().getFullYear()} HostelEase ·
              <a href="${process.env.FRONTEND_URL || "https://hostelease.online"}"
                 style="color:#2563EB;text-decoration:none;">hostelease.online</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;
};

module.exports = { sendEmail, buildResetEmail, buildLeaveStatusEmail };