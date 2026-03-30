// pages/admin/Login.jsx — Mobile + Desktop responsive
import { useState, useEffect } from "react";
import { useAuth }    from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const AdminLogin = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const isMobile   = useIsMobile();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const role = await login(email, password);
      if (role !== "admin") {
        setError("Access denied. This portal is for administrators only.");
        return;
      }
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh",
      fontFamily:"'Inter',-apple-system,sans-serif", background:"#fff",
      flexDirection: isMobile ? "column" : "row" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:#9CA3AF;font-size:14px}
        @keyframes al-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes al-spin{to{transform:rotate(360deg)}}
        .al-field{display:flex;align-items:center;border:1.5px solid #D1D5DB;border-radius:10px;background:#fff;overflow:hidden;transition:border-color .15s,box-shadow .15s}
        .al-field:focus-within{border-color:#111827!important;box-shadow:0 0 0 3px rgba(17,24,39,0.08)!important}
        .al-divider{width:1px;height:22px;background:#E5E7EB;flex-shrink:0}
        .al-bare{flex:1;padding:13px 14px;border:none;outline:none;font-size:14px;color:#111827;background:transparent;font-family:'Inter',sans-serif}
        .al-eye{background:none;border:none;cursor:pointer;padding:0 14px;color:#9CA3AF;display:flex;align-items:center;transition:color .14s}
        .al-eye:hover{color:#374151}
        .al-submit:hover:not(:disabled){background:#1F2937!important}
        .al-feature:hover{background:#F3F4F6!important;transform:translateY(-1px)}
      `}</style>

      {/* ── LEFT panel — hidden on mobile ─────────────────────────────── */}
      {!isMobile && (
        <div style={{ flex:1, padding:"48px 56px",
          background:"linear-gradient(145deg,#FFF7ED 0%,#FEF3C7 40%,#FEF9C3 100%)",
          display:"flex", flexDirection:"column",
          borderRight:"1px solid #F3F4F6" }}>

          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:60 }}>
            <div style={{ width:44,height:44,borderRadius:12,
              background:"linear-gradient(135deg,#D97706,#B45309)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,boxShadow:"0 4px 12px rgba(217,119,6,0.35)" }}>🏠</div>
            <span style={{ fontSize:20,fontWeight:800,color:"#111827",letterSpacing:"-0.4px" }}>
              HostelEase
            </span>
          </div>

          <h1 style={{ fontSize:38,fontWeight:800,color:"#111827",
            letterSpacing:"-1px",lineHeight:1.1,marginBottom:16 }}>
            Admin Control<br/>Center
          </h1>
          <p style={{ fontSize:16,color:"#6B7280",lineHeight:1.65,maxWidth:380,marginBottom:40 }}>
            Manage wardens, monitor the entire hostel system and maintain operational control from one place.
          </p>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:440 }}>
            {[
              { icon:"👷", title:"Warden Management", desc:"Create & manage warden accounts"   },
              { icon:"📊", title:"System Overview",   desc:"Monitor all hostel activities"     },
              { icon:"🔔", title:"Notifications",     desc:"System-wide alerts & updates"      },
              { icon:"🛡️", title:"Secure Access",     desc:"Role-based access control"         },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="al-feature"
                style={{ padding:"14px",borderRadius:14,
                  background:"rgba(255,255,255,0.72)",
                  border:"1px solid rgba(255,255,255,0.9)",
                  backdropFilter:"blur(8px)",
                  transition:"all .2s",cursor:"default" }}>
                <div style={{ fontSize:22,marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:13,fontWeight:700,color:"#111827",marginBottom:3 }}>{title}</div>
                <div style={{ fontSize:11,color:"#9CA3AF",lineHeight:1.4 }}>{desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:"auto",paddingTop:40,display:"flex",gap:32 }}>
            {[{v:"Secure",l:"Admin Access"},{v:"Full",l:"Control"},{v:"24/7",l:"Monitoring"}]
              .map(({v,l})=>(
                <div key={l}>
                  <div style={{ fontSize:17,fontWeight:800,color:"#111827" }}>{v}</div>
                  <div style={{ fontSize:12,color:"#9CA3AF",marginTop:2 }}>{l}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── RIGHT panel / Mobile full-screen ───────────────────────────── */}
      <div style={{
        width: isMobile ? "100%" : 480,
        padding: isMobile ? "40px 24px 40px" : "48px 52px",
        display:"flex", flexDirection:"column",
        justifyContent: isMobile ? "flex-start" : "center",
        animation:"al-fade .4s ease both",
        minHeight: isMobile ? "100vh" : "auto",
        background: "#fff",
      }}>

        {/* Mobile logo */}
        {isMobile && (
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:32 }}>
            <div style={{ width:40,height:40,borderRadius:11,
              background:"linear-gradient(135deg,#D97706,#B45309)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20 }}>🏠</div>
            <span style={{ fontSize:18,fontWeight:800,color:"#111827" }}>HostelEase</span>
          </div>
        )}

        <div style={{ fontSize:11,fontWeight:700,color:"#D97706",
          textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8 }}>
          Admin Portal
        </div>
        <h2 style={{ fontSize: isMobile ? 26 : 28,fontWeight:800,color:"#111827",
          letterSpacing:"-0.5px",marginBottom:6 }}>
          Welcome back
        </h2>
        <p style={{ fontSize:14,color:"#9CA3AF",marginBottom: isMobile ? 28 : 32 }}>
          Sign in to continue to your admin dashboard
        </p>

        {error && (
          <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",
            borderRadius:12,padding:"10px 14px",marginBottom:20,
            fontSize:13,color:"#991B1B",fontWeight:500,
            display:"flex",alignItems:"center",gap:8 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label style={{ fontSize:14,fontWeight:600,color:"#111827",display:"block",marginBottom:8 }}>
            Your Email
          </label>
          <div className="al-field" style={{ marginBottom:18 }}>
            <span style={{ padding:"0 14px",color:"#9CA3AF",flexShrink:0,display:"flex",alignItems:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <div className="al-divider"/>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="admin@hostelease.com" required autoComplete="email"
              className="al-bare"/>
          </div>

          {/* Password */}
          <label style={{ fontSize:14,fontWeight:600,color:"#111827",display:"block",marginBottom:8 }}>
            Password
          </label>
          <div className="al-field" style={{ marginBottom:24 }}>
            <span style={{ padding:"0 14px",color:"#9CA3AF",flexShrink:0,display:"flex",alignItems:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <div className="al-divider"/>
            <input type={showPass?"text":"password"} value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="" required autoComplete="current-password"
              className="al-bare"
              style={{ letterSpacing:showPass?"normal":"0.12em",fontSize:showPass?14:16 }}/>
            <button type="button" className="al-eye" onClick={()=>setShowPass(p=>!p)}>
              {showPass?(
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <path d="m2 2 20 20"/>
                </svg>
              ):(
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <button type="submit" disabled={loading} className="al-submit"
            style={{ width:"100%",padding:"14px",
              background:loading?"#374151":"#111827",
              color:"#fff",border:"none",borderRadius:12,
              fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              fontFamily:"'Inter',sans-serif",transition:"background .15s",
              boxShadow:"0 4px 12px rgba(0,0,0,0.15)",minHeight:50 }}>
            {loading?(
              <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.35)",
                borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block",
                animation:"al-spin .7s linear infinite" }}/>Signing in…</>
            ):"Sign in as Admin"}
          </button>
        </form>

        {/* Mobile features summary */}
        {isMobile && (
          <div style={{ marginTop:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[
              { icon:"👷", title:"Warden Mgmt" },
              { icon:"📊", title:"Analytics"   },
              { icon:"🔔", title:"Notifications"},
              { icon:"🛡️", title:"Secure Access"},
            ].map(({ icon, title }) => (
              <div key={title}
                style={{ padding:"12px",borderRadius:12,
                  background:"#FFF7ED",border:"1px solid #FEF3C7",
                  display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <span style={{ fontSize:12,fontWeight:600,color:"#111827" }}>{title}</span>
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign:"center",marginTop:24,fontSize:13,color:"#9CA3AF" }}>
          Not an admin?{" "}
          <Link to="/login" style={{ color:"#D97706",fontWeight:700,textDecoration:"none" }}>
            Go to main login →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;