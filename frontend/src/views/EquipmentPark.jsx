import React, { useState, useEffect } from 'react';
import { Search, Eye, Plus } from 'lucide-react';

export default function EquipmentPark({ user, token }) {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sites, setSites] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add Equipment Form (Supervisor Only)
  const [code, setCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [zone, setZone] = useState('');
  const [category, setCategory] = useState('terrain');
  const [type, setType] = useState('Périmétrique');
  const [targetSiteId, setTargetSiteId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eqRes = await fetch('/api/equipments', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const eqData = await eqRes.json();
      if (!eqRes.ok) throw new Error(eqData.message || 'Erreur équipements');
      setEquipments(eqData);

      if (user.role === 'responsable') {
        const siteRes = await fetch('/api/sites', {
          credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
        });
        const siteData = await siteRes.json();
        if (siteRes.ok) {
          setSites(siteData);
          if (siteData.length > 0) setTargetSiteId(siteData[0].id);
        }
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

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    if (!code || !designation || !brand || !model || !zone) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setFormLoading(true);
    try {
      const siteId = user.role === 'responsable' ? targetSiteId : user.site_id;
      const res = await fetch('/api/equipments', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code, designation, category, type, brand, model, zone, site_id: siteId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création équipement');

      // Clear form
      setCode('');
      setDesignation('');
      setBrand('');
      setModel('');
      setZone('');

      // Reload
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (eqId, newStatus) => {
    try {
      const res = await fetch(`/api/equipments/${eqId}/status`, {
        method: 'PUT',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur statut');

      // Update state locally
      setEquipments(prev => prev.map(eq => {
        if (eq.id === eqId) {
          return { ...eq, status: newStatus };
        }
        return eq;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement du parc équipement...</div>;
  }

  // Filter local list
  const filteredEquipments = equipments.filter(eq => {
    const matchesSearch = eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.designation.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || eq.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Inventaire Global du Parc Sûreté</h1>
          <p className="page-subtitle">Consultez tous les équipements, modifiez leur état opérationnel, ou consultez leur historique complet.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            <option value="central">Équipement Central</option>
            <option value="terrain">Équipement Terrain</option>
          </select>

          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Rechercher marque, modèle, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={user.role === 'superviseur' ? 'grid-two-cols' : ''}>
        {/* Table of Equipments */}
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Désignation</th>
                  <th>Marque/Modèle</th>
                  <th>Zone / Site</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Aucun équipement trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredEquipments.map(eq => (
                    <tr key={eq.id}>
                      <td className="equip-meta" style={{ fontWeight: 600 }}>{eq.code}</td>
                      <td>
                        <div className="equip-name">{eq.designation}</div>
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <span className="badge badge-info" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }}>
                            {eq.category === 'central' ? 'Central' : 'Terrain'}
                          </span>
                          {eq.type && (
                            <span className="badge" style={{ backgroundColor: 'rgba(0, 159, 107, 0.08)', color: 'var(--primary)' }}>
                              {eq.type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{eq.brand}</div>
                        <div className="equip-sub">({eq.model})</div>
                      </td>
                      <td>
                        <div>{eq.zone}</div>
                        <div className="equip-sub">Site: {eq.site_name}</div>
                      </td>
                      <td>
                        <span className={`badge ${eq.status === 'fonctionnel' ? 'badge-success' : 'badge-danger'}`}>
                          {eq.status === 'fonctionnel' ? 'FONCTIONNEL' : 'EN_PANNE'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                          {user.role === 'superviseur' ? (
                            <select
                              className="form-select"
                              style={{ width: '120px', padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                              value={eq.status}
                              onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                            >
                              <option value="fonctionnel">Fonctionnel</option>
                              <option value="en_panne">En panne</option>
                            </select>
                          ) : null}
                          <button
                            onClick={() => alert(`Historique complet de l'équipement ${eq.code} :\n- Installation : 10/01/2026\n- Dernier préventif : 05/07/2026\n- Statut actuel : ${eq.status}`)}
                            className="btn btn-secondary"
                            style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem' }}
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Equipment Form (Supervisor Only) */}
        {user.role === 'superviseur' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Ajouter Équipement</h3>
            <div className="card">
              <form onSubmit={handleCreateEquipment}>
                <div className="form-group">
                  <label className="form-label">Code de l'équipement</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ex: CAM-PTZ-CRI-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Désignation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ex: Caméra dôme thermique 02"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Marque</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hikvision, Axis..."
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      disabled={formLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Modèle</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="DS-2CD..."
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Zone d'implantation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ex: Clôture Ouest pylône 4"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Catégorie</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={formLoading}
                    >
                      <option value="terrain">Équipement Terrain</option>
                      <option value="central">Équipement Central</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type Sûreté</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={formLoading}
                    >
                      <option value="Périmétrique">Périmétrique</option>
                      <option value="Accès">Accès (Portes/Tourniquets)</option>
                      <option value="Intérieur">Intérieur / PCS</option>
                      <option value="Générique">Générique</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                  disabled={formLoading}
                >
                  <Plus size={16} />
                  Enregistrer l'Équipement
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
