import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

export default function PreventivePlanning({ user, token }) {
  const [plannings, setPlannings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch plannings
      const planRes = await fetch('/api/plannings', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const planData = await planRes.json();
      if (!planRes.ok) throw new Error(planData.message || 'Erreur plannings');
      setPlannings(planData);

      // 2. Fetch technicians for assignment (only relevant for supervisors/responsables)
      if (user.role !== 'technicien') {
        const userRes = await fetch('/api/users', {
          credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userRes.ok) {
          // Filter technicians of the supervisor's site (or all for global safety manager)
          const siteTechs = user.role === 'responsable' 
            ? userData.filter(u => u.role === 'technicien')
            : userData.filter(u => u.role === 'technicien' && u.site_id === user.site_id);
          setTechnicians(siteTechs);
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

  const handleGenerateCampaign = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/plannings/campaign', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur génération campagne');
      
      // Reload plannings
      const planRes = await fetch('/api/plannings', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const planData = await planRes.json();
      setPlannings(planData);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTechnician = async (planId, techId) => {
    try {
      const res = await fetch(`/api/plannings/${planId}/assign`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ technician_id: techId ? parseInt(techId) : null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur affectation');

      // Update state locally
      setPlannings(prev => prev.map(p => {
        if (p.id === planId) {
          const matchedTech = technicians.find(t => t.id === parseInt(techId));
          return {
            ...p,
            technician_id: techId ? parseInt(techId) : null,
            technician_name: matchedTech ? matchedTech.full_name : 'Non affecté'
          };
        }
        return p;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement du planning préventif...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Planning de Maintenance Préventive</h1>
          <p className="page-subtitle">Générez des campagnes mensuelles et affectez les techniciens EDET terrain.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Équipement</th>
                <th>Zone</th>
                <th>Périodicité</th>
                <th>Date Cible</th>
                <th>Technicien EDET</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {plannings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Aucun planning préventif répertorié. Générez une campagne mensuelle !
                  </td>
                </tr>
              ) : (
                plannings.map(p => (
                  <tr key={p.id}>
                    <td className="equip-meta">{p.code}</td>
                    <td>
                      <div className="equip-name">{p.equipment_name}</div>
                      <div className="equip-sub">Site: {p.site_name}</div>
                    </td>
                    <td>{p.equipment_zone}</td>
                    <td>
                      <span className="badge badge-info" style={{ backgroundColor: '#e2e8f0', color: 'var(--text-main)' }}>
                        {p.periodicity}
                      </span>
                    </td>
                    <td>{p.target_date.split('T')[0]}</td>
                    <td>
                      {user.role === 'superviseur' && p.status === 'planifie' ? (
                        <select
                          className="form-select"
                          style={{ padding: '0.25rem 0.5rem', width: '180px' }}
                          value={p.technician_id || ''}
                          onChange={(e) => handleAssignTechnician(p.id, e.target.value)}
                        >
                          <option value="">-- Choisir Technicien --</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.id}>{t.full_name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          {p.technician_name}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'realise' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status === 'realise' ? 'RÉALISÉ' : 'PLANIFIÉ'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
