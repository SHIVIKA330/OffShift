import { useState, useEffect, useCallback } from 'react';
import './rider.css';
import { API, fetchJSON } from '../api';
import type { Rider, Claim } from '../api';

// ═══════════════════════════════════════════════════════════════════════════
// RIDER APP — Main Layout
// ═══════════════════════════════════════════════════════════════════════════

type RiderPage = 'home' | 'cover' | 'claims' | 'profile';

interface RiderAppProps {
  onSwitchToAdmin: () => void;
}

export default function RiderApp({ onSwitchToAdmin }: RiderAppProps) {
  const [page, setPage] = useState<RiderPage>('home');
  const [rider, setRider] = useState<Rider | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [allRiders, setAllRiders] = useState<Rider[]>([]);

  const refreshData = useCallback(async () => {
    const [ridersRes, claimsRes] = await Promise.all([
      fetchJSON(`${API}/riders`),
      fetchJSON(`${API}/claims`),
    ]);
    if (ridersRes.success && ridersRes.data.length > 0) {
      setAllRiders(ridersRes.data);
      setRider(ridersRes.data[0]); // Use the first registered rider
    }
    if (claimsRes.success) setClaims(claimsRes.data);
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 6000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const navItems: { key: RiderPage; icon: string; label: string }[] = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'cover', icon: '🛡️', label: 'My Cover' },
    { key: 'claims', icon: '⚡', label: 'Claims' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="rider-app">
      <div className="rider-shell">

        {/* Top Bar */}
        <div className="rider-topbar">
          <div className="rider-topbar-brand">
            <div className="logo-icon">🛡️</div>
            <span className="logo-text">OffShift</span>
          </div>
          <div className="rider-topbar-actions">
            <div className="notif-btn" onClick={onSwitchToAdmin} title="Switch to Admin Dashboard">
              📊
            </div>
            <div className="notif-btn">
              🔔
              <div className="notif-dot" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="rider-page" key={page}>
          {page === 'home' && <HomePage rider={rider} claims={claims} onNavigate={setPage} />}
          {page === 'cover' && <PlansPage rider={rider} />}
          {page === 'claims' && <ClaimsPage claims={claims} rider={rider} />}
          {page === 'profile' && <ProfilePage rider={rider} allRiders={allRiders} />}
        </div>

        {/* Bottom Navigation */}
        <div className="rider-bottom-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`rider-nav-item ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: HOME DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function HomePage({ rider, claims, onNavigate }: { rider: Rider | null; claims: Claim[]; onNavigate: (p: RiderPage) => void }) {
  const hasActivePolicy = rider?.active_policy != null;
  const riderClaims = claims.filter(c => c.rider_id === rider?.id);
  const totalPaid = riderClaims.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount_paid, 0);

  // Mock weather forecast — in production this would come from the backend
  const forecasts = [
    { day: 'Today', icon: '☀️', temp: '34°C', risk: 'low' },
    { day: 'Thu', icon: '🌧️', temp: '28°C', risk: 'high' },
    { day: 'Fri', icon: '⛈️', temp: '26°C', risk: 'severe' },
    { day: 'Sat', icon: '🌤️', temp: '31°C', risk: 'low' },
    { day: 'Sun', icon: '☀️', temp: '35°C', risk: 'low' },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="rider-greeting">
        <h1>Hey {rider?.name?.split(' ')[0] || 'Rider'} 👋</h1>
        <p>{rider?.platform ? `${rider.platform.charAt(0).toUpperCase() + rider.platform.slice(1)} Rider` : 'Delivery Rider'} · {PINCODES[rider?.pincode || ''] || rider?.pincode || 'Delhi NCR'}</p>
      </div>

      {/* Weather Alert */}
      <div className="weather-alert-badge">
        <span className="alert-icon">🌧️</span>
        <div className="alert-text">
          <strong>Rain Alert — Thursday</strong>
          <span>IMD Red Alert predicted for your zone · Stay covered</span>
        </div>
      </div>

      {/* Coverage Status Card */}
      <div className={`coverage-card ${hasActivePolicy ? 'protected' : 'unprotected'}`}>
        <div className="coverage-header">
          <div className="coverage-status">
            <div className={`status-dot ${hasActivePolicy ? 'green' : 'red'}`} />
            <span className="status-label" style={{ color: hasActivePolicy ? 'var(--green)' : 'var(--red)' }}>
              {hasActivePolicy ? 'Protected' : 'Unprotected'}
            </span>
          </div>
          {hasActivePolicy && (
            <span className="coverage-plan-name">
              {(rider?.active_policy?.plan_type || 'shift_pass').replace('_', ' ')}
            </span>
          )}
        </div>

        {hasActivePolicy ? (
          <>
            <div className="coverage-details">
              <div className="coverage-detail">
                <div className="detail-value">₹{rider?.active_policy?.max_payout || 500}</div>
                <div className="detail-label">Max Payout</div>
              </div>
              <div className="coverage-detail">
                <div className="detail-value">{rider?.active_policy?.plan_type === 'monthly_pro' ? '30d' : rider?.active_policy?.plan_type === 'weekly_pass' ? '7d' : '24h'}</div>
                <div className="detail-label">Duration</div>
              </div>
              <div className="coverage-detail">
                <div className="detail-value">₹{rider?.active_policy?.premium_paid || 49}</div>
                <div className="detail-label">Premium</div>
              </div>
            </div>
            <div className="coverage-expires">
              ⏱️ Expires: {rider?.active_policy?.end_date ? new Date(rider.active_policy.end_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Active'}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 16 }}>
              You're riding without income protection. Get covered in 60 seconds.
            </p>
            <button className="rider-cta teal" onClick={() => onNavigate('cover')}>
              🛡️ Get Covered — Starting ₹49
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <div className="qs-value">{rider?.kavach_score || 0}</div>
          <div className="qs-label">Kavach Score</div>
        </div>
        <div className="quick-stat">
          <div className="qs-value">₹{totalPaid.toLocaleString()}</div>
          <div className="qs-label">Total Payouts</div>
        </div>
        <div className="quick-stat">
          <div className="qs-value">{riderClaims.length}</div>
          <div className="qs-label">Claims Filed</div>
        </div>
        <div className="quick-stat">
          <div className="qs-value">{rider?.trust_score?.toFixed(2) || '0.50'}</div>
          <div className="qs-label">Trust Score</div>
        </div>
      </div>

      {/* 5-Day Weather Forecast */}
      <div className="rider-section-title">📡 5-Day Weather Forecast</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {forecasts.map(f => (
          <div key={f.day} style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 4px',
            background: f.risk === 'severe' ? 'rgba(255, 77, 109, 0.08)' : f.risk === 'high' ? 'rgba(245, 166, 35, 0.08)' : 'var(--navy-card)',
            border: `1px solid ${f.risk === 'severe' ? 'rgba(255, 77, 109, 0.2)' : f.risk === 'high' ? 'rgba(245, 166, 35, 0.2)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{f.day}</div>
            <div style={{ fontSize: 24, margin: '6px 0' }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{f.temp}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {hasActivePolicy ? (
        <button
          className="rider-cta outline mt-20"
          onClick={() => onNavigate('cover')}
        >
          🔄 Upgrade or Renew Your Plan
        </button>
      ) : (
        <button
          className="rider-cta amber mt-20"
          onClick={() => onNavigate('cover')}
        >
          ⚡ Buy Shift Pass — ₹49
        </button>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: PLANS SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function PlansPage({ rider }: { rider: Rider | null }) {
  const plans = [
    {
      name: 'Shift Pass',
      duration: '24 hours',
      price: 49,
      payout: 500,
      badge: null,
      featured: false,
      features: [
        { text: 'Heavy Rain Coverage', included: true },
        { text: 'Heatwave Coverage', included: true },
        { text: 'App Outage Protection', included: false },
        { text: 'Curfew & Strike Cover', included: false },
      ],
    },
    {
      name: 'Weekly Pass',
      duration: '7 days',
      price: 99,
      payout: 1500,
      badge: 'Most Popular',
      featured: true,
      features: [
        { text: 'Heavy Rain Coverage', included: true },
        { text: 'Heatwave Coverage', included: true },
        { text: 'App Outage Protection', included: true },
        { text: 'Curfew & Strike Cover', included: false },
      ],
    },
    {
      name: 'Monthly Pro',
      duration: '30 days',
      price: 349,
      payout: 4000,
      badge: 'Best Value',
      featured: false,
      features: [
        { text: 'Heavy Rain Coverage', included: true },
        { text: 'Heatwave Coverage', included: true },
        { text: 'App Outage Protection', included: true },
        { text: 'Curfew & Strike Cover', included: true },
      ],
    },
  ];

  return (
    <>
      <div className="rider-greeting">
        <h1>Choose Your Shield 🛡️</h1>
        <p>Pick the plan that fits your shift. Cancel anytime.</p>
      </div>

      <div className="plans-grid mt-16">
        {plans.map(plan => (
          <div
            className={`plan-card ${plan.featured ? 'featured' : ''}`}
            key={plan.name}
          >
            {plan.badge && (
              <span className={`plan-badge ${plan.featured ? 'popular' : 'value'}`}>
                ⭐ {plan.badge}
              </span>
            )}

            <div className="plan-header">
              <div className="plan-name">{plan.name}</div>
              <div className="plan-duration">{plan.duration}</div>
            </div>

            <div className="plan-price-row">
              <span className="plan-price">₹{plan.price}</span>
              <span className="plan-price-unit">/{plan.duration.split(' ')[1]}</span>
            </div>

            <div className="plan-features">
              {plan.features.map(f => (
                <div className="plan-feature" key={f.text}>
                  <span className={f.included ? 'check' : 'cross'}>
                    {f.included ? '✅' : '❌'}
                  </span>
                  <span style={{ color: f.included ? 'var(--text-light)' : 'var(--text-dim)' }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="plan-payout">
              <span className="plan-payout-label">Max Payout</span>
              <span className="plan-payout-value">₹{plan.payout.toLocaleString()}</span>
            </div>

            <button className={`plan-buy-btn ${plan.featured ? 'amber' : 'primary'}`}>
              Buy {plan.name} — ₹{plan.price}
            </button>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20,
        padding: 16,
        background: 'var(--navy-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        fontSize: 13,
        color: 'var(--text-light)',
        textAlign: 'center',
      }}>
        💳 Pay via UPI · PhonePe · GPay · Razorpay<br />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Secure payment. Instant activation. No documents required.
        </span>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: CLAIMS FEED
// ═══════════════════════════════════════════════════════════════════════════

function ClaimsPage({ claims, rider }: { claims: Claim[]; rider: Rider | null }) {
  const riderClaims = rider ? claims.filter(c => c.rider_id === rider.id) : [];
  const allClaims = riderClaims.length > 0 ? riderClaims : claims.slice(0, 5); // Show all if rider has none

  const triggerIcons: Record<string, string> = {
    weather: '🌧️', outage: '📱', heatwave: '🔥', curfew: '⛔', aqi: '💨',
  };

  // Show a payout hero for the most recent paid claim
  const latestPaid = allClaims.find(c => c.status === 'paid');

  return (
    <>
      {latestPaid ? (
        <div className="payout-hero">
          <div className="payout-checkmark">✅</div>
          <h2>Payout Confirmed!</h2>
          <p>{latestPaid.trigger_evidence?.substring(0, 60)}</p>
          <div className="hero-amount">₹{latestPaid.amount_paid}</div>
          <span className="hero-time">⚡ Sent in 87 seconds</span>
        </div>
      ) : (
        <div className="rider-greeting">
          <h1>Claims & Payouts ⚡</h1>
          <p>Track your automated claim payouts in real-time</p>
        </div>
      )}

      {/* Payout Timeline (for last claim) */}
      {latestPaid && (
        <div className="claim-card">
          <div className="payout-timeline">
            <div className="timeline-step">
              <div className="timeline-dot done">✓</div>
              <span className="timeline-label done-label">Detected</span>
            </div>
            <div className="timeline-step">
              <div className="timeline-dot done">✓</div>
              <span className="timeline-label done-label">Verified</span>
            </div>
            <div className="timeline-step">
              <div className="timeline-dot done">✓</div>
              <span className="timeline-label done-label">Paid</span>
            </div>
          </div>
        </div>
      )}

      {/* Claims List */}
      <div className="rider-section-title">📋 All Claims</div>

      {allClaims.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛡️</div>
          <h3>No Claims Yet</h3>
          <p>When a disruption hits your zone, your claim will appear here automatically. Zero forms needed.</p>
        </div>
      ) : (
        allClaims.map(c => (
          <div className="claim-card" key={c.id}>
            <div className="claim-header">
              <div className="claim-trigger">
                <div className={`claim-trigger-icon ${c.trigger_type}`}>
                  {triggerIcons[c.trigger_type] || '⚡'}
                </div>
                <div className="claim-trigger-info">
                  <h3>{c.trigger_type.charAt(0).toUpperCase() + c.trigger_type.slice(1)} Trigger</h3>
                  <p>{c.trigger_evidence?.substring(0, 50)}...</p>
                </div>
              </div>
              <div className="claim-amount">
                <div className="rupee">₹{c.amount_paid}</div>
                <div className="time">
                  {c.paid_at
                    ? new Date(c.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'Processing...'}
                </div>
              </div>
            </div>

            <div className="payout-timeline">
              <div className="timeline-step">
                <div className={`timeline-dot ${c.status !== 'pending' ? 'done' : 'active'}`}>
                  {c.status !== 'pending' ? '✓' : '!'}
                </div>
                <span className={`timeline-label ${c.status !== 'pending' ? 'done-label' : 'active-label'}`}>
                  Detected
                </span>
              </div>
              <div className="timeline-step">
                <div className={`timeline-dot ${c.status === 'paid' || c.status === 'processing' ? 'done' : c.status === 'processing' ? 'active' : 'pending'}`}>
                  {c.status === 'paid' ? '✓' : c.status === 'processing' ? '◎' : '·'}
                </div>
                <span className={`timeline-label ${c.status === 'paid' ? 'done-label' : c.status === 'processing' ? 'active-label' : ''}`}>
                  Verified
                </span>
              </div>
              <div className="timeline-step">
                <div className={`timeline-dot ${c.status === 'paid' ? 'done' : 'pending'}`}>
                  {c.status === 'paid' ? '✓' : '·'}
                </div>
                <span className={`timeline-label ${c.status === 'paid' ? 'done-label' : ''}`}>
                  {c.status === 'paid' ? 'Paid ✅' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: KAVACH SCORE / PROFILE
// ═══════════════════════════════════════════════════════════════════════════

function ProfilePage({ rider, allRiders }: { rider: Rider | null; allRiders: Rider[] }) {
  const score = rider?.kavach_score || 50;
  const circumference = Math.PI * 90; // half-circle with r=90
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return '#FF4D6D';
    if (s >= 50) return '#F5A623';
    return '#00D4B1';
  };

  const getRisk = (s: number) => {
    if (s >= 75) return 'High Risk Zone';
    if (s >= 50) return 'Fair Risk';
    return 'Low Risk — Safe Zone';
  };

  const color = getColor(score);

  const factors = [
    { icon: '📍', name: 'Pincode Zone Risk', value: PINCODES[rider?.pincode || ''] || rider?.pincode || 'N/A', type: 'neutral' },
    { icon: '🌧️', name: 'Waterlogging History', value: score > 60 ? 'High' : 'Low', type: score > 60 ? 'negative' : 'positive' },
    { icon: '⏰', name: 'Shift Pattern', value: rider?.shift_pattern || 'mixed', type: 'neutral' },
    { icon: '📊', name: 'Claims Frequency', value: 'Low', type: 'positive' },
    { icon: '🔒', name: 'Trust Score', value: rider?.trust_score?.toFixed(2) || '0.50', type: 'neutral' },
    { icon: '📅', name: 'Days Active', value: `${rider?.days_active || 0} days`, type: 'neutral' },
  ];

  return (
    <>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{rider?.name?.charAt(0) || 'R'}</div>
        <div className="profile-name">{rider?.name || 'Rider'}</div>
        <div className="profile-meta">
          {rider?.platform ? `${rider.platform.charAt(0).toUpperCase() + rider.platform.slice(1)}` : 'Delivery'} · {PINCODES[rider?.pincode || ''] || rider?.pincode || 'Delhi NCR'} · {rider?.upi_id || 'UPI'}
        </div>
      </div>

      {/* Kavach Score Gauge */}
      <div className="kavach-container">
        <div className="rider-section-title" style={{ textAlign: 'center' }}>Kavach Risk Score</div>
        <div className="kavach-gauge">
          <svg viewBox="0 0 200 120">
            <path
              className="gauge-bg"
              d="M 15 110 A 90 90 0 0 1 185 110"
            />
            <path
              className="gauge-fill"
              d="M 15 110 A 90 90 0 0 1 185 110"
              stroke={color}
              strokeDasharray={`${progress} ${circumference}`}
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="gauge-value">
            <div className="gauge-number" style={{ color }}>{score}</div>
            <div className="gauge-label">of 100</div>
          </div>
        </div>

        <div className="kavach-risk-text" style={{ color }}>{getRisk(score)}</div>
        <div className="kavach-premium-text">
          Premium adjusted to <strong style={{ color: 'var(--teal)' }}>₹{Math.max(29, 49 - Math.round((100 - score) * 0.2))}</strong> based on your zone
        </div>

        <div className="kavach-chips">
          <div className="kavach-chip"><span className="chip-icon">🤖</span> XGBoost Model</div>
          <div className="kavach-chip"><span className="chip-icon">🌧️</span> IMD Data</div>
          <div className="kavach-chip"><span className="chip-icon">📡</span> GPS Cluster</div>
          <div className="kavach-chip"><span className="chip-icon">📊</span> Downdetector</div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="rider-section-title">📊 Premium Factors</div>
      <div className="kavach-factors">
        {factors.map(f => (
          <div className="kavach-factor" key={f.name}>
            <div className="kavach-factor-left">
              <span className="kavach-factor-icon">{f.icon}</span>
              <span className="kavach-factor-name">{f.name}</span>
            </div>
            <span className={`kavach-factor-value ${f.type}`}>{f.value}</span>
          </div>
        ))}
      </div>

      {/* Profile Items */}
      <div className="rider-section-title mt-24">⚙️ Account</div>
      <div className="profile-items">
        <div className="profile-item">
          <div className="profile-item-left">
            <span className="pi-icon">📱</span>
            <span className="pi-text">Phone</span>
          </div>
          <span className="profile-item-right">{rider?.phone || '—'}</span>
        </div>
        <div className="profile-item">
          <div className="profile-item-left">
            <span className="pi-icon">💳</span>
            <span className="pi-text">UPI ID</span>
          </div>
          <span className="profile-item-right">{rider?.upi_id || '—'}</span>
        </div>
        <div className="profile-item">
          <div className="profile-item-left">
            <span className="pi-icon">🏍️</span>
            <span className="pi-text">Platform</span>
          </div>
          <span className="profile-item-right">{rider?.platform || '—'}</span>
        </div>
        <div className="profile-item">
          <div className="profile-item-left">
            <span className="pi-icon">📍</span>
            <span className="pi-text">Pincode</span>
          </div>
          <span className="profile-item-right">{rider?.pincode || '—'}</span>
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', paddingBottom: 20 }}>
        OffShift v2.0 · Built for the people who feed the city 🏍️
      </div>
    </>
  );
}

// ─── Pincode Helper ─────────────────────────────────────────────────────────

const PINCODES: Record<string, string> = {
  '110020': 'Okhla', '110025': 'Kalkaji', '110001': 'CP',
  '110045': 'Dwarka', '110017': 'Hauz Khas', '110019': 'Saket',
  '110048': 'Nehru Place', '110070': 'Vasant Kunj', '122001': 'Gurgaon',
  '122002': 'Gurgaon S14', '122018': 'Cyber City', '201301': 'Noida',
  '201303': 'Noida S62', '201304': 'Greater Noida',
  '110085': 'Laxmi Nagar', '110092': 'Shahdara',
};
