import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --blue:       #1D4ED8;
    --blue-mid:   #2563EB;
    --blue-light: #3B82F6;
    --blue-pale:  #EFF6FF;
    --blue-pale2: #DBEAFE;
    --indigo:     #4338CA;
    --white:      #FFFFFF;
    --off:        #F8FAFF;
    --slate-1:    #1E293B;
    --slate-2:    #334155;
    --slate-3:    #64748B;
    --slate-4:    #94A3B8;
    --slate-5:    #CBD5E1;
    --slate-6:    #E2E8F0;
    --green:      #059669;
    --radius:     14px;
    --shadow-sm:  0 1px 4px rgba(37,99,235,.08);
    --shadow-md:  0 4px 20px rgba(37,99,235,.12);
    --shadow-lg:  0 12px 48px rgba(37,99,235,.16);
    --font-head:  'Sora', sans-serif;
    --font-body:  'DM Sans', sans-serif;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  .he-page {
    font-family: var(--font-body);
    color: var(--slate-1);
    background: var(--white);
    overflow-x: hidden;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes floatY {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-8px); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1);    opacity:.6; }
    100% { transform:scale(1.35); opacity:0; }
  }
  .anim-in { animation: fadeUp .55s ease both; }

  /* NAV */
  .he-nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 5%; height:68px;
    background:rgba(255,255,255,.9);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
    border-bottom:1px solid transparent;
    transition:.25s;
  }
  .he-nav.scrolled { border-bottom-color:var(--slate-6); box-shadow:0 2px 18px rgba(37,99,235,.08); }
  .he-nav-brand {
    display:flex; align-items:center; gap:10px;
    font-family:var(--font-head); font-size:1.25rem; font-weight:700; color:var(--slate-1);
    cursor:pointer; text-decoration:none;
  }
  .he-logo-box {
    width:36px; height:36px; border-radius:10px;
    background:linear-gradient(135deg,var(--blue-mid),var(--indigo));
    display:grid; place-items:center;
    box-shadow:0 4px 12px rgba(37,99,235,.3);
  }
  .he-nav-brand em { color:var(--blue-mid); font-style:normal; }
  .he-nav-links { display:flex; gap:36px; }
  .he-nav-links a {
    font-size:.92rem; font-weight:500; color:var(--slate-2);
    text-decoration:none; transition:color .2s;
  }
  .he-nav-links a:hover { color:var(--blue-mid); }
  .he-nav-cta { display:flex; gap:10px; align-items:center; }

  .btn-ghost {
    padding:9px 20px; border:1.5px solid var(--slate-5); border-radius:9px;
    background:none; font-family:var(--font-body); font-size:.9rem;
    font-weight:500; color:var(--slate-2); cursor:pointer; transition:.2s;
  }
  .btn-ghost:hover { border-color:var(--blue-light); color:var(--blue-mid); }
  .btn-blue {
    padding:10px 22px; border:none; border-radius:9px;
    background:linear-gradient(135deg,var(--blue-mid),var(--indigo));
    font-family:var(--font-body); font-size:.9rem; font-weight:600;
    color:#fff; cursor:pointer; box-shadow:0 4px 14px rgba(37,99,235,.3); transition:.2s;
  }
  .btn-blue:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,.4); }

  /* HERO */
  .he-hero {
    min-height:100vh; padding:120px 5% 80px;
    background:var(--white); position:relative; overflow:hidden;
    display:flex; align-items:center;
  }
  .hero-bg-grid {
    position:absolute; inset:0;
    background-image:
      linear-gradient(var(--slate-6) 1px, transparent 1px),
      linear-gradient(90deg, var(--slate-6) 1px, transparent 1px);
    background-size:60px 60px; opacity:.4; pointer-events:none;
  }
  .hero-blob-1 {
    position:absolute; top:-160px; right:-120px;
    width:700px; height:700px; border-radius:50%;
    background:radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 70%);
    pointer-events:none;
  }
  .hero-blob-2 {
    position:absolute; bottom:-100px; left:-100px;
    width:500px; height:500px; border-radius:50%;
    background:radial-gradient(circle,rgba(67,56,202,.08) 0%,transparent 70%);
    pointer-events:none;
  }
  .hero-inner {
    position:relative; z-index:2;
    width:100%; max-width:1280px; margin:0 auto;
    display:flex; align-items:center; gap:60px;
  }
  .hero-left { flex:1; min-width:0; }
  .hero-eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 14px; border-radius:999px;
    background:var(--blue-pale); border:1px solid var(--blue-pale2);
    font-size:.82rem; font-weight:600; color:var(--blue-mid);
    margin-bottom:28px;
  }
  .hero-eyebrow-dot {
    width:8px; height:8px; border-radius:50%;
    background:var(--blue-light); position:relative;
  }
  .hero-eyebrow-dot::after {
    content:''; position:absolute; inset:-2px; border-radius:50%;
    border:2px solid var(--blue-light); opacity:.4;
    animation:pulse-ring 1.6s ease-in-out infinite;
  }
  .hero-sub-line {
    font-family:var(--font-head);
    font-size:clamp(1rem,2.2vw,1.4rem); font-weight:400;
    color:var(--slate-3); letter-spacing:-.01em; margin-bottom:4px;
  }
  .hero-brand-title {
    font-family:var(--font-head);
    font-size:clamp(3.5rem,8vw,6rem); font-weight:800; line-height:1;
    letter-spacing:-.04em;
    background:linear-gradient(135deg,var(--slate-1) 0%,var(--blue-mid) 60%,var(--indigo) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    margin-bottom:4px;
  }
  .hero-tagline {
    font-family:var(--font-head);
    font-size:clamp(.95rem,1.8vw,1.35rem); font-weight:500;
    color:var(--slate-3); letter-spacing:-.01em; margin-bottom:24px;
  }
  .hero-desc {
    font-size:1.05rem; color:var(--slate-3); line-height:1.75;
    max-width:500px; margin-bottom:36px;
  }
  .hero-btns { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:52px; }
  .btn-primary-lg {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 28px; border:none; border-radius:11px;
    background:linear-gradient(135deg,var(--blue-mid),var(--indigo));
    font-family:var(--font-body); font-size:1rem; font-weight:600;
    color:#fff; cursor:pointer; box-shadow:0 6px 20px rgba(37,99,235,.35); transition:.25s;
  }
  .btn-primary-lg:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(37,99,235,.45); }
  .btn-outline-lg {
    display:inline-flex; align-items:center; gap:8px;
    padding:13px 26px; border:1.5px solid var(--slate-5); border-radius:11px;
    background:#fff; font-family:var(--font-body); font-size:1rem;
    font-weight:500; color:var(--slate-2); cursor:pointer; transition:.25s;
  }
  .btn-outline-lg:hover { border-color:var(--blue-light); color:var(--blue-mid); }

  .hero-feature-pills { display:flex; gap:10px; flex-wrap:wrap; }
  .feature-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:999px;
    background:var(--off); border:1px solid var(--slate-6);
    font-size:.82rem; font-weight:500; color:var(--slate-2);
  }

  /* MOCK */
  .hero-right { flex:0 0 480px; position:relative; }
  .mock-window {
    background:#fff; border:1px solid var(--slate-6);
    border-radius:16px; box-shadow:var(--shadow-lg);
    overflow:hidden; animation:floatY 5s ease-in-out infinite;
  }
  .mock-bar {
    display:flex; align-items:center; gap:6px;
    padding:10px 14px; background:var(--off); border-bottom:1px solid var(--slate-6);
  }
  .mock-dot { width:10px; height:10px; border-radius:50%; }
  .mock-dot.r{background:#FC5F57;} .mock-dot.y{background:#FDBB2F;} .mock-dot.g{background:#2AC940;}
  .mock-title { margin-left:8px; font-size:.75rem; font-weight:600; color:var(--slate-3); font-family:var(--font-head); }
  .mock-body { padding:16px; }
  .mock-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px; }
  .mock-stat {
    background:var(--off); border:1px solid var(--slate-6);
    border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:2px;
  }
  .msv { font-family:var(--font-head); font-size:1rem; font-weight:700; color:var(--blue-mid); }
  .msl { font-size:.68rem; color:var(--slate-4); font-weight:500; }
  .mock-section-label {
    font-size:.68rem; font-weight:700; color:var(--slate-3);
    letter-spacing:.06em; text-transform:uppercase; margin-bottom:8px;
  }
  .mock-rooms { display:grid; grid-template-columns:repeat(10,1fr); gap:3px; margin-bottom:8px; }
  .mock-room { aspect-ratio:1; border-radius:3px; }
  .mock-room.occ{background:#BFDBFE;} .mock-room.vac{background:#BBF7D0;}
  .mock-room.pend{background:#FDE68A;} .mock-room.maint{background:#E2E8F0;}
  .mock-legend { display:flex; gap:12px; font-size:.68rem; color:var(--slate-3); margin-bottom:12px; }
  .mock-legend-item { display:flex; align-items:center; gap:4px; }
  .mock-leg-dot { width:8px; height:8px; border-radius:2px; }
  .mock-leg-dot.occ{background:#3B82F6;} .mock-leg-dot.vac{background:#10B981;}
  .mock-leg-dot.pend{background:#F59E0B;} .mock-leg-dot.maint{background:#94A3B8;}
  .mock-students { display:flex; flex-direction:column; gap:6px; }
  .mock-student {
    display:flex; align-items:center; gap:8px;
    padding:7px 10px; background:var(--off); border:1px solid var(--slate-6); border-radius:9px;
  }
  .mock-ava { width:26px; height:26px; border-radius:50%; display:grid; place-items:center; font-size:.7rem; font-weight:700; color:#fff; flex-shrink:0; }
  .mock-sname { font-size:.78rem; font-weight:600; color:var(--slate-1); flex:1; }
  .mock-sroom { font-size:.72rem; color:var(--slate-4); margin-right:auto; }
  .mock-stag { font-size:.68rem; font-weight:600; padding:3px 8px; border-radius:999px; }
  .mock-stag.active{background:#D1FAE5;color:#065F46;} .mock-stag.leave{background:#EDE9FE;color:#5B21B6;}
  .float-badge {
    position:absolute; background:#fff; border:1px solid var(--slate-6);
    border-radius:12px; padding:10px 14px;
    display:flex; align-items:center; gap:10px;
    box-shadow:var(--shadow-md); font-size:.82rem;
  }
  .float-badge.b1 { bottom:-18px; left:-32px; animation:floatY 4s ease-in-out infinite 1s; }
  .float-badge.b2 { top:-16px; right:-28px; animation:floatY 4.5s ease-in-out infinite .5s; }
  .fb-icon { font-size:1.2rem; }
  .fb-t { font-weight:700; color:var(--slate-1); font-size:.82rem; }
  .fb-s { color:var(--slate-4); font-size:.72rem; }

  /* SECTIONS */
  .section { padding:96px 5%; }
  .section-inner { max-width:1280px; margin:0 auto; }
  .section-head {
    display:flex; align-items:flex-start; justify-content:space-between;
    gap:32px; margin-bottom:60px; flex-wrap:wrap;
  }
  .eyebrow {
    display:inline-block; font-size:.78rem; font-weight:700;
    letter-spacing:.1em; text-transform:uppercase; color:var(--blue-mid); margin-bottom:12px;
  }
  .section-h2 {
    font-family:var(--font-head); font-size:clamp(1.8rem,3.5vw,2.6rem);
    font-weight:700; line-height:1.2; letter-spacing:-.02em; color:var(--slate-1);
  }
  .section-sub { font-size:1rem; color:var(--slate-3); line-height:1.7; max-width:400px; flex-shrink:0; }

  /* FEATURES */
  .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .feat-card {
    background:#fff; border:1px solid var(--slate-6);
    border-radius:var(--radius); padding:28px; transition:.25s;
  }
  .feat-card:hover { border-color:var(--blue-pale2); box-shadow:var(--shadow-md); transform:translateY(-3px); }
  .feat-card.feat-accent {
    background:linear-gradient(135deg,var(--blue-mid),var(--indigo)); border:none;
  }
  .feat-icon-wrap {
    width:44px; height:44px; border-radius:12px; background:var(--blue-pale);
    display:grid; place-items:center; margin-bottom:16px; font-size:1.3rem;
  }
  .feat-card.feat-accent .feat-icon-wrap { background:rgba(255,255,255,.18); }
  .feat-title { font-family:var(--font-head); font-size:1rem; font-weight:700; color:var(--slate-1); margin-bottom:8px; }
  .feat-card.feat-accent .feat-title { color:#fff; }
  .feat-desc { font-size:.88rem; color:var(--slate-3); line-height:1.65; }
  .feat-card.feat-accent .feat-desc { color:rgba(255,255,255,.8); }

  /* HOW IT WORKS */
  .steps-section { background:var(--off); }
  .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .step-card {
    background:#fff; border:1px solid var(--slate-6);
    border-radius:var(--radius); padding:32px; position:relative; overflow:hidden; transition:.25s;
  }
  .step-card:hover { border-color:var(--blue-pale2); box-shadow:var(--shadow-md); transform:translateY(-3px); }
  .step-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,var(--blue-mid),var(--indigo));
  }
  .step-top-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .step-num { font-family:var(--font-head); font-size:2.4rem; font-weight:800; color:var(--blue-pale2); line-height:1; }
  .step-icon { font-size:2rem; }
  .step-title { font-family:var(--font-head); font-size:1.1rem; font-weight:700; color:var(--slate-1); margin-bottom:10px; }
  .step-desc { font-size:.9rem; color:var(--slate-3); line-height:1.65; }

  /* CTA */
  .cta-section {
    background:linear-gradient(135deg,var(--blue-mid) 0%,var(--indigo) 100%);
    padding:96px 5%; position:relative; overflow:hidden;
  }
  .cta-section::before {
    content:''; position:absolute; top:-200px; right:-150px;
    width:600px; height:600px; border-radius:50%; background:rgba(255,255,255,.07); pointer-events:none;
  }
  .cta-inner {
    position:relative; z-index:2; max-width:1280px; margin:0 auto;
    display:flex; align-items:center; justify-content:space-between; gap:48px; flex-wrap:wrap;
  }
  .cta-h2 { font-family:var(--font-head); font-size:clamp(1.8rem,3.5vw,2.6rem); font-weight:700; color:#fff; line-height:1.2; margin-bottom:14px; }
  .cta-sub { font-size:1rem; color:rgba(255,255,255,.75); line-height:1.65; max-width:380px; }
  .cta-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .btn-white {
    padding:14px 28px; border:none; border-radius:11px; background:#fff;
    font-family:var(--font-body); font-size:1rem; font-weight:700; color:var(--blue-mid); cursor:pointer; transition:.2s;
  }
  .btn-white:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.15); }
  .btn-white-outline {
    padding:13px 26px; border:1.5px solid rgba(255,255,255,.4); border-radius:11px;
    background:transparent; font-family:var(--font-body); font-size:1rem; font-weight:500; color:#fff; cursor:pointer; transition:.2s;
  }
  .btn-white-outline:hover { background:rgba(255,255,255,.1); }

  /* FOOTER */
  .he-footer { background:var(--slate-1); padding:40px 5%; }
  .footer-inner { max-width:1280px; margin:0 auto; display:flex; align-items:center; gap:32px; flex-wrap:wrap; }
  .footer-brand { display:flex; align-items:center; gap:10px; font-family:var(--font-head); font-size:1.1rem; font-weight:700; color:#fff; }
  .footer-brand em { color:var(--blue-light); font-style:normal; }
  .footer-logo-box { width:28px; height:28px; border-radius:7px; background:linear-gradient(135deg,var(--blue-mid),var(--indigo)); display:grid; place-items:center; }
  .footer-links { display:flex; gap:20px; flex-wrap:wrap; margin-left:auto; }
  .footer-links a { font-size:.85rem; color:var(--slate-4); text-decoration:none; transition:.15s; }
  .footer-links a:hover { color:#fff; }
  .footer-copy { font-size:.78rem; color:var(--slate-4); }

  @media(max-width:1024px){
    .hero-inner { flex-direction:column; }
    .hero-right { flex:none; width:100%; max-width:480px; align-self:center; }
    .steps-grid { grid-template-columns:1fr; }
    .features-grid { grid-template-columns:repeat(2,1fr); }
    .section-head { flex-direction:column; }
    .cta-inner { flex-direction:column; }
  }
  @media(max-width:600px){
    .he-nav-links { display:none; }
    .features-grid { grid-template-columns:1fr; }
    .mock-stats-row { grid-template-columns:repeat(2,1fr); }
  }
`;

/* ── Data ── */
const NAV_LINKS = [
  { label: 'Features',     href: '#features'    },
  { label: 'How it works', href: '#how-it-works' },
];

/* What's actually built in the platform */
const FEATURES = [
  {
    icon: '🗺️', title: 'Room Allocation Map',
    desc: 'Visual colour-coded floor plan of every block. Wardens assign rooms with a click, flag beds for maintenance and see live occupancy at a glance.',
  },
  {
    icon: '📋', title: 'Leave Management',
    desc: 'Students submit leave requests from their phone. Wardens approve or reject with one tap. Automated notifications keep both sides in sync.',
  },
  {
    icon: '💳', title: 'Fee Collection',
    desc: 'Razorpay-powered payments with auto-generated receipts. Students can view their full payment history and dues from the student portal.',
  },
  {
    icon: '🔔', title: 'Real-time Notifications',
    desc: 'Instant in-app alerts for leave approvals, fee confirmations, room changes and warden announcements — for both students and wardens.',
  },
  {
    icon: '🔧', title: 'Issues & Complaints',
    desc: 'Students raise room or hostel complaints directly. Wardens track open, in-progress and resolved issues with full resolution notes.',
    accent: true,
  },
  {
    icon: '📊', title: 'Warden Analytics',
    desc: 'Dashboards covering occupancy rates, leave patterns, payment summaries and student activity — giving wardens a full operational picture.',
  },
];

const STEPS = [
  {
    num: '01', icon: '🏠', title: 'Set up your hostel',
    desc: 'Register as a warden, map your blocks and rooms, and add your students. The entire setup takes one session — no IT support needed.',
  },
  {
    num: '02', icon: '🎓', title: 'Students get their portal',
    desc: 'Each student logs in to view their room details, roommates, leave history, payment records and raise issues — all from one screen.',
  },
  {
    num: '03', icon: '⚡', title: 'Manage everything in one place',
    desc: 'Approve leaves, collect fees, respond to complaints and monitor occupancy in real time — without spreadsheets or WhatsApp groups.',
  },
];

const ROOMS = Array.from({ length: 40 }, (_, i) => {
  const r = (i * 7 + 13) % 10;
  return r < 6 ? 'occ' : r < 8 ? 'vac' : r < 9 ? 'pend' : 'maint';
});

const A = ({ delay = 0, children, className = '', style = {} }) => (
  <div className={`anim-in ${className}`} style={{ animationDelay: `${delay}ms`, ...style }}>
    {children}
  </div>
);

/* ── Navbar ── */
function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const handleNav = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <nav className={`he-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="he-nav-brand">
        <div className="he-logo-box">
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <path d="M9 21V12h6v9"/>
          </svg>
        </div>
        Hostel<em>Ease</em>
      </div>
      <div className="he-nav-links">
        {NAV_LINKS.map(l => (
          <a key={l.label} href={l.href} onClick={e => handleNav(e, l.href)}>{l.label}</a>
        ))}
      </div>
      <div className="he-nav-cta">
        <button className="btn-ghost" onClick={onLogin}>Log in</button>
        <button className="btn-blue"  onClick={onLogin}>Get Started →</button>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero({ onLogin }) {
  return (
    <section className="he-hero">
      <div className="hero-bg-grid" aria-hidden />
      <div className="hero-blob-1"  aria-hidden />
      <div className="hero-blob-2"  aria-hidden />
      <div className="hero-inner">

        <div className="hero-left">
          <A delay={0}>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot"/>
              Hostel management, done right
            </div>
          </A>
          <A delay={80}>
            <div style={{ marginBottom:'24px' }}>
              <div className="hero-sub-line">Welcome to</div>
              <div className="hero-brand-title">HostelEase</div>
              <div className="hero-tagline">room · leave · fees · issues — all in one</div>
            </div>
          </A>
          <A delay={160}>
            <p className="hero-desc">
              HostelEase gives wardens complete visibility over rooms, leaves,
              fee payments and student complaints — and gives students a clean
              self-service portal for everything hostel-related.
            </p>
          </A>
          <A delay={240}>
            <div className="hero-btns">
              <button className="btn-primary-lg" onClick={onLogin}>
                Get Started
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button className="btn-outline-lg" onClick={onLogin}>
                Log in to portal
              </button>
            </div>
          </A>
          <A delay={320}>
            <div className="hero-feature-pills">
              {['🗺️ Room Allocation','📋 Leave Approvals','💳 Fee Payments','🔧 Issue Tracking','🔔 Notifications'].map(f => (
                <span key={f} className="feature-pill">{f}</span>
              ))}
            </div>
          </A>
        </div>

        {/* Dashboard mock */}
        <A delay={200} className="hero-right">
          <div className="mock-window">
            <div className="mock-bar">
              <span className="mock-dot r"/><span className="mock-dot y"/><span className="mock-dot g"/>
              <span className="mock-title">HostelEase — Warden Dashboard</span>
            </div>
            <div className="mock-body">
              <div className="mock-stats-row">
                {[['48','Students'],['88%','Occupancy'],['3','Pending Leaves'],['₹96k','Collected']].map(([v,l]) => (
                  <div key={l} className="mock-stat">
                    <span className="msv">{v}</span>
                    <span className="msl">{l}</span>
                  </div>
                ))}
              </div>
              <div className="mock-section-label">Room Map — Block A</div>
              <div className="mock-rooms">
                {ROOMS.map((t, i) => <div key={i} className={`mock-room ${t}`}/>)}
              </div>
              <div className="mock-legend">
                {[['occ','Occupied'],['vac','Vacant'],['pend','Pending'],['maint','Maint.']].map(([c,l]) => (
                  <div key={l} className="mock-legend-item">
                    <span className={`mock-leg-dot ${c}`}/>{l}
                  </div>
                ))}
              </div>
              <div className="mock-section-label" style={{ marginTop:10 }}>Recent Students</div>
              <div className="mock-students">
                {[
                  ['A','Arjun S.','A-101','Active','#2563EB'],
                  ['P','Priya M.','B-204','On Leave','#7C3AED'],
                  ['R','Rahul K.','A-305','Active','#0EA5E9'],
                ].map(([init,name,room,status,col]) => (
                  <div key={name} className="mock-student">
                    <div className="mock-ava" style={{ background:col }}>{init}</div>
                    <span className="mock-sname">{name}</span>
                    <span className="mock-sroom">{room}</span>
                    <span className={`mock-stag ${status==='Active'?'active':'leave'}`}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="float-badge b1">
            <span className="fb-icon">✅</span>
            <div>
              <div className="fb-t">Leave approved</div>
              <div className="fb-s">Student notified</div>
            </div>
          </div>
          <div className="float-badge b2">
            <span className="fb-icon">💳</span>
            <div>
              <div className="fb-t">₹8,500 received</div>
              <div className="fb-s">Hostel fee · Room A-101</div>
            </div>
          </div>
        </A>
      </div>
    </section>
  );
}

/* ── How it works ── */
function Steps() {
  return (
    <section className="section steps-section" id="how-it-works">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <div className="eyebrow">How it works</div>
            <h2 className="section-h2">Up and running<br/>in one session</h2>
          </div>
          <p className="section-sub">
            No lengthy onboarding. No training required.<br/>
            Wardens and students can be live the same day.
          </p>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-top-row">
                <div className="step-num">{s.num}</div>
                <span className="step-icon">{s.icon}</span>
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
function Features() {
  return (
    <section className="section" id="features">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <div className="eyebrow">What's built</div>
            <h2 className="section-h2">Everything the hostel<br/>needs, nothing it doesn't</h2>
          </div>
          <p className="section-sub">
            Six core modules that cover the full lifecycle of hostel
            operations — for both wardens and students.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feat-card${f.accent ? ' feat-accent' : ''}`}>
              <div className="feat-icon-wrap"><span>{f.icon}</span></div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA({ onLogin }) {
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <div>
          <h2 className="cta-h2">Ready to log in?</h2>
          <p className="cta-sub">
            HostelEase is live. Students and wardens can sign in right now
            and access all platform features.
          </p>
        </div>
        <div className="cta-btns">
          <button className="btn-white"         onClick={onLogin}>Log in to portal →</button>
          <button className="btn-white-outline" onClick={onLogin}>Download Android App</button>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="he-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-box">
            <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
          Hostel<em>Ease</em>
        </div>
        <div className="footer-links">
          {['For Wardens','For Students','Contact'].map(l => (
            <a key={l} href="#">{l}</a>
          ))}
        </div>
        <span className="footer-copy">© 2026 HostelEase. All rights reserved.</span>
      </div>
    </footer>
  );
}

/* ── Page Root ── */
export default function Home() {
  const navigate = useNavigate();
  const goLogin  = () => navigate('/login');
  return (
    <>
      <style>{CSS}</style>
      <div className="he-page">
        <Navbar  onLogin={goLogin}/>
        <Hero    onLogin={goLogin}/>
        <Steps />
        <Features />
        <CTA     onLogin={goLogin}/>
        <Footer />
      </div>
    </>
  );
}