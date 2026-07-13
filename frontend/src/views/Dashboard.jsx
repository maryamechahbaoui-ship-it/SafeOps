import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Award, EyeOff, MapPin } from 'lucide-react';

export default function Dashboard({ user, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [sites, setSites] = useState([]);

  useEffect(() => {
    // Fetch sites first
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/sites', {
          credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
        });
        const list = await res.json();
        setSites(list);
      } catch (err) {
        console.error('Error fetching sites', err);
      }
    };
    fetchSites();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let url = '/api/dashboard';
      if (siteFilter) {
        url += `?site_id=${siteFilter}`;
      }
      const response = await fetch(url, {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Erreur chargement stats');
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, siteFilter]);

  if (loading && !data) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="card" style={{ padding: '2rem', color: 'var(--status-danger)', textAlign: 'center' }}>Erreur : {error}</div>;
  }

  const { metrics, zoneBreakdown, siteStats } = data;

  // Find active site name for display
  const activeSiteName = user.role === 'responsable' 
    ? (siteFilter ? (sites.find(s => s.id === parseInt(siteFilter))?.name || '') : 'Tous les sites')
    : user.site_name;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">
            {user.role === 'responsable' ? 'Dashboard National OCP Sûreté' : `Supervision Sûreté OCP - Site ${activeSiteName}`}
          </h1>
          <p className="page-subtitle">Statistiques de maintenance curative et préventive en temps réel.</p>
        </div>

        {user.role === 'responsable' && (
          <div>
            <select
              className="form-select"
              style={{ width: '200px' }}
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
            >
              <option value="">Tous les sites</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Équipements Total</span>
              <div className="stat-value">{metrics.equipements_total}</div>
            </div>
            <div style={{ color: 'var(--primary)', padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex' }}>
              <Activity size={18} />
            </div>
          </div>
          <span className="stat-subtext">Disponibilité : {metrics.disponibilite}%</span>
        </div>

        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Tickets Ouverts / En Cours</span>
              <div className="stat-value" style={{ color: metrics.tickets_ouverts > 0 ? 'var(--status-warning)' : 'inherit' }}>
                {metrics.tickets_ouverts}
              </div>
            </div>
            <div style={{ color: 'var(--status-warning)', padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--status-warning-bg)', display: 'flex' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <span className="stat-subtext">À traiter en urgence par EDET</span>
        </div>

        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Conformité GTI (Interv)</span>
              <div className="stat-value" style={{ color: 'var(--status-success)' }}>100%</div>
            </div>
            <div style={{ color: 'var(--status-success)', padding: '0.4rem', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', display: 'flex' }}>
              <Award size={18} />
            </div>
          </div>
          <span className="stat-subtext">Délai contractuel max : 2 heures</span>
        </div>

        <div className="card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Règle des 5% Clôtures</span>
              <div className="stat-value">0%</div>
            </div>
            <div style={{ color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex' }}>
              <EyeOff size={18} />
            </div>
          </div>
          <span className="stat-subtext">SLA Standard Actif</span>
        </div>
      </div>

      {/* Sites Grid (Only for global OCP safety manager) */}
      {user.role === 'responsable' && !siteFilter && siteStats.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Statistiques par Site</h3>
          <div className="site-summary-grid">
            {siteStats.map(s => (
              <div key={s.id} className="site-summary-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="site-summary-name">{s.name}</span>
                </div>
                <div className="site-summary-row">
                  <span>Parc:</span>
                  <strong>{s.parc}</strong>
                </div>
                <div className="site-summary-row">
                  <span>En panne:</span>
                  <span className={s.en_panne > 0 ? 'alert-count' : ''}>{s.en_panne}</span>
                </div>
                <div className="site-summary-row">
                  <span>Tickets:</span>
                  <strong>{s.tickets}</strong>
                </div>
                <div className="site-summary-status">
                  <span className="badge badge-success">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone Failures Breakdown Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title">Répartition des pannes par zone</h3>
        {zoneBreakdown.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Aucune panne active répertoriée.
          </div>
        ) : (
          <div className="chart-container">
            <div className="bar-chart-wrapper">
              {zoneBreakdown.map((z, idx) => {
                // Find maximum count for scaling (default min 4 to keep chart tidy)
                const maxVal = Math.max(4, ...zoneBreakdown.map(item => item.count));
                const heightPercent = (z.count / maxVal) * 150; // max height 150px
                return (
                  <div key={idx} className="chart-bar-item">
                    <span className="chart-bar-value">{z.count}</span>
                    <div className="chart-bar" style={{ height: `${heightPercent}px`, backgroundColor: z.count > 0 ? 'var(--primary)' : 'var(--border)' }}></div>
                    <span className="chart-bar-label" title={z.zone}>{z.zone}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
