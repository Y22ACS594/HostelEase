import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const AnimDiv = ({ delay = 0, children, className = '', style = {} }) => (
  <div className={`anim-in ${className}`} style={{ animationDelay: `${delay}ms`, ...style }}>
    {children}
  </div>
);

/* ── NAV ── */
const NAV_LINKS = [
  { label: 'Features',     href: '#features'     },
  { label: 'How it works', href: '#how-it-works'  },
  { label: 'About',        href: '#about'         },
];

/* ── HERO STATS ── */
const STATS = [
  { val: '5,200+', lbl: 'Students managed' },
  { val: '130+',   lbl: 'Hostels onboard'  },
  { val: '4.9 ★',  lbl: 'Avg warden rating'},
  { val: '< 30m',  lbl: 'Setup time'       },
    { val: '1,200+', lbl: 'Bapatla Engineering College students' }, // 
];

/* ── STEPS ── */
const STEPS = [
  {
    num: '01',
    icon: '🏠',
    title: 'Set up your hostel in minutes',
    desc: 'Map every block, floor and room digitally. HostelEase builds your hostel structure instantly — no spreadsheets, no IT team, no headaches.',
  },
  {
    num: '02',
    icon: '🎓',
    title: 'Students discover & apply',
    desc: 'Students browse available rooms with photos, amenities and block details. Apply, track status and receive confirmation — all from their phone.',
  },
  {
    num: '03',
    icon: '⚡',
    title: 'Manage everything in real time',
    desc: 'Approve leaves, collect fees, send announcements and monitor live occupancy — every action reflected instantly across the entire platform.',
  },
];

/* ── FEATURES ── */
const FEATURES = [
  {
    icon: '🗺️',
    title: 'Live Room Allocation Map',
    desc: 'A visual, colour-coded floor plan of every block. See occupancy at a glance, drag-assign students and flag rooms for maintenance — all in one place.',
  },
  {
    icon: '📋',
    title: 'Effortless Leave Management',
    desc: 'Students submit leave requests from mobile. Wardens review, approve or reject with one tap. Automated push notifications keep everyone in the loop.',
  },
  {
    icon: '💳',
    title: 'Secure Fee Collection',
    desc: 'Razorpay-powered payments with automatic receipts, overdue alerts and full transaction history. Zero manual follow-up, zero missed fees.',
  },
  {
    icon: '💬',
    title: 'Real-time Messaging',
    desc: 'Direct, threaded conversations between wardens and students. Share images, documents and notices — no more scattered WhatsApp groups.',
  },
  {
    icon: '📊',
    title: 'Intelligent Analytics',
    desc: 'Auto-generated dashboards tracking occupancy trends, leave patterns, revenue flow and student activity — presented beautifully, updated live.',
    dark: true,
  },
  {
    icon: '🔔',
    title: 'Smart Push Notifications',
    desc: 'Instant alerts for approvals, fee dues, hostel notices and maintenance updates — delivered on web and Android without any configuration.',
  },
];

/* ── TESTIMONIALS ── */
const TESTIMONIALS = [
  {
    name: 'Sriram Venkat',
    role: 'Chief Warden · VIT Chennai',
    color: '#16a34a',
    quote: 'Our paperwork dropped by 90% overnight. Leave approvals that took two working days now take under 60 seconds. For a hostel of 800 students, that is transformative.',
  },
  {
    name: 'Yeduru Mouli Reddy',
    role: 'Student · Bapatla Engineering College',
    color: '#7c3aed',
    quote: 'I found my room, paid my fees and got my leave approved without stepping into the warden office once. This is how college hostel life should feel.',
  },
  {
    name: 'Dr. Ramesh Kumar',
    role: 'Director of Hostels · SRM University',
    color: '#0ea5e9',
    quote: 'The room allocation map alone saved us three staff positions. The analytics dashboard gives me a full-picture view of six hostels from a single screen.',
  },
  {
    name: 'Hostel Administration',
    role: 'Bapatla Engineering College',
    color: '#f59e0b',
    quote: 'After digitalizing leave management with HostelEase, our hostel office no longer handles manual leave registers. Students submit leave online and approvals happen instantly, making hostel administration much more efficient.',
  },
];

