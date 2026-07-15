import React, { useState, useEffect } from 'react';
import { Play, Check, ShieldAlert, X, Plus, Trash } from 'lucide-react';

export default function TechnicianInterventions({ user, token }) {
  const [plannings, setPlannings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active form modal state
  const [activePlan, setActivePlan] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  // Form inputs for PREVENTIVE completion
  const [prevDate, setPrevDate] = useState(new Date().toISOString().split('T')[0]);
  const [prevHeure, setPrevHeure] = useState(new Date().toTimeString().substring(0, 5));
  const [prevOutillage, setPrevOutillage] = useState('');
  const [prevProduits, setPrevProduits] = useState('');
  const [prevDocAT, setPrevDocAT] = useState(false);
  const [prevDocFI, setPrevDocFI] = useState(false);
  const [prevDocPTR, setPrevDocPTR] = useState(false);
  const [prevDocFPR, setPrevDocFPR] = useState(false);
  const [prevResults, setPrevResults] = useState('');
  const [prevDateFin, setPrevDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [prevHeureFin, setPrevHeureFin] = useState(new Date().toTimeString().substring(0, 5));
  
  // Spare parts table rows for preventive
  const [spareParts, setSpareParts] = useState([]);

  // Form inputs for CURATIVE completion
  const [curDate, setCurDate] = useState(new Date().toISOString().split('T')[0]);
  const [curHeure, setCurHeure] = useState(new Date().toTimeString().substring(0, 5));
  const [curType, setCurType] = useState('Maintenance de la vidéosurveillance');
  const [curDocAT, setCurDocAT] = useState(false);
  const [curDocFI, setCurDocFI] = useState(false);
  const [curDocPTR, setCurDocPTR] = useState(false);
  const [curDocFPR, setCurDocFPR] = useState(false);
  
  // Diagnostic curatives
  const [diagArriving, setDiagArriving] = useState('');
  const [diagCause, setDiagCause] = useState('');
  const [diagChronology, setDiagChronology] = useState('');
  const [diagResults, setDiagResults] = useState('');
  const [diagAfter, setDiagAfter] = useState('');
  const [diagObs, setDiagObs] = useState('');
  const [curGti, setCurGti] = useState('');
  const [curGtr, setCurGtr] = useState('');
  const [curDateFin, setCurDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [curHeureFin, setCurHeureFin] = useState(new Date().toTimeString().substring(0, 5));

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch plannings and filter by active technician & planifie status
      const pRes = await fetch('/api/plannings', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const pData = await pRes.json();
      if (!pRes.ok) throw new Error(pData.message || 'Erreur plannings');
      
      const techPlans = pData.filter(p => p.technician_id === user.id && p.status === 'planifie');
      setPlannings(techPlans);

      // 2. Fetch curative tickets and filter by active technician & en_cours status
      const tRes = await fetch('/api/tickets', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const tData = await tRes.json();
      if (tRes.ok) {
        const techTickets = tData.filter(t => t.technician_id === user.id && t.status === 'en_cours');
        setTickets(techTickets);
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

  // Spare parts rows managers
  const handleAddSparePart = () => {
    setSpareParts([...spareParts, { rep: String(spareParts.length + 1), nb: '1', designation: '', fabrication: 'OCP Spec', ref: '', remarque: 'Neuf' }]);
  };
  const handleRemoveSparePart = (index) => {
    setSpareParts(spareParts.filter((_, idx) => idx !== index));
  };
  const handlePartChange = (index, field, value) => {
    setSpareParts(spareParts.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleStartPlanning = (plan) => {
    setActivePlan(plan);
    setSpareParts([]); // reset parts
  };

  const handleStartTicket = (ticket) => {
    setActiveTicket(ticket);
  };

  // Submit Preventive form
  const handleSubmitPreventive = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date_intervention: prevDate,
        heure_intervention: prevHeure,
        nature_intervention: `Maintenance préventive des ${activePlan.equipment_name}`,
        consigne_securite: "Port des EPI / Prise des mesures de sécurité",
        pieces_utilisees: spareParts,
        outillage: prevOutillage,
        produits: prevProduits,
        autorisation_travail: prevDocAT,
        fi: prevDocFI,
        ptr: prevDocPTR,
        fpr: prevDocFPR,
        resultats: prevResults,
        date_fin: prevDateFin,
        heure_fin: prevHeureFin
      };

      const res = await fetch(`/api/plannings/${activePlan.id}/complete`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission');

      alert('Rapport de maintenance préventive enregistré et PV OCP généré avec succès !');
      setActivePlan(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit Curative form
  const handleSubmitCurative = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date_intervention: curDate,
        heure_intervention: curHeure,
        type_intervention: curType,
        documentations: {
          autorisation_travail: curDocAT,
          fi: curDocFI,
          ptr: curDocPTR,
          fpr: curDocFPR
        },
        etat_equipement_arriving: diagArriving,
        cause_panne: diagCause,
        chronology_actions: diagChronology,
        verification_results: diagResults,
        etat_equipement_after: diagAfter,
        observations: diagObs,
        gti: curGti,
        gtr: curGtr,
        date_fin: curDateFin,
        heure_fin: curHeureFin
      };

      const res = await fetch(`/api/tickets/${activeTicket.id}/resolve`, {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission');

      alert('Rapport d\'intervention curative enregistré et PV OCP généré avec succès !');
      setActiveTicket(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des interventions...</div>;
  }

  return (
    <div>
      <div className="page-header no-print">
        <div className="page-title-container">
          <h1 className="page-title">Espace Interventions Terrain - EDET</h1>
          <p className="page-subtitle">Prenez en charge vos plannings de maintenance préventive et curative à réaliser aujourd'hui.</p>
        </div>
      </div>

      {error && (
        <div className="card no-print" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div className="grid-two-cols no-print">
        {/* Preventive Plannings assigned to technician */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Mes Planifications Préventives</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {plannings.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Aucune planification préventive à réaliser.
              </div>
            ) : (
              plannings.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{p.equipment_name}</h4>
                    <span className="equip-meta">
                      Date : {p.target_date.split('T')[0]} | Période : {p.periodicity}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartPlanning(p)}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Play size={12} fill="currentColor" />
                    Démarrer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Curative Tickets assigned to technician */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Mes Dépannages Affectés</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.length === 0 ? (
              <div className="card" style={{
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: 'var(--border)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                backgroundColor: 'transparent',
                boxShadow: 'none'
              }}>
                Aucune panne urgente affectée.
              </div>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--status-danger)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="ticket-code">{t.code}</span>
                    <span className="badge badge-danger">Urgent</span>
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.equipment_name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{t.description}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <span className="equip-meta">Zone: {t.equipment_zone}</span>
                    <button
                      onClick={() => handleStartTicket(t)}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <Check size={12} />
                      Terminer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PREVENTIVE REPORT MODAL */}
      {activePlan && (
        <div className="modal-backdrop no-print">
          <div className="modal-container" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="card-title" style={{ margin: 0 }}>Rapport de Maintenance Préventive</h3>
              <button onClick={() => setActivePlan(null)} className="btn btn-secondary" style={{ padding: '0.2rem' }}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPreventive} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Informations Générales (Auto-remplies)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>N° Ticket : <strong>{activePlan.code || `#plan-${activePlan.id}`}</strong></div>
                  <div>Site : <strong>{activePlan.site_name}</strong></div>
                  <div>Demandeur : <strong>Cellule maintenance</strong></div>
                  <div>Responsable : <strong>{user.full_name}</strong></div>
                  <div>Date demande : <strong>{activePlan.created_at.split('T')[0]}</strong></div>
                  <div>Heure demande : <strong>{activePlan.created_at.split('T')[1].substring(0, 5)}</strong></div>
                </div>
              </div>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date Intervention</label>
                  <input type="date" className="form-input" value={prevDate} onChange={e => setPrevDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure Intervention</label>
                  <input type="time" className="form-input" value={prevHeure} onChange={e => setPrevHeure(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nature de l'intervention</label>
                <input type="text" className="form-input" value={`Maintenance préventive des ${activePlan.equipment_name}`} disabled />
              </div>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Outillage utilisé</label>
                  <input type="text" className="form-input" value={prevOutillage} onChange={e => setPrevOutillage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Produits consommés</label>
                  <input type="text" className="form-input" value={prevProduits} onChange={e => setPrevProduits(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Documentations utilisées</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <label><input type="checkbox" checked={prevDocAT} onChange={e => setPrevDocAT(e.target.checked)} /> Autorisation de travail</label>
                  <label><input type="checkbox" checked={prevDocFI} onChange={e => setPrevDocFI(e.target.checked)} /> FI</label>
                  <label><input type="checkbox" checked={prevDocPTR} onChange={e => setPrevDocPTR(e.target.checked)} /> PTR</label>
                  <label><input type="checkbox" checked={prevDocFPR} onChange={e => setPrevDocFPR(e.target.checked)} /> FPR</label>
                </div>
              </div>

              {/* Spare parts */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Pièces fournies ou échangées</label>
                  <button type="button" onClick={handleAddSparePart} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    <Plus size={12} /> Ajouter une pièce
                  </button>
                </div>

                <table className="form-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.25rem' }}>Rep</th>
                      <th style={{ padding: '0.25rem' }}>Qté</th>
                      <th style={{ padding: '0.25rem' }}>Désignation</th>
                      <th style={{ padding: '0.25rem' }}>Réf ou S/N</th>
                      <th style={{ padding: '0.25rem' }}>Remarque</th>
                      <th style={{ padding: '0.25rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {spareParts.map((p, index) => (
                      <tr key={index}>
                        <td style={{ padding: '0.25rem' }}><input type="text" className="form-input" style={{ padding: '0.1rem' }} value={p.rep} onChange={e => handlePartChange(index, 'rep', e.target.value)} /></td>
                        <td style={{ padding: '0.25rem' }}><input type="number" className="form-input" style={{ padding: '0.1rem' }} value={p.nb} onChange={e => handlePartChange(index, 'nb', e.target.value)} /></td>
                        <td style={{ padding: '0.25rem' }}><input type="text" className="form-input" style={{ padding: '0.1rem' }} value={p.designation} placeholder="Nom pièce" onChange={e => handlePartChange(index, 'designation', e.target.value)} required /></td>
                        <td style={{ padding: '0.25rem' }}><input type="text" className="form-input" style={{ padding: '0.1rem' }} value={p.ref} placeholder="Référence" onChange={e => handlePartChange(index, 'ref', e.target.value)} /></td>
                        <td style={{ padding: '0.25rem' }}><input type="text" className="form-input" style={{ padding: '0.1rem' }} value={p.remarque} onChange={e => handlePartChange(index, 'remarque', e.target.value)} /></td>
                        <td style={{ padding: '0.25rem' }}>
                          <button type="button" onClick={() => handleRemoveSparePart(index)} style={{ border: 'none', background: 'transparent', color: 'var(--status-danger)', cursor: 'pointer' }}>
                            <Trash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {spareParts.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '0.5rem', color: '#666', fontStyle: 'italic' }}>Aucune pièce utilisée.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="form-group">
                <label className="form-label">Résultats du contrôle & nettoyage</label>
                <textarea className="form-textarea" rows="3" value={prevResults} onChange={e => setPrevResults(e.target.value)} required />
              </div>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date Fin Intervention</label>
                  <input type="date" className="form-input" value={prevDateFin} onChange={e => setPrevDateFin(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure Fin Intervention</label>
                  <input type="time" className="form-input" value={prevHeureFin} onChange={e => setPrevHeureFin(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}>
                <Check size={16} /> Enregistrer et Générer PV OCP
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CURATIVE REPORT MODAL */}
      {activeTicket && (
        <div className="modal-backdrop no-print">
          <div className="modal-container" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="card-title" style={{ margin: 0 }}>Rapport d'Intervention Curative</h3>
              <button onClick={() => setActiveTicket(null)} className="btn btn-secondary" style={{ padding: '0.2rem' }}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCurative} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Informations Générales (Auto-remplies)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>N° Ticket : <strong>{activeTicket.code}</strong></div>
                  <div>Site : <strong>{activeTicket.site_name}</strong></div>
                  <div>Demandeur : <strong>OIG/S/B</strong></div>
                  <div>Responsable : <strong>{user.full_name}</strong></div>
                  <div>Date demande : <strong>{activeTicket.created_at.split('T')[0]}</strong></div>
                  <div>Heure demande : <strong>{activeTicket.created_at.split('T')[1].substring(0, 5)}</strong></div>
                </div>
              </div>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date Intervention</label>
                  <input type="date" className="form-input" value={curDate} onChange={e => setCurDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure Intervention</label>
                  <input type="time" className="form-input" value={curHeure} onChange={e => setCurHeure(e.target.value)} required />
                </div>
              </div>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Type Intervention</label>
                  <select className="form-select" value={curType} onChange={e => setCurType(e.target.value)} required>
                    <option value="Maintenance de la vidéosurveillance">Maintenance de la vidéosurveillance</option>
                    <option value="Maintenance de contrôle d'accès">Maintenance de contrôle d'accès</option>
                    <option value="Maintenance curative VMS">Maintenance curative VMS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Équipement concerné</label>
                  <input type="text" className="form-input" value={activeTicket.equipment_name} disabled />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Documentations utilisées</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <label><input type="checkbox" checked={curDocAT} onChange={e => setCurDocAT(e.target.checked)} /> Autorisation de travail</label>
                  <label><input type="checkbox" checked={curDocFI} onChange={e => setCurDocFI(e.target.checked)} /> FI</label>
                  <label><input type="checkbox" checked={curDocPTR} onChange={e => setCurDocPTR(e.target.checked)} /> PTR</label>
                  <label><input type="checkbox" checked={curDocFPR} onChange={e => setCurDocFPR(e.target.checked)} /> FPR</label>
                </div>
              </div>

              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem', margin: 0 }}>DIAGNOSTIC TECHNIQUE</h4>

              <div className="form-group">
                <label className="form-label">État de l'équipement en arrivant</label>
                <textarea className="form-textarea" rows="2" value={diagArriving} onChange={e => setDiagArriving(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">La cause de la panne</label>
                <textarea className="form-textarea" rows="2" value={diagCause} onChange={e => setDiagCause(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">La chronologie des actions de la maintenance</label>
                <textarea className="form-textarea" rows="2" value={diagChronology} onChange={e => setDiagChronology(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Les résultats des vérifications et origine de la panne</label>
                <textarea className="form-textarea" rows="2" value={diagResults} onChange={e => setDiagResults(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">État de l'équipement après l'intervention</label>
                <textarea className="form-textarea" rows="2" value={diagAfter} onChange={e => setDiagAfter(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Les observations relevées</label>
                <textarea className="form-textarea" rows="2" value={diagObs} onChange={e => setDiagObs(e.target.value)} required />
              </div>

              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem', margin: 0 }}>DÉLAIS & CLÔTURE</h4>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">GTI (Temps intervention estimé)</label>
                  <input type="text" className="form-input" value={curGti} onChange={e => setCurGti(e.target.value)} placeholder="ex: 10 MN" required />
                </div>
                <div className="form-group">
                  <label className="form-label">GTR (Temps de rétablissement)</label>
                  <input type="text" className="form-input" value={curGtr} onChange={e => setCurGtr(e.target.value)} placeholder="ex: 3 H" required />
                </div>
              </div>

              <div className="grid-two-cols" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date fin d'intervention</label>
                  <input type="date" className="form-input" value={curDateFin} onChange={e => setCurDateFin(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure fin d'intervention</label>
                  <input type="time" className="form-input" value={curHeureFin} onChange={e => setCurHeureFin(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}>
                <Check size={16} /> Enregistrer et Résoudre le Ticket
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
