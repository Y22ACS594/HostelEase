import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ForgotPassword = () => {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [msg,    setMsg]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading"); setMsg("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "Reset link sent!");
      setStatus("success");
    } catch {
      setMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div style={{
      display:"flex", minHeight:"100vh",
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      background:"#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::placeholder { color:#9CA3AF; font-size:14px; }
        @keyframes fp-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes fp-spin { to{transform:rotate(360deg)} }
        .fp-field:focus-within { border-color:#111827!important; box-shadow:0 0 0 3px rgba(17,24,39,0.08)!important; }
        .fp-back:hover { color:#111827!important; }
        .fp-btn-primary:hover:not(:disabled) { background:#1F2937!important; }
      `}</style>

      {/* ── LEFT panel ──────────────────────────────── */}
      <div style={{
        flex:1, padding:"48px 56px",
        background:"linear-gradient(145deg,#F0FDF4 0%,#EFF6FF 55%,#F5F3FF 100%)",
        display:"flex", flexDirection:"column",
        borderRight:"1px solid #F3F4F6",
      }}>
        

        {/* Brand + tagline */}
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
          <div style={{ width:48,height:48,borderRadius:14,
            background:"#111827",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:20,color:"#fff" }}>
            🔑
          </div>
          <div>
            <div style={{ fontSize:30,fontWeight:700,color:"#111827" }}>HostelEase</div>
            <div style={{ fontSize:13,color:"#6B7280" }}>Account recovery</div>
          </div>
        </div>

        <h1 style={{ fontSize:85,fontWeight:800,color:"#111827",
          letterSpacing:"-1px",lineHeight:1.1,marginBottom:19 }}>
          Forgot Password?
        </h1>
        <p style={{ fontSize:16,color:"#6B7280",lineHeight:1.65,
          maxWidth:380,marginBottom:40 }}>
          No stress. Enter your registered email and we'll send you a secure reset link.
        </p>

        {/* Security note card */}
        <div style={{ background:"rgba(255,255,255,0.72)",border:"1px solid rgba(255,255,255,0.9)",
          borderRadius:16,padding:"18px 20px",backdropFilter:"blur(8px)",
          maxWidth:440,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize:11,fontWeight:800,color:"#2563EB",
              textTransform:"uppercase",letterSpacing:"0.1em" }}>
              Security Note
            </span>
          </div>
          <p style={{ fontSize:14,color:"#374151",lineHeight:1.6 }}>
            If the email exists, you'll receive a reset link. Otherwise, we won't reveal account details.
          </p>
        </div>

      
      </div>

      {/* ── RIGHT panel ─────────────────────────────── */}
      <div style={{ width:500,padding:"48px 52px",
        display:"flex",flexDirection:"column",justifyContent:"center",
        animation:"fp-fade .4s ease both" }}>

        {status !== "success" ? (
          <>
            <div style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",
              textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8 }}>
              Forgot Password
            </div>
            <h2 style={{ fontSize:28,fontWeight:800,color:"#111827",
              letterSpacing:"-0.5px",marginBottom:6 }}>
              Reset password
            </h2>
            <p style={{ fontSize:14,color:"#9CA3AF",marginBottom:32 }}>
              We'll email you a reset link
            </p>

            {/* Error */}
            {status==="error" && (
              <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",
                borderRadius:12,padding:"10px 14px",marginBottom:20,
                fontSize:13,color:"#991B1B",fontWeight:500,
                display:"flex",alignItems:"center",gap:8 }}>
                ⚠️ {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email label */}
              <label style={{ fontSize:14,fontWeight:600,color:"#111827",
                display:"block",marginBottom:8 }}>
                Email
              </label>

              {/* Email field */}
              <div className="fp-field"
                style={{ display:"flex",alignItems:"center",
                  border:"1.5px solid #D1D5DB",borderRadius:10,
                  background:"#fff",overflow:"hidden",
                  transition:"border-color .15s,box-shadow .15s",
                  marginBottom:6 }}>
                <span style={{ padding:"0 14px",color:"#9CA3AF",flexShrink:0,
                  display:"flex",alignItems:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <div style={{ width:1,height:22,background:"#E5E7EB",flexShrink:0 }}/>
                <input type="email" value={email}
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required autoComplete="email"
                  style={{ flex:1,padding:"13px 14px",border:"none",outline:"none",
                    fontSize:14,color:"#111827",background:"transparent",
                    fontFamily:"'Inter',sans-serif" }}/>
              </div>

              <p style={{ fontSize:12,color:"#9CA3AF",marginBottom:28 }}>
                Use the email you registered with HostelEase.
              </p>

              {/* Submit */}
              <button type="submit" disabled={status==="loading"} className="fp-btn-primary"
                style={{ width:"100%",padding:"14px",
                  background:status==="loading"?"#374151":"#111827",
                  color:"#fff",border:"none",borderRadius:12,
                  fontSize:14,fontWeight:700,cursor:status==="loading"?"not-allowed":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  fontFamily:"'Inter',sans-serif",transition:"background .15s",
                  boxShadow:"0 4px 12px rgba(0,0,0,0.15)",letterSpacing:"0.01em" }}>
                {status==="loading" ? (
                  <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.35)",
                    borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                    animation:"fp-spin .7s linear infinite" }}/>
                  Sending…</>
                ) : <>Send Reset Link →</>}
              </button>
            </form>

            {/* Footer links */}
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",marginTop:24 }}>
              <Link to="/login" className="fp-back"
                style={{ display:"flex",alignItems:"center",gap:6,
                  fontSize:13,color:"#6B7280",textDecoration:"none",
                  fontWeight:500,transition:"color .14s" }}>
                ← Back to login
              </Link>
              
            </div>

            {/* Tip */}
            <p style={{ marginTop:32,fontSize:12,color:"#D1D5DB",
              textAlign:"center",lineHeight:1.5 }}>
              Tip: check spam/junk folder if you don't receive the email in 1–2 minutes.
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <div style={{ textAlign:"center",animation:"fp-fade .4s ease both" }}>
            <div style={{ width:72,height:72,borderRadius:"50%",
              background:"#ECFDF5",border:"2px solid #6EE7B7",
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto 24px",fontSize:30 }}>
              ✅
            </div>
            <div style={{ fontSize:11,fontWeight:700,color:"#059669",
              textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10 }}>
              Email Sent
            </div>
            <h2 style={{ fontSize:26,fontWeight:800,color:"#111827",
              letterSpacing:"-0.4px",marginBottom:10 }}>
              Check your inbox
            </h2>
            <p style={{ fontSize:14,color:"#6B7280",lineHeight:1.6,
              marginBottom:6 }}>
              We've sent a password reset link to:
            </p>
            <div style={{ fontSize:15,fontWeight:700,color:"#111827",marginBottom:24 }}>
              {email}
            </div>
            <div style={{ background:"#F9FAFB",border:"1px solid #E5E7EB",
              borderRadius:14,padding:"16px 18px",marginBottom:28,
              fontSize:13,color:"#6B7280",lineHeight:1.6,textAlign:"left" }}>
              Click the link in the email to reset your password.
              If you don't see it, <strong style={{ color:"#374151" }}>check your spam folder.</strong>
              The link expires in <strong style={{ color:"#374151" }}>15 minutes.</strong>
            </div>
            <button onClick={()=>{setStatus("idle");setEmail("");setMsg("");}}
              style={{ width:"100%",padding:"13px",background:"#111827",
                color:"#fff",border:"none",borderRadius:12,
                fontSize:14,fontWeight:700,cursor:"pointer",
                fontFamily:"'Inter',sans-serif",marginBottom:14,
                boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
              Send again
            </button>
            <Link to="/login"
              style={{ fontSize:13,color:"#6B7280",textDecoration:"none",
                fontWeight:500,display:"block",textAlign:"center" }}>
              ← Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;