/* ── ABOUT STATS ── */
const ABOUT_STATS = [
  { val: '5,200+', lbl: 'Students on platform', color: '#16a34a' },
  { val: '130+',   lbl: 'Hostels onboarded',    color: '#7c3aed' },
  { val: '98%',    lbl: 'Warden satisfaction',  color: '#0ea5e9' },
  { val: '₹4.2Cr', lbl: 'Fees processed',       color: '#f59e0b' },
];

/* ── LEAVE CHART DATA ── */
const LEAVE_BARS = [
  { month: 'Jul', val: 12 },
  { month: 'Aug', val: 28 },
  { month: 'Sep', val: 19 },
  { month: 'Oct', val: 35 },
  { month: 'Nov', val: 22 },
  { month: 'Dec', val: 41 },
  { month: 'Jan', val: 17 },
];
const MAX_BAR = 45;

/* ── ROOM GRID ── */
const ROOMS = Array.from({ length: 40 }, (_, i) => {
  const r = (i * 7 + 13) % 10;
  return r < 6 ? 'occ' : r < 8 ? 'vac' : r < 9 ? 'pend' : 'maint';
});

/* ════════════════════ COMPONENTS ════════════════════ */

function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`he-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="he-nav-brand">
        <div className="he-nav-logo">
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <path d="M9 21V12h6v9"/>
          </svg>
        </div>
        <span className="he-nav-name">Hostel<em>Ease</em></span>
      </div>

      <div className="he-nav-links">
        {NAV_LINKS.map(l => (
          <a key={l.label} href={l.href} onClick={e => handleNav(e, l.href)}>{l.label}</a>
        ))}
      </div>

      <div className="he-nav-cta">
        <button className="btn-ghost" onClick={onLogin}>Log in</button>
        <button className="btn-green" onClick={onLogin}>Get Started →</button>
      </div>
    </nav>
  );
}

/* ── HERO ── */
function Hero({ onLogin }) {
  return (
    <section className="he-hero">
      <div className="hero-grid-bg" aria-hidden />
      <div className="hero-glow-1"  aria-hidden />
      <div className="hero-glow-2"  aria-hidden />

      <div className="hero-inner">
        {/* LEFT */}
        <div className="hero-left">
          <AnimDiv delay={0}>
            <div className="hero-pill">
              <span className="pill-dot" /> Trusted by 130+ campuses across India
            </div>
          </AnimDiv>

          <AnimDiv delay={80}>
            <h1 className="hero-h1">
              Your hostel,<br />
              <span className="hero-h1-accent">managed smart</span><br />
              from day one
            </h1>
          </AnimDiv>

          <AnimDiv delay={160}>
            <p className="hero-sub">
              HostelEase gives wardens complete control — room allocation,
              leave approvals, secure fee collection and real-time communication —
              in one beautifully simple platform.
            </p>
          </AnimDiv>

          <AnimDiv delay={240} className="hero-btns">
            <button className="btn-green btn-lg" onClick={onLogin}>
              Start for free
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline btn-lg" onClick={onLogin}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              Watch demo
            </button>
          </AnimDiv>

          <AnimDiv delay={320} className="hero-trust">
            {STATS.map((s, i) => (
              <div key={i} className="trust-item">
                <span className="trust-val">{s.val}</span>
                <span className="trust-lbl">{s.lbl}</span>
              </div>
            ))}
          </AnimDiv>
        </div>

        {/* RIGHT — Dashboard mock */}
        <AnimDiv delay={200} className="hero-right">
          <div className="mock-window">
            <div className="mock-bar">
              <span className="mock-dot r"/><span className="mock-dot y"/><span className="mock-dot g"/>
              <span className="mock-title">HostelEase — Warden Dashboard</span>
            </div>
            <div className="mock-body">
              <div className="mock-stats">
                {[['312','Students'],['91%','Occupancy'],['7','Pending'],['₹2.4L','Collected']].map(([v,l]) => (
                  <div key={l} className="mock-stat">
                    <span className="msv">{v}</span>
                    <span className="msl">{l}</span>
                  </div>
                ))}
              </div>

              <div className="mock-section-label">Room Map — Block A</div>
              <div className="mock-rooms">
                {ROOMS.map((t,i) => <div key={i} className={`mock-room ${t}`} />)}
              </div>
              <div className="mock-legend">
                {[['occ','Occupied'],['vac','Vacant'],['pend','Pending'],['maint','Maint.']].map(([c,l]) => (
                  <div key={l} className="mock-legend-item">
                    <span className={`mock-leg-dot ${c}`}/>{l}
                  </div>
                ))}
              </div>

              <div className="mock-section-label" style={{marginTop:10}}>Recent Students</div>
              <div className="mock-students">
                {[['A','Aditya S.','A-101','Active','#16a34a'],
                  ['P','Priya M.','B-204','On Leave','#7c3aed'],
                  ['R','Rahul K.','C-312','Active','#0ea5e9']
                ].map(([init,name,room,status,col]) => (
                  <div key={name} className="mock-student">
                    <div className="mock-ava" style={{background:col}}>{init}</div>
                    <span className="mock-sname">{name}</span>
                    <span className="mock-sroom">{room}</span>
                    <span className={`mock-stag ${status==='Active'?'active':'leave'}`}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="float-badge badge-1">
            <span className="fb-icon">✓</span>
            <div><div className="fb-t">Leave approved</div><div className="fb-s">Student notified instantly</div></div>
          </div>
          <div className="float-badge badge-2">
            <span className="fb-icon">💳</span>
            <div><div className="fb-t">₹8,500 received</div><div className="fb-s">Hostel fee · Room A-101</div></div>
          </div>
        </AnimDiv>
      </div>
    </section>
  );
}

/* ── LOGOS STRIP ── */
function Logos() {
  const names = ['VIT','NIT Trichy','SRM','Manipal','BITS Pilani','Anna Univ.','Amity','Lovely Pro.'];
  return (
    <div className="logos-bar">
      <span className="logos-label">Trusted by campuses across India —</span>
      <div className="logos-row">
        {names.map(n => <span key={n} className="logo-chip">{n}</span>)}
      </div>
    </div>
  );
}

/* ── HOW IT WORKS ── */
function Steps() {
  return (
    <section className="section steps-section" id="how-it-works">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <div className="eyebrow">How it works</div>
            <h2 className="section-h2">From first login<br/>to fully operational</h2>
          </div>
          <p className="section-sub">
            No lengthy onboarding. No training sessions required.<br/>
            Most wardens are live within the same afternoon.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-top-row">
                <div className="step-num-badge">{s.num}</div>
                <span className="step-icon-lrg">{s.icon}</span>
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

/* ── FEATURES ── */
function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <div className="eyebrow">Platform features</div>
            <h2 className="section-h2">A complete hostel<br/>operating system</h2>
          </div>
          <p className="section-sub">
            Every tool a modern campus hostel needs —
            purpose-built for Indian universities, not retrofitted from generic software.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feat-card${f.dark ? ' feat-dark' : ''}`}>
              <div className="feat-icon-wrap">
                <span className="feat-emoji">{f.icon}</span>
              </div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── ABOUT + DASHBOARD GRAPHS ── */
