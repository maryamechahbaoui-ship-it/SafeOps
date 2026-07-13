import React, { useState, useEffect } from 'react';
import { Award, FileText, CheckSquare } from 'lucide-react';
import PVReportModal from '../components/PVReportModal';

export default function PVHistory({ user, token }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal visualization state
  const [selectedPV, setSelectedPV] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pv', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur PV');
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleSignVisa = async (pvId) => {
    try {
      const res = await fetch(`/api/pv/${pvId}/sign`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la signature');

      // Update state locally
      setReports(prev => prev.map(pv => {
        if (pv.id === pvId) {
          return {
            ...pv,
            visa_ocp_status: 'signe',
            visa_ocp_date: new Date().toISOString()
          };
        }
        return pv;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des rapports...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Historique des Procès-Verbaux de Maintenance</h1>
          <p className="page-subtitle">Consultez l'ensemble des rapports préventifs et curatifs complétés et signés.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <div className="pv-list">
          {reports.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucun rapport de maintenance répertorié.
            </div>
          ) : (
            [...reports]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map(pv => (
              <div key={pv.id} className="pv-card">
                <div className="pv-card-header">
                  <span className="pv-code">{pv.code}</span>
                  <span className={`badge ${pv.visa_ocp_status === 'signe' ? 'badge-success' : 'badge-warning'}`}>
                    {pv.visa_ocp_status === 'signe' ? 'Visé par OCP' : 'Awaiting OCP Visa'}
                  </span>
                </div>

                <h4 className="pv-title">{pv.title}</h4>
                <div className="pv-meta">
                  Site : <strong>{pv.site_name}</strong> | Type : <strong style={{ textTransform: 'capitalize' }}>{pv.type === 'preventive' ? 'Préventif' : 'Curatif'}</strong> | Technicien : <strong>{pv.technician_name || pv.visa_edet_name}</strong>
                </div>

                <p className="pv-desc">"{pv.description}"</p>

                <div className="pv-visas-row">
                  <div className="pv-visa-item">
                    Visa EDET : <strong style={{ color: 'var(--status-success)' }}>{pv.visa_edet_name}</strong>
                  </div>
                  <div className="pv-visa-item">
                    Visa OCP : {pv.visa_ocp_status === 'signe' ? (
                      <strong style={{ color: 'var(--status-success)' }}>Signé ({pv.visa_ocp_date.split('T')[0]})</strong>
                    ) : (
                      <span className="orange">En attente</span>
                    )}
                  </div>
                </div>

                <div className="pv-actions">
                  {user.role === 'superviseur' && pv.visa_ocp_status === 'en_attente' && (
                    <button
                      onClick={() => handleSignVisa(pv.id)}
                      className="btn btn-primary"
                    >
                      <CheckSquare size={14} />
                      Signer le Visa OCP
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedPV(pv)}
                    className="btn btn-secondary"
                  >
                    <FileText size={14} />
                    Visualiser / Imprimer PV OCP
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Printable Report Modal */}
      {selectedPV && (
        <PVReportModal
          pv={selectedPV}
          onClose={() => setSelectedPV(null)}
          onSign={selectedPV.visa_ocp_status === 'en_attente' && user.role === 'superviseur' ? () => handleSignVisa(selectedPV.id) : null}
        />
      )}
    </div>
  );
}
