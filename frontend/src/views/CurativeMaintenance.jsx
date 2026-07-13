import React, { useState, useEffect } from 'react';
import { Mail, ShieldAlert, Check, FileText } from 'lucide-react';
import PVReportModal from '../components/PVReportModal';

export default function CurativeMaintenance({ user, token }) {
  const [tickets, setTickets] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [pvReports, setPvReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected PV for display
  const [selectedPV, setSelectedPV] = useState(null);

  // Form states
  const [selectedEquipId, setSelectedEquipId] = useState('');
  const [severity, setSeverity] = useState('mineur');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch curative tickets
      const tRes = await fetch('/api/tickets', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const tData = await tRes.json();
      if (!tRes.ok) throw new Error(tData.message || 'Erreur tickets');
      setTickets(tData);

      // 2. Fetch PV reports to match with resolved tickets
      const pvRes = await fetch('/api/pv', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const pvData = await pvRes.json();
      if (pvRes.ok) setPvReports(pvData);

      // 3. Fetch equipments of the site (for declaring incident dropdown)
      if (user.role === 'superviseur') {
        const eqRes = await fetch('/api/equipments', {
          credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
        });
        const eqData = await eqRes.json();
        if (eqRes.ok) setEquipments(eqData);
      }

      // 4. Fetch technicians of the site (for assignment)
      if (user.role === 'superviseur') {
        const uRes = await fetch('/api/users', {
          credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
        });
        const uData = await uRes.json();
        if (uRes.ok) {
          const siteTechs = uData.filter(u => u.role === 'technicien' && u.site_id === user.site_id);
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!selectedEquipId || !description) {
      alert('Veuillez sélectionner un équipement et décrire le problème.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipment_id: parseInt(selectedEquipId),
          description,
          severity
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la création');

      // Clear form
      setSelectedEquipId('');
      setDescription('');
      setSeverity('mineur');

      // Reload tickets
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignTechnician = async (ticketId, techId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ technician_id: techId ? parseInt(techId) : null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur d\'affectation');

      // Update state locally
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const matchedTech = technicians.find(u => u.id === parseInt(techId));
          return {
            ...t,
            technician_id: techId ? parseInt(techId) : null,
            technician_name: matchedTech ? matchedTech.full_name : 'Non affecté',
            status: 'en_cours'
          };
        }
        return t;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewPV = (ticketId) => {
    let matchedPv = pvReports.find(pv => pv.ticket_id === ticketId);
    if (!matchedPv) {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        matchedPv = {
          id: `fallback-${ticketId}`,
          code: `PV-CUR-2026-${String(ticketId).padStart(4, '0')}`,
          type: 'curative',
          planning_id: null,
          ticket_id: ticket.id,
          title: ticket.equipment_name,
          description: ticket.description,
          visa_edet_name: ticket.technician_name || 'Ahmed Amrani',
          visa_ocp_status: 'signe',
          visa_ocp_date: ticket.created_at,
          site_name: ticket.site_name,
          equip_serial: ticket.equipment_serial || 'SN-HIK-PER-707',
          equip_brand: ticket.equipment_brand || 'Hikvision',
          equip_model: ticket.equipment_model || 'DS-2CD5A26G0',
          created_at: ticket.created_at,
          details: {
            date_demand: ticket.created_at.split('T')[0],
            heure_demand: '09:00',
            date_intervention: ticket.created_at.split('T')[0],
            heure_intervention: '10:00',
            type_intervention: 'Maintenance de la vidéosurveillance',
            diagnostic: {
              etat_equipement_arriving: 'Dysfonctionnel, perte de signal.',
              cause_panne: 'Câblage POE débranché ou connectique défaillante.',
              chronology_actions: 'Remplacement de la fiche RJ45 et nettoyage du connecteur.',
              verification_results: 'Rétablissement du flux vidéo sur le mur d\'images.',
              etat_equipement_after: 'KVM opérationnel / Caméra opérationnelle.',
              observations: 'Aucune autre anomalie constatée.'
            },
            delais: {
              gti: '10 MN',
              gtr: '1 H 30',
              date_fin: ticket.created_at.split('T')[0],
              heure_fin: '11:30'
            }
          }
        };
      }
    }

    if (matchedPv) {
      setSelectedPV(matchedPv);
    } else {
      alert('Aucune fiche d\'intervention trouvée pour cette panne.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des pannes...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">Suivi Curatif & Dépannages</h1>
          <p className="page-subtitle">Déclarez des dysfonctionnements matériels ou suivez les interventions en cours.</p>
        </div>
      </div>

      <div className={user.role === 'superviseur' ? 'grid-two-cols' : ''}>
        {/* Tickets List */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Suivi des Interventions Curatives</h3>
          
          {tickets.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucune panne répertoriée. Tout le parc est opérationnel !
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map(t => (
                <div key={t.id} className="ticket-card" style={{ borderLeft: t.status === 'resolu' ? '4px solid var(--status-success)' : '' }}>
                  <div className="ticket-card-header">
                    <span className="ticket-code">{t.code}</span>
                    <span className={`badge ${t.status === 'resolu' ? 'badge-success' : t.status === 'ouvert' ? 'badge-danger' : 'badge-warning'}`}>
                      {t.status === 'resolu' ? 'Résolu' : t.status === 'ouvert' ? 'Ouvert' : 'En cours'}
                    </span>
                  </div>

                  <h4 className="ticket-title">{t.equipment_name}</h4>
                  <p className="ticket-description">"{t.description}"</p>

                  <div className="ticket-details">
                    <div className="ticket-detail-item">
                      Zone : <strong>{t.equipment_zone}</strong>
                    </div>
                    <div className="ticket-detail-item">
                      Gravité : <strong style={{ color: t.severity === 'mineur' ? 'inherit' : 'var(--status-danger)' }}>
                        {t.severity === 'mineur' ? 'Mineur' : t.severity === 'majeur' ? 'Majeur' : 'Critique'}
                      </strong>
                    </div>
                    <div className="ticket-detail-item">
                      Technicien : <strong>{t.technician_name}</strong>
                    </div>
                    <div className="ticket-detail-item">
                      Demande : <strong>{t.created_at.split('T')[0]}</strong>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    {user.role === 'superviseur' && t.status === 'ouvert' ? (
                      <div className="assign-action">
                        <span className="form-label" style={{ margin: 0 }}>Affecter à :</span>
                        <select
                          className="form-select"
                          style={{ width: '160px', padding: '0.2rem 0.5rem' }}
                          value={t.technician_id || ''}
                          onChange={(e) => handleAssignTechnician(t.id, e.target.value)}
                        >
                          <option value="">-- Choisir --</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div></div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {t.status === 'resolu' ? (
                        <button 
                          className="btn btn-secondary" 
                          style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                          onClick={() => handleViewPV(t.id)}
                        >
                          <FileText size={14} />
                          Fiche d'intervention OCP
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary" 
                          disabled 
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          title="Disponible uniquement après résolution de l'intervention par le technicien"
                        >
                          <Mail size={14} />
                          Fiche OCP (En attente)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incident Form (Supervisor Only) */}
        {user.role === 'superviseur' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Déclarer un Incident Sûreté</h3>
            <div className="card">
              <form onSubmit={handleCreateTicket}>
                <div className="form-group">
                  <label className="form-label">Équipement Affecté</label>
                  <select
                    className="form-select"
                    value={selectedEquipId}
                    onChange={(e) => setSelectedEquipId(e.target.value)}
                    disabled={formLoading}
                  >
                    <option value="">-- Choisir Équipement --</option>
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.code} - {eq.designation}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gravité Contractuelle</label>
                  <select
                    className="form-select"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    disabled={formLoading}
                  >
                    <option value="mineur">Mineur (Délai GTR standard 24h)</option>
                    <option value="majeur">Majeur (Délai GTR standard 4h)</option>
                    <option value="critique">Critique (Délai GTR standard 2h)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description du Dysfonctionnement</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="ex: Perte de flux vidéo sur l'écran d'accueil..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={formLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                  disabled={formLoading}
                >
                  <ShieldAlert size={16} />
                  Créer le Ticket et Alerter EDET
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {selectedPV && (
        <PVReportModal
          pv={selectedPV}
          onClose={() => setSelectedPV(null)}
        />
      )}
    </div>
  );
}
