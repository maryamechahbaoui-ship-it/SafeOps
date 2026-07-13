import React from 'react';
import { X, Printer } from 'lucide-react';

export default function PVReportModal({ pv, onClose, onSign }) {
  const handlePrint = () => {
    window.print();
  };

  const isCurative = pv.type === 'curative';
  const details = pv.details || {};

  return (
    <div className="modal-backdrop no-print">
      <div className="modal-container" style={{ maxWidth: '850px', padding: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Modal Controls */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Aperçu du Rapport Officiel</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {pv.pdf_url && (
              <a href={pv.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Télécharger le PDF Cloudinary
              </a>
            )}
            {onSign && (
              <button onClick={() => { onSign(); onClose(); }} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Signer le Visa OCP
              </button>
            )}
            <button onClick={handlePrint} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <Printer size={14} /> Imprimer en PDF
            </button>
            <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.4rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="print-sheet">
          
          {/* Header Row */}
          <div className="ps-header">
            <div className="ps-logo-ocp">
              <img src="/logo_ocp.png" alt="OCP Logo" style={{ height: '55px', width: '55px', objectFit: 'contain' }} />
            </div>
            <div className="ps-title-box">
              <h3>{isCurative ? "FICHE D'INTERVENTION CURATIVE" : "PROCES VERBAL DE MAINTENANCE PREVENTIVE"}</h3>
              <p>N° du Ticket : <strong>{pv.code}</strong></p>
            </div>
            <div className="ps-logo-edet">
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', backgroundColor: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>EDET</span>
              <p style={{ fontSize: '0.5rem', margin: 0, color: '#333', fontWeight: 'bold' }}>ALARM & SECURITY SYSTEM</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="ps-grid">
            <div className="ps-cell">Site : <strong>{pv.site_name}</strong></div>
            <div className="ps-cell">Demandeur : <strong>{isCurative ? 'OIG/S/B' : 'Cellule maintenance'}</strong></div>
            <div className="ps-cell">Date demande : <strong>{details.date_demand || pv.created_at.split('T')[0]}</strong></div>
            <div className="ps-cell">Heure demande : <strong>{details.heure_demand || '09:00'}</strong></div>
            
            {isCurative ? (
              <>
                <div className="ps-cell" style={{ gridColumn: 'span 2' }}>Responsable de l'intervention : <strong>{pv.visa_edet_name}</strong></div>
                <div className="ps-cell">Date d'intervention : <strong>{details.date_intervention || pv.created_at.split('T')[0]}</strong></div>
                <div className="ps-cell">Heure d'intervention : <strong>{details.heure_intervention || '10:00'}</strong></div>
              </>
            ) : null}
          </div>

          {/* Curative Details */}
          {isCurative ? (
            <>
              {/* Type Intervention Checkboxes */}
              <div className="ps-section">
                <div className="ps-section-title">TYPE D'INTERVENTION</div>
                <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem', fontSize: '0.8rem' }}>
                  <label><input type="checkbox" readOnly checked={details.type_intervention === 'Maintenance de la vidéosurveillance'} /> Maintenance de la vidéosurveillance</label>
                  <label><input type="checkbox" readOnly checked={details.type_intervention === 'Maintenance de contrôle d\'accès'} /> Maintenance de contrôle d'accès</label>
                  <label><input type="checkbox" readOnly checked={details.type_intervention === 'Maintenance curative VMS'} /> Maintenance curative VMS</label>
                </div>
              </div>

              {/* Matériel concerné */}
              <div className="ps-section">
                <div className="ps-section-title">LE MATÉRIEL CONCERNÉ PAR L'INTERVENTION</div>
                <div className="ps-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', border: 'none' }}>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>Dénomination : <strong>{pv.title}</strong></div>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>N° de série : <strong>{pv.equip_serial || 'N/A'}</strong></div>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>Modèle marque : <strong>{pv.equip_brand} {pv.equip_model}</strong></div>
                </div>
              </div>

              {/* Dysfonctionnement */}
              <div className="ps-section">
                <div className="ps-section-title">LA NATURE DU DYSFONCTIONNEMENT</div>
                <div style={{ padding: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>"{pv.description}"</div>
              </div>

              {/* Consignes de securite & docs */}
              <div className="ps-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '0.5rem' }}>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>CONSIGNES DE SÉCURITÉ</strong>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Port des EPI et coupure de l'alimentation électrique avant intervention.</p>
                </div>
                <div style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>DOCUMENTATIONS UTILISÉES</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    <label><input type="checkbox" readOnly checked={!!details.documentations?.autorisation_travail} /> Autorisation de travail</label>
                    <label><input type="checkbox" readOnly checked={!!details.documentations?.fi} /> FI</label>
                    <label><input type="checkbox" readOnly checked={!!details.documentations?.ptr} /> PTR</label>
                    <label><input type="checkbox" readOnly checked={!!details.documentations?.fpr} /> FPR</label>
                  </div>
                </div>
              </div>

              {/* Diagnostic report */}
              <div className="ps-section">
                <div className="ps-section-title">DIAGNOSTIC TECHNIQUE</div>
                <table className="ps-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '35%', fontWeight: 'bold' }}>État de l'équipement en arrivant</td>
                      <td>{details.diagnostic?.etat_equipement_arriving}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>La cause de la panne</td>
                      <td>{details.diagnostic?.cause_panne}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>La chronologie des actions de la maintenance</td>
                      <td>{details.diagnostic?.chronology_actions}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Les résultats des vérifications & origine</td>
                      <td>{details.diagnostic?.verification_results}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>État de l'équipement après l'intervention</td>
                      <td>{details.diagnostic?.etat_equipement_after}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Les observations relevées</td>
                      <td>{details.diagnostic?.observations}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Delais d'interventions */}
              <div className="ps-section">
                <div className="ps-section-title">LES DÉLAIS D'INTERVENTION</div>
                <div className="ps-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', border: 'none' }}>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>GTI : <strong>{details.delais?.gti || '10 MN'}</strong></div>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>GTR : <strong>{details.delais?.gtr || '3 H'}</strong></div>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>Date de fin : <strong>{details.delais?.date_fin}</strong></div>
                  <div style={{ padding: '0.25rem', fontSize: '0.8rem' }}>Heure de fin : <strong>{details.delais?.heure_fin}</strong></div>
                </div>
              </div>
            </>
          ) : (
            // Preventive Details
            <>
              <div className="ps-section">
                <div className="ps-section-title">NATURE DE L'INTERVENTION</div>
                <div style={{ padding: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {details.nature_intervention || `Maintenance préventive des ${pv.title}`}
                </div>
              </div>

              <div className="ps-section">
                <div className="ps-section-title">CONSIGNES DE SÉCURITÉ</div>
                <p style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                  {details.consigne_securite || "Port des EPI / Prise des mesures de sécurité règlementaires."}
                </p>
              </div>

              {/* Pieces table */}
              <div className="ps-section">
                <div className="ps-section-title">PIÈCES FOURNIES OU ÉCHANGÉES</div>
                <table className="ps-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Rep</th>
                      <th style={{ width: '10%' }}>Nb</th>
                      <th>Désignation</th>
                      <th>Fabricant</th>
                      <th>Réf ou S/N</th>
                      <th>Remarque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.pieces_utilisees && details.pieces_utilisees.length > 0 ? (
                      details.pieces_utilisees.map((p, idx) => (
                        <tr key={idx}>
                          <td>{p.rep}</td>
                          <td>{p.nb}</td>
                          <td>{p.designation}</td>
                          <td>{p.fabrication}</td>
                          <td>{p.ref}</td>
                          <td>{p.remarque}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic', color: '#666', fontSize: '0.8rem' }}>Aucune pièce échangée.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tools, Products and Docs */}
              <div className="ps-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr', marginTop: '0.5rem' }}>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Outillage utilisé</strong>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{details.outillage_produits_docs?.outillage || 'Outillage permanent standard'}</p>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Produits consommés</strong>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{details.outillage_produits_docs?.produits || 'Chiffons, sprays nettoyants'}</p>
                </div>
                <div style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Documentations à cocher</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    <label><input type="checkbox" readOnly checked={!!details.outillage_produits_docs?.autorisation_travail} /> Autorisation de travail</label>
                    <label><input type="checkbox" readOnly checked={!!details.outillage_produits_docs?.fi} /> FI</label>
                    <label><input type="checkbox" readOnly checked={!!details.outillage_produits_docs?.ptr} /> PTR</label>
                    <label><input type="checkbox" readOnly checked={!!details.outillage_produits_docs?.fpr} /> FPR</label>
                  </div>
                </div>
              </div>

              {/* Resultats */}
              <div className="ps-section">
                <div className="ps-section-title">RESULTAT DE L'INTERVENTION</div>
                <div style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Contrôle et nettoyage des équipements suivants :</strong>
                  <p style={{ fontSize: '0.8rem', whiteSpace: 'pre-line', marginTop: '0.25rem' }}>{details.resultats}</p>
                </div>
              </div>

              {/* End times */}
              <div className="ps-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '0.5rem' }}>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem', fontSize: '0.8rem' }}>
                  Date fin d'intervention : <strong>{details.date_fin}</strong>
                </div>
                <div style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                  Heure de fin d'intervention : <strong>{details.heure_fin}</strong>
                </div>
              </div>
            </>
          )}

          {/* Signatures Visa Row */}
          <div className="ps-visas-table">
            <div className="ps-visa-box">
              <div className="ps-visa-title">VISA OCP</div>
              <div className="ps-visa-sign">
                {pv.visa_ocp_status === 'signe' ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold', color: 'green', margin: 0, fontSize: '0.85rem' }}>VISÉ / SIGNÉ OCP</p>
                    <p style={{ fontSize: '0.7rem', margin: 0 }}>Date: {pv.visa_ocp_date ? pv.visa_ocp_date.split('T')[0] : ''}</p>
                  </div>
                ) : (
                  <p style={{ color: 'red', fontStyle: 'italic', margin: 0, fontSize: '0.8rem' }}>En attente de visa OCP</p>
                )}
              </div>
            </div>
            
            <div className="ps-visa-box">
              <div className="ps-visa-title">VISA EDET</div>
              <div className="ps-visa-sign">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', color: 'blue', margin: 0, fontSize: '0.85rem' }}>SIGNÉ EDET</p>
                  <p style={{ fontSize: '0.7rem', margin: 0 }}>Intervenant: {pv.visa_edet_name}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