function About() {
  return (
    <section className="section about-section" id="about">
      <div className="section-inner">
        {/* header */}
        <div className="section-head">
          <div>
            <div className="eyebrow">About HostelEase</div>
            <h2 className="section-h2">Built for the reality<br/>of Indian campus hostels</h2>
          </div>
          <p className="section-sub">
            HostelEase was created after witnessing wardens drown in paperwork
            and students queue for hours for simple leave signatures.
            We digitalised every step.
          </p>
        </div>

        {/* big stats row */}
        <div className="about-stats-row">
          {ABOUT_STATS.map((s, i) => (
            <div key={i} className="about-stat-card">
              <div className="about-stat-bar" style={{ background: s.color }} />
              <div className="about-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="about-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* dashboard panels */}
        <div className="about-dashboards">

          {/* LEAVE REQUESTS BAR CHART */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <div className="dash-panel-title">Leave Requests</div>
                <div className="dash-panel-sub">Monthly overview · 2025–26</div>
              </div>
              <div className="dash-panel-badge green">↑ 18% this month</div>
            </div>
            <div className="bar-chart">
              {LEAVE_BARS.map((b, i) => (
                <div key={i} className="bar-col">
                  <div className="bar-val">{b.val}</div>
                  <div
                    className="bar-fill"
                    style={{ height: `${(b.val / MAX_BAR) * 100}%` }}
                  />
                  <div className="bar-lbl">{b.month}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend-row">
              <span className="chart-leg-dot green-dot" />
              <span className="chart-leg-txt">Leave applications submitted</span>
              <span className="chart-leg-num">Total: 174 this year</span>
            </div>
          </div>

          {/* CALENDAR + QUICK METRICS */}
          <div className="dash-panel dash-panel-right">

            {/* mini calendar */}
            <div className="mini-cal">
              <div className="cal-header">
                <span className="cal-month">December 2025</span>
                <div className="cal-nav">
                  <button className="cal-nav-btn">‹</button>
                  <button className="cal-nav-btn">›</button>
                </div>
              </div>
              <div className="cal-days-header">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <span key={d} className="cal-day-hd">{d}</span>
                ))}
              </div>
              <div className="cal-grid">
                {/* offset + days */}
                {Array.from({length:6}).map((_,i) => <span key={`e${i}`} />)}
                {Array.from({length:31}).map((_,i) => {
                  const d = i + 1;
                  const hasLeave  = [5,12,18,20,25,27].includes(d);
                  const isToday   = d === 11;
                  const hasEvent  = [3,8,15,22,29].includes(d);
                  return (
                    <span
                      key={d}
                      className={`cal-day ${isToday?'today':''} ${hasLeave?'leave-day':''} ${hasEvent?'event-day':''}`}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
              <div className="cal-legend">
                <span><span className="cl-dot green-dot" /> Leave days</span>
                <span><span className="cl-dot amber-dot" /> Events</span>
                <span><span className="cl-dot blue-dot"  /> Today</span>
              </div>
            </div>

            {/* quick metrics below calendar */}
            <div className="quick-metrics">
              {[
                { label: 'Approved leaves',  val: '38', pct: 78, color: '#16a34a' },
                { label: 'Pending review',   val: '7',  pct: 14, color: '#f59e0b' },
                { label: 'Rejected',         val: '4',  pct:  8, color: '#ef4444' },
              ].map((m, i) => (
                <div key={i} className="qm-row">
                  <div className="qm-info">
                    <span className="qm-label">{m.label}</span>
                    <span className="qm-val">{m.val}</span>
                  </div>
                  <div className="qm-track">
                    <div className="qm-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCCUPANCY DONUT + BREAKDOWN */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <div className="dash-panel-title">Occupancy Breakdown</div>
                <div className="dash-panel-sub">All blocks · Real time</div>
              </div>
              <div className="dash-panel-badge blue">Live</div>
            </div>

            {/* SVG donut */}
            <div className="donut-wrap">
              <svg viewBox="0 0 120 120" className="donut-svg">
                {/* bg circle */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="16"/>
                {/* occupied 91% */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#16a34a" strokeWidth="16"
                  strokeDasharray={`${0.91*301.6} ${301.6}`}
                  strokeDashoffset="75.4"
                  strokeLinecap="round"/>
                {/* pending 5% */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f59e0b" strokeWidth="16"
                  strokeDasharray={`${0.05*301.6} ${301.6}`}
                  strokeDashoffset={`${-(0.91*301.6) + 75.4}`}
                  strokeLinecap="round"/>
                <text x="60" y="55" textAnchor="middle" className="donut-pct">91%</text>
                <text x="60" y="70" textAnchor="middle" className="donut-sub-txt">Occupied</text>
              </svg>
            </div>

            <div className="occ-breakdown">
              {[
                ['#16a34a', 'Occupied',    '284 rooms', '91%'],
                ['#f59e0b', 'Pending',     '16 rooms',   '5%'],
                ['#bbf7d0', 'Vacant',      '9 rooms',    '3%'],
                ['#e2e8f0', 'Maintenance', '3 rooms',    '1%'],
              ].map(([c, l, r, p]) => (
                <div key={l} className="occ-row">
                  <span className="occ-dot" style={{ background: c }} />
                  <span className="occ-lbl">{l}</span>
                  <span className="occ-rooms">{r}</span>
                  <span className="occ-pct">{p}</span>
                </div>
              ))}
            </div>
          </div>

        </div>{/* /about-dashboards */}

        {/* about text blurb */}
        <div className="about-blurb">
          <div className="about-blurb-text">
            <h3 className="about-blurb-h3">Why HostelEase exists</h3>
            <p>
              In 2023, the founders spent a semester in a tier-1 Indian engineering college and watched
              the warden's office handle 800 students with printed registers, WhatsApp forwards and
              handwritten leave slips. Room allocations were done on paper, fees were collected in cash,
              and complaints disappeared into a physical suggestion box.
            </p>
            <p style={{marginTop: '0.85rem'}}>
              HostelEase was built to fix exactly that — a platform that respects the complexity of
              campus hostel operations while making every interaction simple, fast and transparent for
              both wardens and students.
            </p>
          </div>
          <div className="about-blurb-badges">
            {[
              { icon: '🔒', title: 'Razorpay Secured', sub: 'PCI-DSS compliant payments' },
              { icon: '📱', title: 'Android + Web',    sub: 'Works on any device' },
              { icon: '🇮🇳', title: 'Made for India',   sub: 'Built for Indian universities' },
            ].map((b, i) => (
              <div key={i} className="about-badge-card">
                <span className="about-badge-icon">{b.icon}</span>
                <div>
                  <div className="about-badge-title">{b.title}</div>
                  <div className="about-badge-sub">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
function Testimonials() {
  return (
    <section className="section testi-section">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <div className="eyebrow">Loved by campuses</div>
            <h2 className="section-h2">Wardens & students<br/>both agree</h2>
          </div>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">"{t.quote}"</p>
              <div className="testi-author">
                <div className="testi-ava" style={{ background: t.color }}>{t.name[0]}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
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
      <div className="cta-glow" aria-hidden />
      <div className="cta-inner">
        <div className="cta-left">
          <h2 className="cta-h2">Ready to modernise<br/>your <span>hostel?</span></h2>
          <p className="cta-sub">
            Join 130+ hostels already running on HostelEase.
            Setup takes under 30 minutes — no IT team required.
          </p>
        </div>
        <div className="cta-btns">
          <button className="btn-green btn-lg cta-main" onClick={onLogin}>Create free account →</button>
          <button className="btn-white-outline btn-lg" onClick={onLogin}>Download Android APK</button>
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="he-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="he-nav-logo small">
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
          <span className="footer-name">Hostel<em>Ease</em></span>
        </div>
        <div className="footer-links">
          {['Terms','Privacy','For Wardens','For Students','Contact'].map(l => (
            <a key={l} href="#">{l}</a>
          ))}
        </div>
        <span className="footer-copy">© 2026 HostelEase. All rights reserved.</span>
      </div>
    </footer>
  );
}

/* ── PAGE ── */
export default function Home() {
  const navigate = useNavigate();
  const goLogin = () => navigate('/login');

  return (
    <div className="he-page">
      <Navbar onLogin={goLogin} />
      <Hero   onLogin={goLogin} />
      <Logos />
      <Steps />
      <Features />
      <About />
      <Testimonials />
      <CTA onLogin={goLogin} />
      <Footer />
    </div>
  );
}
