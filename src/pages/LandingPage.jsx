import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, TrendingDown, Cpu, Plug, ShieldCheck } from "lucide-react";
import { FiArrowRight, FiAlertTriangle, FiEyeOff } from "react-icons/fi";
import { BsBagFill, BsFillBarChartFill, BsBellFill, BsExclamationTriangleFill, BsFillLightbulbFill } from "react-icons/bs";
import { MdOutlineFlashOn } from "react-icons/md";
import { FaChartBar, FaFire, FaTemperatureLow, FaMagic, FaToggleOn } from "react-icons/fa";
import { FaCoins, FaQ } from "react-icons/fa6";
import { TbWaveSquare } from "react-icons/tb";
import { BsBriefcaseFill } from "react-icons/bs";
import { HiMiniScale } from "react-icons/hi2";
import {
  Home,
  Store,
  Factory,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../pages/landing.css";


export default function LandingPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const sections = ["home", "problem", "solution", "features", "usecases", "pricing", "faq"];

  // ===== Scroll spy =====
  useEffect(() => {
    const handleScroll = () => {
      sections.forEach((sec) => {
        const element = document.getElementById(sec);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) setActive(sec);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  // ================= Navbar =================
  const Navbar = () => (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-circle">
            <Zap size={16} />
          </div>
          <div>
            <h3>ECOSHIED</h3>
            <p className="brand-sub">Smart Energy Guardian</p>
          </div>
        </div>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {sections.map((sec) => (
            <li key={sec}>
              <button
                className={active === sec ? "active" : ""}
                onClick={() => scrollToSection(sec)}
              >
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
              </button>
            </li>
          ))}

          <div className="mobile-buttons">
            <button className="btn-outline">Join waitlist</button>
            <button className="btn-gradient" onClick={() => navigate("/login")}>
              Live Dashboard ⚡
            </button>
          </div>
        </ul>

        <div className="nav-buttons">
          <button className="btn-outline">Join waitlist</button>
          <button className="btn-gradient" onClick={() => navigate("/login")}>
            Live Dashboard ⚡
          </button>
        </div>

        <div className="menu-icon" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </div>
      </div>
    </nav>
  );

  // ================= Hero =================
  const Hero = () => {
    const stats = [
      { icon: <TrendingDown size={18} color="#52ffa8" />, text: "32% lower monthly cost" },
      { icon: <Zap size={18} color="#52ffa8" />, text: "3x faster risk detection" },
      { icon: <Cpu size={18} color="#52ffa8" />, text: "ESP-ready for emerging markets" }
    ];

    return (
      <section id="home" className="hero">
        <div className="hero-left">
          <div className="badge">
            <ShieldCheck size={20} color="#52ffa8" />
            AI-powered energy monitoring & protection
          </div>
          <h1>
            Protect your industrial & <br />
            home space from <span>hidden energy risks.</span>
          </h1>
          <h5>
            ECOSHID connects to your smart-home or industrial hardware to analyze
            electricity in real time, flag voltage threats, and optimize large-scale
            consumption — before damage or surprises hit.
          </h5>
          <div className="stats">
            {stats.map((s, i) => (
              <div key={i}>
                {s.icon}
                {s.text}
              </div>
            ))}
          </div>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => scrollToSection("pricing")}>
              Get early access <FiArrowRight />
            </button>
            <button className="btn-outline">See live dashboard</button>
          </div>
          <p className="security-note">
            <BsBagFill className="lock-icon" color="green" />
            No credit card. Built for factories, enterprises & smart homes.
          </p>
        </div>

        <div className="main-glass-card">
          <div className="top-row">
            <div className="live-title">
              <h3>Live panel — Today</h3>
              <p>
                Voltage risk: <span className="status-medium">Medium</span>
              </p>
            </div>
            <div className="ai-status-button">⚡ AI Guardian ON</div>
          </div>

          <div className="content-layout">
            <div className="consumption-mini-card">
              <div className="stats-header">
                <span className="consumption-title">Consumption • kWh</span>
                <div className="grid-status-pill">
                  <Plug size={16} /> Grid stable
                </div>
              </div>

              <div className="stats-body">
                <div className="numbers">
                  <h2 className="main-value">12.4 kWh</h2>
                  <div className="metrics-list">
                    <div className="metric-row">
                      <span className="metric-label">Voltage</span>
                      <span className="metric-value">231 V</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Current draw</span>
                      <span className="metric-value">7.2 A</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Utilization</span>
                      <span className="metric-value">68%</span>
                    </div>
                    <div className="metric-row highlight">
                      <span className="metric-label">Predicted bill</span>
                      <span className="metric-value">$42.10</span>
                    </div>
                  </div>
                </div>

                <div className="gauge-shell">
                  <div className="gauge-ring"></div>
                  <div className="gauge-progress"></div>
                  <div className="gauge-inner">
                    <strong>70%</strong>
                    <span>Plan used</span>
                  </div>
                  <div className="gauge-pill">
                    <span className="gauge-pill-dot"></span>
                    <span>Monthly limit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-column">
              <div className="info-card risk">
                <div className="risk-header">
                  <h4>Voltage risk flag</h4>
                  <span className="risk-tag">● High spike</span>
                </div>
                <div className="list-row">
                  <span className="list-label">Last spike:</span>
                  <span className="list-value">249 V</span>
                </div>
                <div className="list-row">
                  <span className="list-label">Protected devices:</span>
                  <span className="list-value">7</span>
                </div>
                <div className="list-row">
                  <span className="list-label">Relay mode:</span>
                  <span className="list-value">Auto-cut</span>
                </div>
                <div className="mini-progress">
                  <div className="mini-progress-fill"></div>
                </div>
              </div>

              <div className="info-card tips">
                <div className="tips-header">
                  <h4>Smart tips</h4>
                  <span className="live-tag">
                    <FaMagic size={20} color="#10b981" /> Live
                  </span>
                </div>
                <div className="smart-header">
                  <div className="smart-item">
                    <span className="bullet"></span>
                    <p>
                      Shift laundry to <span>off-peak (after 11pm)</span>.
                    </p>
                  </div>
                  <div className="smart-item">
                    <span className="bullet"></span>
                    <p>AC can drop to <span>23°C</span> with same comfort.</p>
                  </div>
                  <div className="smart-item">
                    <span className="bullet"></span>
                    <p>Standby devices wasting ~<span>0.8 kWh</span>/day.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-footer">Live from ESP device • Updated 5 sec ago</div>
        </div>
      </section>
    );
  };

  // ================= Problem =================
  const Problem = () => (
    <section id="problem" className="ps-section">
      <div className="ps-container">
        <div className="ps-left">
          <span className="ps-badge">● THE PROBLEM</span>
          <h1>Electricity risk is invisible — until it’s expensive.</h1>
          <p className="ps-text">
            Homeowners and small businesses in emerging markets face unstable grids, unpredictable tariffs, and zero visibility into how or when energy is really used.
          </p>

          <div className="ps-problem-box">
            <h4>Without real-time monitoring, you are always reacting late.</h4>
            <div className="ps-grid">
              <div className="ps-card">
                <div className="icon orange"><FiAlertTriangle /></div>
                <div>
                  <h3>Unexpected electricity bills</h3>
                  <p>Tariff changes and peak penalties turn a normal month into a surprise.</p>
                </div>
              </div>
              <div className="ps-card">
                <div className="icon orange"><FaTemperatureLow /></div>
                <div>
                  <h3>Hidden energy waste</h3>
                  <p>AC, heaters, and idle appliances keep drawing power.</p>
                </div>
              </div>
              <div className="ps-card">
                <div className="icon red"><MdOutlineFlashOn /></div>
                <div>
                  <h3>High voltage risks</h3>
                  <p>Spikes silently damage refrigerators and electronics.</p>
                </div>
              </div>
              <div className="ps-card">
                <div className="icon pink"><FiEyeOff /></div>
                <div>
                  <h3>No real-time insight</h3>
                  <p>You only find out when the bill or repair cost arrives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ps-right">
          <span className="ps-badge green">● THE ECOSHIED SOLUTION</span>
          <h1>One AI layer between your devices and the grid.</h1>
          <p className="ps-text">
            ECOSHIED integrates with your industrial, commercial, or smart-home infrastructure to continuously
            sample voltage, current, and usage patterns. Our AI classifies
            risk (Normal / Medium / High) and reacts in milliseconds — providing real-time protection for large enterprises and modern homes.
          </p>
          <div className="ps-solution-box">
            <h4>Real-time brain for your electrons.</h4>
            <p>
              From live kWh tracking to auto relay cut-off,
              ECOSHIED turns raw electrical signals into clear decisions and alerts.
            </p>
          </div>
          <div className="ps-features">
            <div><BsFillBarChartFill color="#0ec96ad9" size={20} /> Real-time data stream from ESP device</div>
            <div><BsExclamationTriangleFill color="#0ec96ad9" size={20} /> AI risk detection (Normal / Medium / High)</div>
            <div><BsFillLightbulbFill color="#0ec96ad9" size={20} /> Smart energy-saving recommendations</div>
            <div><BsBellFill color="#0ec96ad9" size={20} /> Instant alerts & optional relay control</div>
          </div>
        </div>
      </div>
    </section>
  );
  // ================= Feature =================//
  const FeaturesSection = () => {
    const features = [
      { title: "Real-time monitoring", desc: "Stream live voltage, current, and power data from your ESP device with second-level granularity on web or mobile.", icon: <TbWaveSquare size={20} color="#52ffa8" /> },
      { title: "AI risk detection", desc: "Classifies grid health as Normal, Medium, or High risk based on patterns, spikes, and duration — not just raw numbers.", icon: <FaFire size={20} color="#52ffa8" /> },
      { title: "Smart recommendations", icon: <FaMagic size={20} color="#52ffa8" />, desc: "Personalized tips on when to run appliances, what to switch off, and how to stay under your plan." },
      { title: "Remote relay control", icon: <FaToggleOn size={20} color="#52ffa8" />, desc: "Automatically or manually cut power via relay when voltage exceeds safe thresholds — from anywhere." },
      { title: "Monthly energy insights", icon: <FaChartBar size={20} color="#52ffa8" />, desc: "See clear trends, peak hours, and utilization ratios across days, weeks, and months in one clean view." },
      { title: "Local tariff cost estimation", icon: <FaCoins size={20} color="#52ffa8" />, desc: "Plug in your local tariffs and instantly translate kWh into real currency — before the bill arrives." }
    ];

    const howItWorks = [
      {
        step: "01",
        title: "Connect the device",
        desc: "Install the ECOSHIED ESP-powered module near your main distribution board or key circuits. No complex rewiring required."
      },
      {
        step: "02",
        title: "Monitor & catch all data",
        desc: "Watch live dashboards for kWh, voltage, and risk alerts. Learn your consumption patterns over time."
      },
      {
        step: "03",
        title: "Get alerts & optimize usage",
        desc: "Receive instant notifications, smart recommendations, and automatic relay control to protect devices and reduce bills."
      }
    ];

    return (
      <section id="features" className="features-section">
        <div className="features-container">
          {/* الجزء العلوي: Badge وعنوان ووصف */}
          <div className="features-intro">
            <span className="features-pill">● FEATURES</span>
            <h2 className="features-main-title">Everything you need to monitor, predict, and protect.</h2>
            <p className="features-subtitle">
              A single, modern dashboard for your entire electrical footprint — built for factories, companies, and smart homes that want clarity and control.
            </p>
          </div>

          {/* شبكة البطاقات (Grid) */}
          <div className="features-grid-layout">
            {features.map((f, i) => (
              <div className="feature-card-item" key={i}>
                <div className="feature-icon-circle">{f.icon}</div>
                <h3 className="feature-item-title">{f.title}</h3>
                <p className="feature-item-desc">{f.desc}</p>
              </div>

            ))}
          </div>

          {/* How It Works Section */}
          <div className="how-it-works-section">
            <div className="how-it-works-intro">
              <span className="features-pill">● HOW IT WORKS</span>
              <h2 className="features-main-title">From plug-in to peace of mind in three steps.</h2>
            </div>

            <div className="how-it-works-grid">
              {howItWorks.map((item, idx) => (
                <div key={idx} className="how-it-works-card">
                  <div className="how-it-works-step">{item.step}</div>
                  <h3 className="how-it-works-title">{item.title}</h3>
                  <p className="how-it-works-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ================= UseCases =================//
  const UseCases = () => {
    const UseCases = [
      {
        title: "Homes",
        desc: " Protect fridges, AC units, and TVs from surges while understanding which rooms consume the most energy.",
        icon: <Home size={24} color="#52ffa8" />,
      },
      {
        title: "Small business",
        desc: "Track coolers, ovens, and lighting to avoid penalties and optimize opening hours against tariffs.",
        icon: <Store size={24} color="#52ffa8" />,
      },
      {
        title: "Offices",
        desc: "Identify after-hours waste from PCs and HVAC – and automatically enforce shutdown schedules.",
        icon: <BsBriefcaseFill size={24} color="#52ffa8" />
      },
      {
        title: "Industrial monitoring",
        desc: "Supervise motors, pumps, and sensitive industrial equipment where voltage instability means real downtime.",
        icon: <Factory size={24} color="#52ffa8" />,
      },
    ];

    return (
      <section id="usecases" className="use-section">
        <div className="use-intro">
          <span className="features-pill">● USE CASES</span>
          <h2 className="features-main-title">Built for every energy-conscious space.</h2>
        </div>

        <div className="use-grid-layout">
          {UseCases.map((u, i) => (
            <div className="feature-card-item" key={i}>
              <div className="feature-icon-circle">{u.icon}</div>
              <h3 className="feature-item-title">{u.title}</h3>
              <p className="feature-item-desc">{u.desc}</p>
            </div>
          ))}
        </div>

        <section className="why-section">
          <div className="why-container">
            <div className="why-grid">
              <div className="why-left">
                <span className="features-pill">● WHY ECOSHIED</span>
                <h2 className="features-main-title">More than a smart meter. A safety net.</h2>
                <p className="why-desc">
                  ECOSHIED is built specifically for emerging markets — where grid instability, tariffs, and protection
                  challenges are part of everyday life.
                </p>

                <ul className="why-features">
                  <li>
                    <div className="why-icon"><HiMiniScale size={30} color="#52ffa8" /></div>
                    <div className="why-text"><strong className="why-live">Affordable alternative to smart meters</strong>
                      <p>ESP-based hardware keeps costs low while unlocking smart-meter intelligence for any installation.</p>
                    </div>
                  </li>

                  <li>
                    <div className="why-icon"><Zap size={18} color="#52ffa8" /></div>
                    <div className="why-text"><strong className="why-live">Fast, actionable insights</strong>
                      <p>From risk scores to recommendations, the system translates complex electrical signals into simple actions.</p>
                    </div>
                  </li>

                  <li>
                    <div className="why-icon"><Clock size={18} color="#52ffa8" /></div>
                    <div className="why-text"><strong className="why-live">24/7 protection</strong>
                      <p>Voltage thresholds, auto relay cut-off, and spike history protect your most expensive appliances.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="why-right">
                <div className="numbers-panel">
                  <h3 className="numbers-matter">Numbers that matter.</h3>
                  <p className="numbers-intro">
                    During pilot tests, ECOSHIED-style monitoring typically uncovers 10–30%
                    avoidable energy waste in homes and small businesses
                    — much of it from predictable patterns that AI can fix automatically.</p>

                  <div className="numbers-grid">
                    <div className="num-item short">
                      <div className="num-value">10–30%</div>
                      <div className="num-label">average waste exposed</div>
                    </div>

                    <div className="num-item short">
                      <div className="num-value">2–4x</div>
                      <div className="num-label">faster spike detection</div>
                    </div>

                    <div className="num-item full">
                      <div className="num-value">24/7</div>
                      <div className="num-label">protection — even when you're offline</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </section>
    );
  }
  // ================= Pricing =================//
  const Pricing = () => {
    const plans = [
      {
        title: "Basic",
        target: "Homes",
        price: "Coming soon",
        desc: "1 ECOSHIED device • Core monitoring • Mobile & web dashboard",
        features: ["Real-time kWh & voltage", "Basic alerts", "Up to 3 protected circuits"],
        btnText: "Join home waitlist",
        isPro: false
      },
      {
        title: "Pro",
        target: "Most popular",
        price: "Coming soon",
        desc: "Shops, clinics, cafés & offices that want full control and protection.",
        features: ["Everything in Basic", "AI risk classification", "Smart recommendations", "Auto relay control", "Tariff-based cost forecast"],
        btnText: "Join Pro waitlist",
        isPro: true
      },
      {
        title: "Enterprise",
        target: "Custom",
        price: "On request",
        desc: "Multi-site rollouts, industrial monitoring, and API-level integrations.",
        features: ["Custom dashboards", "Advanced analytics exports", "Dedicated support & SLAs"],
        btnText: "Talk to us",
        isPro: false
      }
    ];

    return (
      <div id="pricing" className="pricing-container">
        <div className="pricing-header">
          <span className="badge-pricing">● PRICING</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '20px 0' }}>
            Flexible plans for every footprint.
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: '600px' }}>
            ECOSHIED is in private beta. Lock in early-bird pricing and shape the roadmap by joining the waitlist today.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.isPro ? 'highlight' : ''}`}>
              <div className="card-header">
                <h3 style={{ fontSize: '20px' }}>{plan.title}</h3>
                <span className="plan-target">{plan.target}</span>
              </div>

              <div className="price-section">
                <div className="price-title">{plan.price}</div>
                <p className="plan-description">{plan.desc}</p>
              </div>

              <ul className="features-list">
                {plan.features.map((feat, i) => (
                  <li key={i}><span className="check-icon">✓</span> {feat}</li>
                ))}
              </ul>

              <button className="waitlist-btn">
                {plan.btnText}
              </button>

            </div>

          ))}
        </div>
        <h2 className='not'>
          Coming soon – join the waitlist to be notified as soon as
          pricing is live in your region.
        </h2>
      </div>
    );
  };

  // ================= FAQ =================//
  const FaQ = () => {
    const emailRef = useRef(null);

    const handleRequestDemo = () => {
      if (!emailRef.current.value.trim()) {
        emailRef.current.focus();
        emailRef.current.reportValidity();
      } else {
        // Handle form submission here
        console.log('Email submitted:', emailRef.current.value);
      }
    };

    const faqs = [
      {
        q: "Is ECOSHED safe to install in my home?",
        a: " ECOSHIED is designed to work with certified ESP-based hardware and standard protection components. Installation can be done by a qualified electrician following local regulations, just like any other protective device near your panel.",
      },
      {
        q: "Do I need constant internet for it to work?",
        a: " ECOSHIED continues measuring and protecting locally even if the internet is down. Once connectivity returns, the device syncs data and pushes any missed alerts to your dashboard.",
      },
      {
        q: "What devices can ECOSHED protect?",
        a: " You can protect entire circuits or specific high-value loads such as refrigerators, AC units, freezers, POS systems, or industrial machines connected through the relay output.",
      },
      {
        q: "Can it work with three-phase systems?",
        a: " Yes, ECOSHIED is being designed to support both single-phase and three-phase environments. In multi-phase setups, multiple modules can coordinate to monitor each phase separately.",
      },
      {
        q: "How accurate is the cost estimation?",
        a: "You can input your local tariff structure and any time-of-use rules. ECOSHIED then uses live kWh data to estimate monthly bills — typically within a few percent of your actual bill, depending on local fees and taxes.",
      },
    ];


    const [openIndex, setOpenIndex] = useState(null);

    return (
      <section id="faq" className="faq-section">
        <div className="faq-container">
          {/* Left side - FAQ List */}
          <div className="faq-left">
            <div className="faq-header">
              <span className="faq-tag">● FAQ</span>
              <h2 className="faq-title">Answers to common questions.</h2>
            </div>

            <div className="faq-list">
              {faqs.map((item, idx) => (
                <div
                  key={idx}
                  className={`faq-item ${openIndex === idx ? "open" : ""}`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <div className="faq-question-wrapper">
                    <h3 className="faq-question">{item.q}</h3>
                    <div className="faq-toggle">
                      <span className="toggle-icon">
                        {openIndex === idx ? "−" : "+"}
                      </span>
                    </div>
                  </div>
                  {openIndex === idx && (
                    <div className="faq-answer">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Email Signup */}
          <div className="faq-right">
            <div className="faq-signup">
              <h3>Want to pilot ECOSHIED?</h3>
              <p>
                We are onboarding a limited number of homes and businesses
                into our early-access program. Share your email and we’ll reach out with next steps.
              </p>

              <div className="faq-form">
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  className="faq-email-input"
                  required
                />
                <button className="faq-form-btn" onClick={handleRequestDemo}>Request demo</button>
              </div>

              <p className="faq-privacy">
                We'll only use your email for ECOSHED updates. No spam, ever.
              </p>
            </div>
          </div>
        </div>

        {/* Green CTA Section */}
        <div className="faq-cta">
          <h3 className="faq-cta-title">Ready to make your electricity smarter and safer?</h3>
          <p className="faq-cta-subtitle">
            Join ECOSHIED early access and help us shape the future of AI-powered energy monitoring for modern homes and large-scale industrial enterprises.
          </p>

          <div className="faq-cta-actions">
            <button className="faq-cta-btn">Request Access</button>
            <button className="faq-ct-btn">View Demo</button>
          </div>

          <div className="faq-cta-tags">
            <span className="cta-tag">Industrial-Grade AI Detection</span>
            <span className="cta-tag">Factories, Enterprises & Smart Homes</span>
            <span className="cta-tag">24/7 Grid Protection</span>
            <span className="cta-tag">High-Resolution Analytics</span>
          </div>
        </div>
      </section>
    );
  }



  const Footer = () => {
    return (
      <footer>
        <div className="page-shell footer-inner">
          <p>© <span id="year"></span> ECOSHIED. All rights reserved.</p>
          <div className="footer-links">
            <span>Early access prototype – Not yet a certified protective device.</span>
          </div>
        </div>
      </footer>
    );
  }
  // ================= Return =================//
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <FeaturesSection />
      <UseCases />
      <Pricing />
      <FaQ />
      <Footer />
      {/* باقي الأقسام لو عندك هتضيفيهم هنا */}
    </>
  );
}