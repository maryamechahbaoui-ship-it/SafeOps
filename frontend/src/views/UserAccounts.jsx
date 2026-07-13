import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function UserAccounts({ token }) {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('technicien');
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
      setUsers(uData);

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!fullName || !username) {
      alert('Veuillez remplir le nom et l\'identifiant.');
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
          role,
          site_id: role === 'responsable' ? null : parseInt(siteId)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création');

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

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    try {
      const res = await fetch(`/api/users/${userId}/toggle`, {
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

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: nextStatus };
        }
        return u;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPass = window.prompt(`Saisir le nouveau mot de passe pour ${userName} :`, 'password123');
    if (!newPass) return;

    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur réinitialisation');

      alert('Mot de passe réinitialisé avec succès !');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des comptes...</div>;
  }

  const roleLabels = {
    responsable: 'Responsable Sûreté (Global OCP)',
    superviseur: 'Superviseur de Site',
    technicien: 'Technicien EDET'
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Gestion des Comptes Utilisateurs</h1>
          <p className="page-subtitle">Administrez les habilitations de l'équipe prestataire (Techniciens EDET) et interne OCP.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div className="grid-two-cols">
        {/* Users List */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Tous les Comptes Répertoriés</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.map(u => (
              <div key={u.id} className="user-admin-card" style={{ padding: '1rem 1.25rem' }}>
                <div className="user-admin-info">
                  <span className="user-admin-name" style={{ fontSize: '1rem', fontWeight: 600 }}>{u.full_name}</span>
                  <span className="user-admin-meta" style={{ margin: '0.1rem 0' }}>
                    Username : @{u.username} | Site : {u.site_name}
                  </span>
                  <span className="user-admin-meta" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                    Rôle : {roleLabels[u.role] || u.role}
                  </span>
                </div>
                <div className="user-admin-actions">
                  <button
                    onClick={() => handleResetPassword(u.id, u.full_name)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    Réinitialiser MDP
                  </button>
                  <span className={`badge ${u.status === 'actif' ? 'badge-success' : 'badge-danger'}`} style={{ marginRight: '0.5rem' }}>
                    {u.status === 'actif' ? 'ACTIF' : 'INACTIF'}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(u.id, u.status)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    {u.status === 'actif' ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create User Form */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Nouvel Utilisateur</h3>
          <div className="card">
            <form onSubmit={handleCreateUser}>
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
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Username (ex: amine_surete)"
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
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={btnLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={btnLoading}
                >
                  <option value="technicien">Technicien EDET</option>
                  <option value="superviseur">Superviseur de Site</option>
                  <option value="responsable">Responsable Sûreté (Global OCP)</option>
                </select>
              </div>

              {role !== 'responsable' && (
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
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                disabled={btnLoading}
              >
                <Plus size={16} />
                Créer le Compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
