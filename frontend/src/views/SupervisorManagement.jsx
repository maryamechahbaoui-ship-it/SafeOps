import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function SupervisorManagement({ token }) {
  const [supervisors, setSupervisors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [siteId, setSiteId] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uRes = await fetch('/api/users', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const uData = await uRes.json();
      if (!uRes.ok) throw new Error(uData.message || 'Erreur utilisateurs');
      setSupervisors(uData.filter(u => u.role === 'superviseur'));

      const siteRes = await fetch('/api/sites', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const siteData = await siteRes.json();
      if (siteRes.ok) {
        const activeSites = siteData.filter(s => s.status === 'actif');
        setSites(activeSites);
        if (activeSites.length > 0) setSiteId(activeSites[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateSupervisor = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !siteId) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    setBtnLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
          role: 'superviseur',
          site_id: parseInt(siteId)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création superviseur');

      setFullName('');
      setUsername('');
      setPassword('password123');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleToggleStatus = async (supId, currentStatus) => {
    const nextStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    try {
      const res = await fetch(`/api/users/${supId}/toggle`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur statut');
      }

      setSupervisors(prev => prev.map(s => {
        if (s.id === supId) {
          return { ...s, status: nextStatus };
        }
        return s;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSupervisor = async (supId, supName) => {
    if (!window.confirm(`Voulez-vous supprimer définitivement le compte superviseur de "${supName}" ?`)) return;

    try {
      const res = await fetch(`/api/users/${supId}`, {
        method: 'DELETE',
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur suppression');
      }
      setSupervisors(prev => prev.filter(s => s.id !== supId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des superviseurs...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Gestion des Superviseurs de Sites</h1>
          <p className="page-subtitle">Gérez les comptes des superviseurs attitrés à un complexe industriel OCP spécifique.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div className="grid-two-cols">
        {/* Supervisors List */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Comptes Superviseurs Actifs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {supervisors.map(s => (
              <div key={s.id} className="site-manage-card" style={{ padding: '1.25rem' }}>
                <div className="site-manage-info">
                  <span className="site-manage-name" style={{ fontSize: '1rem', fontWeight: 600 }}>{s.full_name}</span>
                  <span className="site-manage-date" style={{ margin: '0.15rem 0' }}>Nom d'utilisateur : @{s.username}</span>
                  <span className="site-manage-date" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                    Affecté au site : {s.site_name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge ${s.status === 'actif' ? 'badge-success' : 'badge-danger'}`}>
                    {s.status === 'actif' ? 'ACTIF' : 'INACTIF'}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(s.id, s.status)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    {s.status === 'actif' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleDeleteSupervisor(s.id, s.full_name)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Supervisor Form */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Nouveau Superviseur</h3>
          <div className="card">
            <form onSubmit={handleCreateSupervisor}>
              <div className="form-group">
                <label className="form-label">Nom Complet</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nom Complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={btnLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Identifiant de connexion</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Identifiant de connexion"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={btnLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mot de passe d'accès"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={btnLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Site Affecté</label>
                <select
                  className="form-select"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  disabled={btnLoading}
                >
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                disabled={btnLoading}
              >
                <Plus size={16} />
                Enregistrer Superviseur
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
