import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [form, setForm]         = useState({ password:"", confirmPassword:"" });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [status,   setStatus]   = useState("idle");
  const [msg,      setMsg]      = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const strength = (pw) => {
    let s = 0;
    if (pw.length >= 8)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0-4
  };

  const pw = form.password;
  const s  = strength(pw);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][s];
  const strengthColor = ["#E5E7EB","#DC2626","#D97706","#2563EB","#059669"][s];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus("error"); setMsg("Passwords do not match"); return;
    }
    if (form.password.length < 8) {
      setStatus("error"); setMsg("Password must be at least 8 characters"); return;
    }
    setStatus("loading"); setMsg("");
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setStatus("success");
    } catch {
      setStatus("error"); setMsg("Reset link expired or invalid. Request a new one.");
    }
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ background:"none",border:"none",cursor:"pointer",
        padding:"0 14px",color:"#9CA3AF",display:"flex",alignItems:"center",
        transition:"color .14s",flexShrink:0 }}
      onMouseEnter={e=>e.currentTarget.style.color="#374151"}
      onMouseLeave={e=>e.currentTarget.style.color="#9CA3AF"}>
      {show ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <path d="m2 2 20 20"/>
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

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
        @keyframes rp-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes rp-spin { to{transform:rotate(360deg)} }
        .rp-field { display:flex;align-items:center;border:1.5px solid #D1D5DB;border-radius:10px;background:#fff;overflow:hidden;transition:border-color .15s,box-shadow .15s;margin-bottom:14px; }
        .rp-field:focus-within { border-color:#111827!important; box-shadow:0 0 0 3px rgba(17,24,39,0.08)!important; }
        .rp-field-icon { padding:0 14px;color:#9CA3AF;flex-shrink:0;display:flex;align-items:center; }
        .rp-divider { width:1px;height:22px;background:#E5E7EB;flex-shrink:0; }
        .rp-bare-input { flex:1;padding:13px 14px;border:none;outline:none;font-size:14px;color:#111827;background:transparent;font-family:'Inter',sans-serif; }
        .rp-btn-primary:hover:not(:disabled) { background:#1F2937!important; }
        .rp-back:hover { color:#111827!important; }
      `}</style>

      {/* ── LEFT panel ──────────────────────────────── */}
      <div style={{
        flex:1, padding:"48px 56px",
        background:"linear-gradient(145deg,#F5F3FF 0%,#EFF6FF 55%,#F0FDF4 100%)",
        display:"flex", flexDirection:"column",
        borderRight:"1px solid #F3F4F6",
      }}>
       
        {/* Brand row */}
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
          <div style={{ width:52,height:52,borderRadius:16,
            background:"linear-gradient(135deg,#7C3AED,#6D28D9)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>
            🔐
          </div>
          <div>
            <div style={{ fontSize:30,fontWeight:700,color:"#111827" }}>HostelEase</div>
            <div style={{ fontSize:13,color:"#6B7280" }}>Password recovery</div>
          </div>
        </div>

        <h1 style={{ fontSize:75,fontWeight:800,color:"#111827",
          letterSpacing:"-1px",lineHeight:1.1,marginBottom:16 }}>
          Set new Password
        </h1>
        <p style={{ fontSize:16,color:"#6B7280",lineHeight:1.65,
          maxWidth:380,marginBottom:40 }}>
          Your new password should be different from passwords previously used.
        </p>

        {/* Tips card */}
        <div style={{ background:"rgba(255,255,255,0.72)",border:"1px solid rgba(255,255,255,0.9)",
          borderRadius:16,padding:"18px 20px",backdropFilter:"blur(8px)",
          maxWidth:440,boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize:11,fontWeight:800,color:"#7C3AED",
              textTransform:"uppercase",letterSpacing:"0.1em" }}>
              Password Tips
            </span>
          </div>
          {["At least 8 characters long",
            "Include uppercase & lowercase letters",
            "Add numbers and special characters"
          ].map((t,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:8,
              marginBottom:i<2?8:0 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",
                background:"#7C3AED",flexShrink:0 }}/>
              <span style={{ fontSize:13,color:"#374151" }}>{t}</span>
            </div>
          ))}
        </div>

        
      </div>

      {/* ── RIGHT panel ─────────────────────────────── */}
      <div style={{ width:500,padding:"48px 52px",
        display:"flex",flexDirection:"column",justifyContent:"center",
        animation:"rp-fade .4s ease both" }}>

        {status !== "success" ? (
          <>
            <div style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",
              textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8 }}>
              Reset Password
            </div>
            <h2 style={{ fontSize:28,fontWeight:800,color:"#111827",
              letterSpacing:"-0.5px",marginBottom:6 }}>
              Set your new password
            </h2>
            <p style={{ fontSize:14,color:"#9CA3AF",marginBottom:32 }}>
              Your new password should be different from passwords previously used.
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

              {/* Password */}
              <label style={{ fontSize:14,fontWeight:600,color:"#111827",
                display:"block",marginBottom:8 }}>
                Password
              </label>
              <div className="rp-field">
                <span className="rp-field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <div className="rp-divider"/>
                <input type={showPass?"text":"password"} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="New password" required autoComplete="new-password"
                  className="rp-bare-input"
                  style={{ letterSpacing:showPass?"normal":"0.1em",
                    fontSize:showPass?14:16 }}/>
                <EyeBtn show={showPass} toggle={()=>setShowPass(p=>!p)}/>
              </div>

              {/* Strength bar */}
              {pw.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  <div style={{ display:"flex",gap:4,marginBottom:5 }}>
                    {[1,2,3,4].map(i=>(
                      <div key={i} style={{ flex:1,height:3,borderRadius:100,
                        background:i<=s?strengthColor:"#E5E7EB",
                        transition:"background .25s" }}/>
                    ))}
                  </div>
                  {strengthLabel && (
                    <span style={{ fontSize:11,fontWeight:600,color:strengthColor }}>
                      {strengthLabel} password
                    </span>
                  )}
                </div>
              )}

              {/* Confirm password */}
              <label style={{ fontSize:14,fontWeight:600,color:"#111827",
                display:"block",marginBottom:8 }}>
                Confirm your new password
              </label>
              <div className="rp-field">
                <span className="rp-field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <div className="rp-divider"/>
                <input type={showConf?"text":"password"} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Confirm password" required autoComplete="new-password"
                  className="rp-bare-input"
                  style={{ letterSpacing:showConf?"normal":"0.1em",
                    fontSize:showConf?14:16 }}/>
                <EyeBtn show={showConf} toggle={()=>setShowConf(p=>!p)}/>
              </div>

              {/* Match indicator */}
              {form.confirmPassword.length > 0 && (
                <div style={{ fontSize:12,fontWeight:600,marginBottom:20,
                  color: form.password===form.confirmPassword ? "#059669" : "#DC2626" }}>
                  {form.password===form.confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                </div>
              )}

              <p style={{ fontSize:12,color:"#9CA3AF",marginBottom:24 }}>
                Password should be at least 8 characters long.
              </p>

              {/* Submit */}
              <button type="submit" disabled={status==="loading"} className="rp-btn-primary"
                style={{ width:"100%",padding:"14px",
                  background:status==="loading"?"#374151":"#111827",
                  color:"#fff",border:"none",borderRadius:12,
                  fontSize:14,fontWeight:700,cursor:status==="loading"?"not-allowed":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  fontFamily:"'Inter',sans-serif",transition:"background .15s",
                  boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
                {status==="loading" ? (
                  <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.35)",
                    borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                    animation:"rp-spin .7s linear infinite" }}/>
                  Resetting…</>
                ) : "Confirm →"}
              </button>
            </form>

            <div style={{ display:"flex",justifyContent:"center",marginTop:20 }}>
              <Link to="/login" className="rp-back"
                style={{ display:"flex",alignItems:"center",gap:6,
                  fontSize:13,color:"#6B7280",textDecoration:"none",
                  fontWeight:500,transition:"color .14s" }}>
                ← Return to the login screen
              </Link>
            </div>
          </>
        ) : (
          /* ── Success state ── */
          <div style={{ textAlign:"center",animation:"rp-fade .4s ease both" }}>
            <div style={{ width:80,height:80,borderRadius:"50%",
              background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)",
              border:"2px solid #6EE7B7",
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto 28px",fontSize:36 }}>
              ✅
            </div>
            <div style={{ fontSize:11,fontWeight:700,color:"#059669",
              textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10 }}>
              Success
            </div>
            <h2 style={{ fontSize:28,fontWeight:800,color:"#111827",
              letterSpacing:"-0.5px",marginBottom:14 }}>
              Password Reset!
            </h2>
            <p style={{ fontSize:14,color:"#6B7280",lineHeight:1.65,
              maxWidth:340,margin:"0 auto 32px" }}>
              Your password has been successfully reset. Click below to continue to your account.
            </p>
            <button onClick={()=>navigate("/login")}
              style={{ width:"100%",padding:"14px",background:"#111827",
                color:"#fff",border:"none",borderRadius:12,
                fontSize:14,fontWeight:700,cursor:"pointer",
                fontFamily:"'Inter',sans-serif",marginBottom:16,
                boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
              Continue to Login →
            </button>
            <Link to="/login" className="rp-back"
              style={{ fontSize:13,color:"#6B7280",textDecoration:"none",
                fontWeight:500,display:"flex",alignItems:"center",
                justifyContent:"center",gap:6,transition:"color .14s" }}>
              ← Return to the login screen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;