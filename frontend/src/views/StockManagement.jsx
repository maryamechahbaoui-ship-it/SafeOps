import React, { useState, useEffect } from 'react';
import { Package, Plus, ArrowRight } from 'lucide-react';

export default function StockManagement({ user, token }) {
  const [articles, setArticles] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Entrée/Sortie
  const [selectedArtId, setSelectedArtId] = useState('');
  const [movementType, setMovementType] = useState('entrée');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form Nouvel Article
  const [newArtName, setNewArtName] = useState('');
  const [newArtRef, setNewArtRef] = useState('');
  const [newArtThreshold, setNewArtThreshold] = useState('2');
  const [newArtQty, setNewArtQty] = useState('0');
  const [newArtLoading, setNewArtLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch articles
      const artRes = await fetch('/api/stocks', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const artData = await artRes.json();
      if (!artRes.ok) throw new Error(artData.message || 'Erreur articles');
      setArticles(artData);

      // 2. Fetch movements
      const movRes = await fetch('/api/stocks/movements', {
        credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
      });
      const movData = await movRes.json();
      if (movRes.ok) setMovements(movData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    if (!selectedArtId || !quantity) {
      alert('Veuillez sélectionner un article et saisir une quantité.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/stocks/movement', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          article_id: parseInt(selectedArtId),
          type: movementType,
          quantity: parseInt(quantity),
          description
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du mouvement');

      // Clear form
      setSelectedArtId('');
      setQuantity('1');
      setDescription('');

      // Reload
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!newArtName || !newArtRef) {
      alert('Nom et référence requis.');
      return;
    }

    setNewArtLoading(true);
    try {
      const res = await fetch('/api/stocks', {
        method: 'POST',
        credentials: 'include', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newArtName,
          reference: newArtRef,
          critical_threshold: parseInt(newArtThreshold),
          quantity: parseInt(newArtQty)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création article');

      // Clear form
      setNewArtName('');
      setNewArtRef('');
      setNewArtQty('0');
      setNewArtThreshold('2');

      // Reload
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setNewArtLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des stocks...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-container">
          <h1 className="page-title">
            {user.role === 'responsable' ? 'Gestion des Stocks - OCP Tous' : `Gestion des Stocks - OCP ${user.site_name}`}
          </h1>
          <p className="page-subtitle">Gérez le matériel en stock, suivez les entrées/sorties et recevez des alertes de stock faible.</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--status-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          Erreur: {error}
        </div>
      )}

      <div className={user.role === 'superviseur' ? 'grid-two-cols' : ''}>
        {/* Left Section: Stock list */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Inventaire du Site</h3>
          <div className="stock-grid">
            {articles.map(art => (
              <div key={art.id} className={`stock-card ${art.is_low ? 'low-stock' : ''}`}>
                <div className="stock-info">
                  <span className="stock-name">{art.name}</span>
                  <span className="stock-ref">Réf : {art.reference}</span>
                  {user.role === 'responsable' && (
                    <span className="stock-ref" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      Site: {art.site_name}
                    </span>
                  )}
                  <span className="stock-threshold">Seuil critique : {art.critical_threshold} unités</span>
                </div>
                <div className="stock-value-container">
                  <span className={`stock-qty ${art.is_low ? 'low' : ''}`}>{art.quantity}</span>
                  {art.is_low && <span className="stock-alert">Alerte Faible</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Recent movements table log */}
          <h3 className="card-title" style={{ marginBottom: '0.75rem', marginTop: '2rem' }}>Mouvements Récents</h3>
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Mouvement</th>
                    <th>Quantité</th>
                    <th>Justificatif</th>
                    <th>Par</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        Aucun mouvement enregistré.
                      </td>
                    </tr>
                  ) : (
                    movements.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{m.article_name}</div>
                          <div className="equip-sub">Réf : {m.article_ref}</div>
                        </td>
                        <td>
                          <span className={`badge ${m.type === 'entrée' ? 'badge-success' : 'badge-danger'}`}>
                            {m.type === 'entrée' ? 'ENTRÉE' : 'SORTIE'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{m.quantity}</td>
                        <td>{m.description}</td>
                        <td>{m.user_name}</td>
                        <td className="equip-meta">{m.created_at.split('T')[0]}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section: Actions for Supervisor */}
        {user.role === 'superviseur' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Entry / Exit form */}
            <div>
              <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Entrée / Sortie Stock</h3>
              <div className="card">
                <form onSubmit={handleMovementSubmit}>
                  <div className="form-group">
                    <label className="form-label">Pièce Concernée</label>
                    <select
                      className="form-select"
                      value={selectedArtId}
                      onChange={(e) => setSelectedArtId(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="">-- Choisir Article --</option>
                      {articles.map(art => (
                        <option key={art.id} value={art.id}>{art.name} ({art.reference})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Mouvement</label>
                      <select
                        className="form-select"
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value)}
                        disabled={actionLoading}
                      >
                        <option value="entrée">Entrée Stock</option>
                        <option value="sortie">Sortie Stock</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={actionLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Observation / Justificatif</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: Remplacement ou inventaire annuel"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                    disabled={actionLoading}
                  >
                    <ArrowRight size={16} />
                    Valider le Mouvement
                  </button>
                </form>
              </div>
            </div>

            {/* New Article form */}
            <div>
              <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Nouvel Article</h3>
              <div className="card">
                <form onSubmit={handleCreateArticle}>
                  <div className="form-group">
                    <label className="form-label">Nom de l'article</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: Câble RJ45 Cat6..."
                      value={newArtName}
                      onChange={(e) => setNewArtName(e.target.value)}
                      disabled={newArtLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Référence constructeur</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: CAT6-STP-50"
                      value={newArtRef}
                      onChange={(e) => setNewArtRef(e.target.value)}
                      disabled={newArtLoading}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Quantité Initiale</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={newArtQty}
                        onChange={(e) => setNewArtQty(e.target.value)}
                        disabled={newArtLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Seuil Critique</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={newArtThreshold}
                        onChange={(e) => setNewArtThreshold(e.target.value)}
                        disabled={newArtLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ width: '100%', height: '40px', marginTop: '0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    disabled={newArtLoading}
                  >
                    <Plus size={16} />
                    Enregistrer l'Article
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
