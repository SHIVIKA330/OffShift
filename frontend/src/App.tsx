import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { API, fetchJSON } from './api';
import type { Rider, Claim, DashboardStats, WeatherAlert, Toast } from './api';

// ─── Pincode Data ───────────────────────────────────────────────────────────

const PINCODES: Record<string, string> = {
  '110020': 'Okhla', '110025': 'Kalkaji', '110001': 'CP',
  '110045': 'Dwarka', '110017': 'Hauz Khas', '110019': 'Saket',
  '110048': 'Nehru Pl', '110070': 'Vasant Kunj', '122001': 'Gurgaon',
  '122002': 'Gurgaon S14', '122018': 'Cyber City', '201301': 'Noida',
  '201303': 'Noida S62', '201304': 'Gr. Noida',
  '110085': 'Laxmi Ngr', '110092': 'Shahdara',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

function App({ onSwitchToRider }: { onSwitchToRider?: () => void }) {
  const [page, setPage] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [platformStatus, setPlatformStatus] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState('');
  const [connected, setConnected] = useState(false);

  const addToast = useCallback((type: string, message: string, emoji = '🔔') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, emoji }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  // Fetch all data
  const refreshData = useCallback(async () => {
    const [statsRes, ridersRes, claimsRes, weatherRes, outageRes] = await Promise.all([
      fetchJSON(`${API}/analytics/dashboard`),
      fetchJSON(`${API}/riders`),
      fetchJSON(`${API}/claims`),
      fetchJSON(`${API}/webhooks/weather/status`),
      fetchJSON(`${API}/webhooks/outage/status`),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (ridersRes.success) setRiders(ridersRes.data);
    if (claimsRes.success) setClaims(claimsRes.data);
    if (weatherRes.success) setWeatherAlerts(weatherRes.data);
    if (outageRes.success) setPlatformStatus(outageRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // SSE connection for real-time events
  useEffect(() => {
    let es: EventSource;
    try {
      es = new EventSource(`${API}/events`);
      es.addEventListener('connected', () => setConnected(true));
      es.addEventListener('claim_paid', (e) => {
        const d = JSON.parse(e.data);
        addToast('success', `₹${d.amount} paid to ${d.rider_name} (${d.upi_id})`, '🎉');
        refreshData();
      });
      es.addEventListener('weather_alert', (e) => {
        const d = JSON.parse(e.data);
        addToast('warning', `Red Alert in ${d.location_name} — ${d.eligible_policies} policies eligible`, '🌧️');
        refreshData();
      });
      es.addEventListener('outage_alert', (e) => {
        const d = JSON.parse(e.data);
        addToast('error', `${d.platform} outage detected — ${d.rider_count} riders affected`, '📱');
        refreshData();
      });
      es.addEventListener('claim_created', (e) => {
        const d = JSON.parse(e.data);
        addToast('info', `Claim processing: ₹${d.claim.amount_paid} → ${d.rider_name}`, '⚡');
      });
      es.onerror = () => setConnected(false);
    } catch { /* SSE not available */ }
    return () => { if (es) es.close(); };
  }, [addToast, refreshData]);

  // Simulate Storm
  const simulateStorm = async () => {
    setSimulating('storm');
    addToast('warning', 'Simulating IMD Red Alert storm across Delhi NCR...', '⛈️');
    const res = await fetchJSON(`${API}/webhooks/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincodes: ['110020', '122001', '201301', '110045'], rainfall_mm: 78 }),
    });
    if (res.success) {
      addToast('success', `Storm triggered! ${res.data.claims_triggered} claims processing...`, '⛈️');
    }
    await refreshData();
    setTimeout(() => setSimulating(''), 2000);
  };

  // Simulate Outage
  const simulateOutage = async (platform: string) => {
    setSimulating(`outage-${platform}`);
    addToast('error', `Simulating ${platform} platform outage...`, '📱');
    const res = await fetchJSON(`${API}/webhooks/outage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });
    if (res.success) {
      addToast('success', `${platform} outage triggered! ${res.data.claims_triggered} claims processing...`, '📱');
    }
    await refreshData();
    setTimeout(() => setSimulating(''), 2000);
  };

  // Simulate Heatwave
  const simulateHeatwave = async () => {
    setSimulating('heatwave');
    addToast('warning', 'Simulating IMD Severe Heatwave Alert...', '🔥');
    const res = await fetchJSON(`${API}/webhooks/heatwave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincodes: ['110020', '122001', '201301', '110045'], temperature_c: 48.5 }),
    });
    if (res.success) {
      addToast('success', `Heatwave triggered! ${res.data.claims_triggered} claims processing...`, '🔥');
    }
    await refreshData();
    setTimeout(() => setSimulating(''), 2000);
  };

  // Simulate Curfew
  const simulateCurfew = async () => {
    setSimulating('curfew');
    addToast('error', 'Simulating Section 144 Curfew imposition...', '⛔');
    const res = await fetchJSON(`${API}/webhooks/curfew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincodes: ['110020', '110019', '110017'] }),
    });
    if (res.success) {
      addToast('success', `Curfew triggered! ${res.data.claims_triggered} claims processing...`, '⛔');
    }
    await refreshData();
    setTimeout(() => setSimulating(''), 2000);
  };

  // Simulate AQI
  const simulateAQI = async () => {
    setSimulating('aqi');
    addToast('warning', 'Simulating Hazardous AQI spike (> 400)...', '💨');
    const res = await fetchJSON(`${API}/webhooks/aqi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincodes: ['110020', '122001'] }),
    });
    if (res.success) {
      addToast('success', `AQI triggered! ${res.data.claims_triggered} claims processing...`, '💨');
    }
    await refreshData();
    setTimeout(() => setSimulating(''), 2000);
  };

  // Clear simulations
  const clearSim = async () => {
    await fetchJSON(`${API}/webhooks/weather`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear' }) });
    await fetchJSON(`${API}/webhooks/outage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear' }) });
    await fetchJSON(`${API}/webhooks/aqi`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear' }) });
    addToast('info', 'All simulations cleared', '☀️');
    refreshData();
  };

  const pages: Record<string, { icon: string; label: string }> = {
    overview: { icon: '📊', label: 'Overview' },
    map: { icon: '🗺️', label: 'Live Map' },
    riders: { icon: '🏍️', label: 'Riders' },
    claims: { icon: '⚡', label: 'Claims Feed' },
    weather: { icon: '🌧️', label: 'Weather Panel' },
    outage: { icon: '📱', label: 'Outage Monitor' },
    analytics: { icon: '📈', label: 'Analytics' },
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">⚡</div>
            <div className="sidebar-logo-text">
              <h1>OffShift</h1>
              <p>WORKSPACE</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {Object.entries(pages).map(([key, { icon, label }]) => (
            <div
              key={key}
              className={`nav-item ${page === key ? 'active' : ''}`}
              onClick={() => setPage(key)}
            >
              <span className="icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
          <div className="nav-divider" />
          <div className="nav-item" onClick={simulateStorm} style={{ color: simulating === 'storm' ? 'var(--amber)' : undefined }}>
            <span className="icon">⛈️</span>
            <span>{simulating === 'storm' ? 'Simulating...' : 'Simulate Storm'}</span>
          </div>
          <div className="nav-item" onClick={() => simulateOutage('zomato')} style={{ color: simulating === 'outage-zomato' ? 'var(--red)' : undefined }}>
            <span className="icon">🔴</span>
            <span>{simulating === 'outage-zomato' ? 'Simulating...' : 'Simulate Zomato ↓'}</span>
          </div>
          <div className="nav-item" onClick={() => simulateOutage('swiggy')} style={{ color: simulating === 'outage-swiggy' ? 'var(--amber)' : undefined }}>
            <span className="icon">🟠</span>
            <span>{simulating === 'outage-swiggy' ? 'Simulating...' : 'Simulate Swiggy ↓'}</span>
          </div>
          <div className="nav-item" onClick={simulateHeatwave} style={{ color: simulating === 'heatwave' ? 'var(--red)' : undefined }}>
            <span className="icon">🔥</span>
            <span>{simulating === 'heatwave' ? 'Simulating...' : 'Simulate Heatwave'}</span>
          </div>
          <div className="nav-item" onClick={simulateCurfew} style={{ color: simulating === 'curfew' ? 'var(--red)' : undefined }}>
            <span className="icon">⛔</span>
            <span>{simulating === 'curfew' ? 'Simulating...' : 'Simulate Curfew'}</span>
          </div>
          <div className="nav-item" onClick={simulateAQI} style={{ color: simulating === 'aqi' ? 'var(--text-muted)' : undefined }}>
            <span className="icon">💨</span>
            <span>{simulating === 'aqi' ? 'Simulating...' : 'Simulate Haz. AQI'}</span>
          </div>
          <div className="nav-item" onClick={clearSim}>
            <span className="icon">☀️</span>
            <span>Clear Simulations</span>
          </div>
          <div className="nav-divider" />
          {onSwitchToRider && (
            <div className="nav-item" onClick={onSwitchToRider} style={{ color: 'var(--blue)' }}>
              <span className="icon">📱</span>
              <span>Switch to Rider App</span>
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-status">
            <div className="status-dot" style={{ background: connected ? 'var(--green-primary)' : 'var(--red)' }} />
            <span>{connected ? 'Live Connected' : 'Connecting...'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div className="loading-spinner" style={{ width: 40, height: 40 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading OffShift Dashboard...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {page === 'overview' && <OverviewPage stats={stats} claims={claims} />}
            {page === 'map' && <MapPage riders={riders} weatherAlerts={weatherAlerts} />}
            {page === 'riders' && <RidersPage riders={riders} />}
            {page === 'claims' && <ClaimsPage claims={claims} />}
            {page === 'weather' && <WeatherPage alerts={weatherAlerts} />}
            {page === 'outage' && <OutagePage status={platformStatus} />}
            {page === 'analytics' && <AnalyticsPage stats={stats} claims={claims} riders={riders} />}
          </div>
        )}
      </main>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.emoji}</span> {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function OverviewPage({ stats, claims }: { stats: DashboardStats | null; claims: Claim[] }) {
  if (!stats) return null;

  const activePolicyCoverage = stats.active_policies > 0
    ? Math.round((stats.active_policies / stats.total_riders) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Real-time parametric insurance metrics for Delhi NCR</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-info">
            <h3>Total Riders</h3>
            <div className="stat-value">{stats.total_riders}</div>
            <div className="stat-change positive">↑ Active in Delhi NCR</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🛡️</div>
          <div className="stat-info">
            <h3>Active Policies</h3>
            <div className="stat-value">{stats.active_policies}</div>
            <div className="stat-change positive">{activePolicyCoverage}% coverage rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚡</div>
          <div className="stat-info">
            <h3>Claims Paid Today</h3>
            <div className="stat-value">{stats.claims_paid_today}</div>
            <div className="stat-change positive">Auto-processed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-info">
            <h3>Total Payouts</h3>
            <div className="stat-value">₹{stats.total_payout_amount.toLocaleString()}</div>
            <div className="stat-change positive">₹{stats.total_premium_collected.toLocaleString()} collected</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recent Claims Feed */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ Recent Claims</span>
            <span className="badge badge-blue">{claims.length} total</span>
          </div>
          {claims.slice(0, 6).map(c => (
            <div className="feed-item" key={c.id}>
              <div className="feed-icon" style={{
                background: c.status === 'paid' ? 'var(--teal-glow)' : c.status === 'processing' ? 'var(--amber-glow)' : 'var(--red-glow)',
                borderColor: c.status === 'paid' ? 'var(--teal-muted)' : 'transparent',
                color: c.status === 'paid' ? 'var(--teal)' : c.status === 'processing' ? 'var(--amber)' : 'var(--red)'
              }}>
                {c.status === 'paid' ? '⚡' : c.status === 'processing' ? '⏳' : '❌'}
              </div>
              <div className="feed-content">
                <span className="name">{c.rider_name || 'Unknown'}</span>
                <span style={{ color: 'var(--teal)', fontWeight: 700, marginLeft: 8 }}>₹{c.amount_paid}</span>
                <p>{c.trigger_evidence?.substring(0, 70)}...</p>
              </div>
              <div className="feed-time">
                <span className={`badge ${c.status === 'paid' ? 'badge-green' : c.status === 'processing' ? 'badge-orange' : 'badge-red'}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Plan Distribution</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
            {[
              { type: 'Shift Pass (24hr)', count: stats.plan_distribution.shift_pass || 0, color: 'var(--teal)', max: 500 },
              { type: 'Weekly Pass (7 days)', count: stats.plan_distribution.weekly_pass || 0, color: 'var(--amber)', max: 1500 },
              { type: 'Monthly Pro (30 days)', count: stats.plan_distribution.monthly_pro || 0, color: 'var(--blue)', max: 4000 },
            ].map(plan => (
              <div key={plan.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{plan.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: plan.color }}>{plan.count} active</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.max(plan.count * 10, 5)}%`,
                    background: `linear-gradient(90deg, ${plan.color}, ${plan.color}88)`,
                  }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max payout: ₹{plan.max}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Loss Ratio (Premiums vs Payouts)
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, marginBottom: 4 }}>
                  ₹{stats.total_premium_collected.toLocaleString()} collected
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: '100%', background: 'var(--teal)' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>
                  ₹{stats.total_payout_amount.toLocaleString()} paid out
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{
                    width: `${Math.min((stats.total_payout_amount / Math.max(stats.total_premium_collected, 1)) * 100, 100)}%`,
                    background: 'var(--red)',
                  }} />
                </div>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 12, color: stats.total_payout_amount > stats.total_premium_collected ? 'var(--red)' : 'var(--teal)' }}>
              {stats.total_premium_collected > 0 ? Math.round((stats.total_payout_amount / stats.total_premium_collected) * 100) : 0}%
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>loss ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rider Distribution */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🗺️ Rider Distribution by Pincode</span>
        </div>
        <div className="map-grid">
          {Object.entries(stats.rider_distribution).map(([pin, count]) => (
            <div className="map-cell safe" key={pin}>
              <div className="location">{PINCODES[pin] || pin}</div>
              <div className="pincode">{pin}</div>
              <div className="riders" style={{ color: 'var(--green-primary)' }}>{count}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>riders</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: LIVE MAP
// ═══════════════════════════════════════════════════════════════════════════

function MapPage({ riders, weatherAlerts }: { riders: Rider[]; weatherAlerts: WeatherAlert[] }) {
  const alertMap: Record<string, string> = {};
  weatherAlerts.forEach(a => { alertMap[a.pincode] = a.alert_level; });

  const ridersByPincode: Record<string, Rider[]> = {};
  riders.forEach(r => {
    if (!ridersByPincode[r.pincode]) ridersByPincode[r.pincode] = [];
    ridersByPincode[r.pincode].push(r);
  });

  return (
    <>
      <div className="page-header">
        <h2>Live Map — Delhi NCR</h2>
        <p>Active riders and weather status by pincode zone</p>
      </div>

      <div className="map-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {Object.entries(PINCODES).map(([pin, name]) => {
          const alert = alertMap[pin] || 'green';
          const riderCount = ridersByPincode[pin]?.length || 0;
          const activeCount = ridersByPincode[pin]?.filter(r => r.active_policy).length || 0;
          
          const className = alert === 'red' ? 'danger' : alert === 'orange' ? 'warning' : 'safe';

          return (
            <div className={`map-cell ${className}`} key={pin}>
              <div className="location">{name}</div>
              <div className="pincode">{pin}</div>
              <div className="riders" style={{
                color: alert === 'red' ? 'var(--red)' : alert === 'orange' ? 'var(--orange)' : 'var(--green-primary)'
              }}>
                {riderCount}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                {activeCount} insured
              </div>
              {alert !== 'green' && (
                <div className="alert-badge" style={{
                  background: alert === 'red' ? 'var(--red-glow)' : 'var(--orange-glow)',
                  color: alert === 'red' ? 'var(--red)' : 'var(--orange)',
                }}>
                  {alert} alert
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">📡 Legend</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--green-primary)' }} /> Safe — No alerts</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--yellow)' }} /> Yellow — Advisory</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--orange)' }} /> Orange — Warning</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--red)' }} /> Red — Danger (auto-payout triggered)</div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: RIDERS
// ═══════════════════════════════════════════════════════════════════════════

function RidersPage({ riders }: { riders: Rider[] }) {
  return (
    <>
      <div className="page-header">
        <h2>Riders</h2>
        <p>{riders.length} registered riders across Delhi NCR</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rider</th>
              <th>Phone</th>
              <th>Pincode</th>
              <th>Platform</th>
              <th>Kavach Score</th>
              <th>Trust Score</th>
              <th>Active Policy</th>
              <th>Last Payout</th>
              <th>Days Active</th>
            </tr>
          </thead>
          <tbody>
            {riders.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white',
                    }}>
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.upi_id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{r.phone}</td>
                <td>
                  <span style={{ fontSize: 12 }}>{PINCODES[r.pincode] || r.pincode}</span>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.pincode}</div>
                </td>
                <td>
                  <span className={`badge ${r.platform === 'zomato' ? 'badge-red' : r.platform === 'swiggy' ? 'badge-orange' : 'badge-purple'}`}>
                    {r.platform}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 60, height: 6 }}>
                    <div className="progress-fill" style={{
                        width: `${r.kavach_score}%`,
                        background: r.kavach_score > 70 ? 'var(--red)' : r.kavach_score > 50 ? 'var(--amber)' : 'var(--teal)',
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{r.kavach_score}</span>
                  </div>
                </td>
                <td>
                  <span style={{ color: r.trust_score > 0.8 ? 'var(--green-primary)' : r.trust_score > 0.6 ? 'var(--yellow)' : 'var(--red)', fontWeight: 700 }}>
                    {r.trust_score.toFixed(2)}
                  </span>
                </td>
                <td>
                  {r.active_policy ? (
                    <span className="badge badge-green">{r.active_policy.plan_type.replace('_', ' ')}</span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>none</span>
                  )}
                </td>
                <td>
                  {r.last_payout ? (
                    <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>₹{r.last_payout.amount}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td>{r.days_active}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: CLAIMS FEED
// ═══════════════════════════════════════════════════════════════════════════

function ClaimsPage({ claims }: { claims: Claim[] }) {
  return (
    <>
      <div className="page-header">
        <h2>Claims Feed</h2>
        <p>Real-time claims processing — 120-second auto-payout</p>
      </div>

      {claims.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <h3 style={{ color: 'var(--text-secondary)' }}>No Claims Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Use the "Simulate Storm" or "Simulate Outage" buttons to trigger auto-claims
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {claims.map(c => (
            <div className="card" key={c.id} style={{
              borderLeft: `4px solid ${c.status === 'paid' ? 'var(--green-primary)' : c.status === 'processing' ? 'var(--orange)' : 'var(--red)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{c.trigger_type === 'weather' ? '🌧️' : c.trigger_type === 'outage' ? '📱' : c.trigger_type === 'heatwave' ? '🔥' : c.trigger_type === 'curfew' ? '⛔' : c.trigger_type === 'aqi' ? '💨' : '🚫'}</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{c.rider_name || 'Unknown'}</span>
                    <span className={`badge ${c.status === 'paid' ? 'badge-green' : c.status === 'processing' ? 'badge-orange' : 'badge-red'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {c.trigger_evidence}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Claim: {c.id}</span>
                    {c.upi_txn_id && <span>Txn: {c.upi_txn_id}</span>}
                    {c.rider_upi && <span>UPI: {c.rider_upi}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-primary)' }}>₹{c.amount_paid}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {c.paid_at ? new Date(c.paid_at).toLocaleString('en-IN') : new Date(c.created_at).toLocaleString('en-IN')}
                  </div>
                  {c.status === 'processing' && (
                    <div className="payout-timer" style={{ marginTop: 8 }}>
                      <div className="loading-spinner" style={{ width: 14, height: 14 }} />
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: WEATHER PANEL
// ═══════════════════════════════════════════════════════════════════════════

function WeatherPage({ alerts }: { alerts: WeatherAlert[] }) {
  const alertColors: Record<string, string> = {
    red: 'var(--red)', orange: 'var(--orange)', yellow: 'var(--yellow)', green: 'var(--green-primary)'
  };
  const alertBg: Record<string, string> = {
    red: 'var(--red-glow)', orange: 'var(--orange-glow)', yellow: 'var(--yellow-glow)', green: 'var(--green-glow)'
  };

  return (
    <>
      <div className="page-header">
        <h2>Weather Panel</h2>
        <p>IMD alert status across Delhi NCR pincodes — 48hr forecast</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon red">🔴</div>
          <div className="stat-info">
            <h3>Red Alerts</h3>
            <div className="stat-value">{alerts.filter(a => a.alert_level === 'red').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🟠</div>
          <div className="stat-info">
            <h3>Orange Alerts</h3>
            <div className="stat-value">{alerts.filter(a => a.alert_level === 'orange').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🟢</div>
          <div className="stat-info">
            <h3>Safe Zones</h3>
            <div className="stat-value">{alerts.filter(a => a.alert_level === 'green' || a.alert_level === 'yellow').length}</div>
          </div>
        </div>
      </div>

      <div className="weather-grid">
        {alerts.map(a => (
          <div className="weather-cell" key={a.pincode} style={{
            borderColor: alertColors[a.alert_level] || 'var(--border-color)',
            background: alertBg[a.alert_level] || 'transparent',
          }}>
            <div className="location">{a.location_name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.pincode}</div>
            <div className="details" style={{ marginTop: 6 }}>
              <div>🌧️ {a.rainfall_mm}mm/hr</div>
              <div>🌡️ {a.temperature_c}°C</div>
            </div>
            <div className="alert-badge" style={{
              background: alertBg[a.alert_level],
              color: alertColors[a.alert_level],
              marginTop: 8,
            }}>
              {a.alert_level.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              Source: {a.source}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: OUTAGE MONITOR
// ═══════════════════════════════════════════════════════════════════════════

function OutagePage({ status }: { status: any }) {
  return (
    <>
      <div className="page-header">
        <h2>Outage Monitor</h2>
        <p>Platform health monitoring — Zomato & Swiggy outage detection</p>
      </div>

      <div className="grid-2">
        {['zomato', 'swiggy'].map(platform => {
          const s = status?.[platform];
          const isDown = s?.is_down;
          return (
            <div className="card" key={platform} style={{
              borderColor: isDown ? 'var(--red)' : 'var(--green-primary)',
              borderWidth: 2,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{platform === 'zomato' ? '🔴' : '🟠'}</span>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, textTransform: 'capitalize' }}>{platform}</h3>
                    <span className={`badge ${isDown ? 'badge-red' : 'badge-green'}`}>
                      {isDown ? '🔴 DOWN' : '🟢 OPERATIONAL'}
                    </span>
                  </div>
                </div>
              </div>

              {s && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Downdetector Reports (30min)</span>
                    <span style={{ fontWeight: 700 }}>{s.reports_30min}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Confidence Score</span>
                    <span style={{ fontWeight: 700, color: s.confidence > 0.7 ? 'var(--red)' : 'var(--green-primary)' }}>
                      {(s.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Anomaly Detected</span>
                    <span>{s.anomaly_detected ? '⚠️ Yes' : '✅ No'}</span>
                  </div>
                  {isDown && s.affected_pincodes?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>Affected Pincodes:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {s.affected_pincodes.map((p: string) => (
                          <span key={p} className="badge badge-red">{PINCODES[p] || p} ({p})</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE: ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

function AnalyticsPage({ stats, claims, riders }: { stats: DashboardStats | null; claims: Claim[]; riders: Rider[] }) {
  if (!stats) return null;

  const paidClaims = claims.filter(c => c.status === 'paid');
  const weatherClaims = paidClaims.filter(c => c.trigger_type === 'weather').length;
  const outageClaims = paidClaims.filter(c => c.trigger_type === 'outage').length;
  const heatwaveClaims = paidClaims.filter(c => c.trigger_type === 'heatwave').length;
  const curfewClaims = paidClaims.filter(c => c.trigger_type === 'curfew').length;
  const aqiClaims = paidClaims.filter(c => c.trigger_type === 'aqi').length;

  const zomatoRiders = riders.filter(r => r.platform === 'zomato' || r.platform === 'both').length;
  const swiggyRiders = riders.filter(r => r.platform === 'swiggy' || r.platform === 'both').length;

  const avgKavach = riders.length > 0 ? Math.round(riders.reduce((s, r) => s + r.kavach_score, 0) / riders.length) : 0;
  const avgTrust = riders.length > 0 ? (riders.reduce((s, r) => s + r.trust_score, 0) / riders.length).toFixed(2) : '0';

  // Premium breakdown by plan
  const premiumByDay = [420, 380, 510, 290, 650, 380, 480]; // Mock weekly data

  return (
    <>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Premium collection, claims paid, conversion rates, and plan distribution</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">📊</div>
          <div className="stat-info">
            <h3>Avg Kavach Score</h3>
            <div className="stat-value">{avgKavach}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🔒</div>
          <div className="stat-info">
            <h3>Avg Trust Score</h3>
            <div className="stat-value">{avgTrust}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🌧️</div>
          <div className="stat-info">
            <h3>Weather Claims</h3>
            <div className="stat-value">{weatherClaims}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📱</div>
          <div className="stat-info">
            <h3>Outage Claims</h3>
            <div className="stat-value">{outageClaims}</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Weekly Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">💰 Weekly Premium Revenue (₹)</span>
          </div>
          <div className="bar-chart">
            {premiumByDay.map((val, i) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const maxVal = Math.max(...premiumByDay);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="bar" style={{
                    height: `${(val / maxVal) * 150}px`,
                    background: `linear-gradient(180deg, var(--teal), var(--teal-dark))`,
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                  }}>
                    <div className="tooltip">₹{val}</div>
                  </div>
                  <div className="bar-label">{days[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏍️ Platform & Coverage</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🔴 Zomato Riders</span>
                <span style={{ fontWeight: 700 }}>{zomatoRiders}</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{
                  width: `${(zomatoRiders / riders.length) * 100}%`,
                  background: 'var(--red)',
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🟠 Swiggy Riders</span>
                <span style={{ fontWeight: 700 }}>{swiggyRiders}</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{
                  width: `${(swiggyRiders / riders.length) * 100}%`,
                  background: 'var(--orange)',
                }} />
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Conversion Funnel</div>
              {[
                { label: 'Registered', value: riders.length, pct: 100 },
                { label: 'Active Policy', value: stats.active_policies, pct: Math.round((stats.active_policies / riders.length) * 100) },
                { label: 'Claims Filed', value: claims.length, pct: Math.round((claims.length / Math.max(riders.length, 1)) * 100) },
                { label: 'Claims Paid', value: paidClaims.length, pct: Math.round((paidClaims.length / Math.max(riders.length, 1)) * 100) },
              ].map(step => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 80, fontSize: 12, color: 'var(--text-secondary)' }}>{step.label}</div>
                  <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                    <div className="progress-fill" style={{
                      width: `${step.pct}%`,
                      background: 'linear-gradient(90deg, var(--green-primary), var(--blue))',
                    }} />
                  </div>
                  <div style={{ width: 50, fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{step.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Claims breakdown */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📊 Claims by Trigger Type</span>
        </div>
        <div style={{ display: 'flex', gap: 24, padding: '16px 0' }}>
          {[
            { type: 'Weather', icon: '🌧️', count: weatherClaims, color: 'var(--blue)' },
            { type: 'Heatwave', icon: '🔥', count: heatwaveClaims, color: 'var(--red)' },
            { type: 'Outage', icon: '📱', count: outageClaims, color: 'var(--orange)' },
            { type: 'Curfew', icon: '⛔', count: curfewClaims, color: 'var(--purple)' },
            { type: 'Haz. AQI', icon: '💨', count: aqiClaims, color: 'var(--text-muted)' },
            { type: 'Total Paid', icon: '✅', count: paidClaims.length, color: 'var(--green-primary)' },
          ].map(item => (
            <div key={item.type} style={{
              flex: 1, textAlign: 'center', padding: 20,
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: 32 }}>{item.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.color, marginTop: 8 }}>{item.count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.type}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
