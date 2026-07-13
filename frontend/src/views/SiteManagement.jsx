import React, { useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export default function SiteManagement({ token }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sites', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur sites');
      setSites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [token]);

  const handleCreateSite = async (e) => {
    e.preventDefault();
    if (!name) return;

    setBtnLoading(true);
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la création');

      setName('');
      fetchSites();
    } catch (err) {
      alert(err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleToggleStatus = async (siteId, currentStatus) => {
    const nextStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    try {
      const res = await fetch(`/api/sites/${siteId}/toggle`, {
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

      setSites(prev => prev.map(s => {
        if (s.id === siteId) {
          return { ...s, status: nextStatus };
        }
        return s;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSite = async (siteId, siteName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le site "${siteName}" ainsi que ses utilisateurs et équipements liés ?`)) return;

    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE',
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      setSites(prev => prev.filter(s => s.id !== siteId));
    } catch (err) {
      alert(err.message);
    }
  };


  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des sites...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Gestion des Sites OCP</h1>
          <p className="page-subtitle">Ajoutez de nouveaux sites de production OCP ou modifiez/désactivez des comptes de sites.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div className="grid-two-cols">
        {/* Sites List */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Secteurs Géographiques</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sites.map(s => (
              <div key={s.id} className="site-manage-card">
                <div className="site-manage-info">
                  <span className="site-manage-name" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {s.name}
                  </span>
                  <span className="site-manage-date">Créé le : {s.created_at.split('T')[0]}</span>
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
                    onClick={() => handleDeleteSite(s.id, s.name)}
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

        {/* Create Site Form */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Nouveau Site</h3>
          <div className="card">
            <form onSubmit={handleCreateSite}>
              <div className="form-group">
                <label className="form-label">Nom du Site OCP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nom du Site OCP (ex: Safi)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={btnLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                disabled={btnLoading}
              >
                <Plus size={16} />
                Créer le Site
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
