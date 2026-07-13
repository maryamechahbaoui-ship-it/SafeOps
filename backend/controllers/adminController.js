const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Dashboard Metrics
exports.getDashboard = async (req, res) => {
  const { role, site_id } = req.user;
  const filterSiteId = req.query.site_id ? parseInt(req.query.site_id) : null;
  const targetSiteId = role === 'responsable' ? filterSiteId : site_id;

  try {
    // A. Fetch equipments and tickets based on targetSiteId
    let equipQuery = 'SELECT * FROM equipments';
    let ticketQuery = 'SELECT t.*, e.zone as equipment_zone FROM tickets t JOIN equipments e ON t.equipment_id = e.id';
    const params = [];

    if (targetSiteId) {
      equipQuery += ' WHERE site_id = ?';
      ticketQuery += ' WHERE t.site_id = ?';
      params.push(targetSiteId);
    }

    const [equips] = await db.query(equipQuery, params);
    const [tickets] = await db.query(ticketQuery, params);

    // B. Calculate general metrics
    const totalEquips = equips.length;
    const enPanneCount = equips.filter(e => e.status === 'en_panne').length;
    const availability = totalEquips > 0 ? parseFloat(((totalEquips - enPanneCount) / totalEquips * 100).toFixed(1)) : 100;
    const openTickets = tickets.filter(t => t.status === 'ouvert' || t.status === 'en_cours').length;

    // C. Zone breakdown counts
    const zoneCounts = {};
    equips.forEach(e => {
      if (e.zone) zoneCounts[e.zone] = 0;
    });
    tickets.filter(t => t.status !== 'resolu').forEach(t => {
      if (t.equipment_zone) {
        zoneCounts[t.equipment_zone] = (zoneCounts[t.equipment_zone] || 0) + 1;
      }
    });

    const zoneBreakdown = Object.keys(zoneCounts).map(zone => ({
      zone,
      count: zoneCounts[zone]
    }));

    // D. Site breakdown details (Only for Responsable)
    let siteStats = [];
    if (role === 'responsable') {
      const [sites] = await db.query('SELECT * FROM sites');
      const [allEquips] = await db.query('SELECT * FROM equipments');
      const [allTickets] = await db.query('SELECT * FROM tickets');

      siteStats = sites.map(s => {
        const siteEquips = allEquips.filter(e => e.site_id === s.id);
        const siteTickets = allTickets.filter(t => t.site_id === s.id);
        const sitePannes = siteEquips.filter(e => e.status === 'en_panne').length;
        return {
          id: s.id,
          name: s.name,
          parc: siteEquips.length,
          en_panne: sitePannes,
          tickets: siteTickets.filter(t => t.status !== 'resolu').length,
          status: s.status === 'actif' ? 'ACTIF' : 'INACTIF'
        };
      });
    }

    res.json({
      metrics: {
        equipements_total: totalEquips,
        disponibilite: availability,
        tickets_ouverts: openTickets,
        conformite_gti: 100, // Static SLA metrics matching mockup
        regle_cloture: 0
      },
      zoneBreakdown,
      siteStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des données dashboard' });
  }
};

// 2. Sites CRUD
exports.getSites = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sites ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des sites' });
  }
};

exports.createSite = async (req, res) => {
  const { name } = req.body;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    const [existing] = await db.query('SELECT id FROM sites WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ce site existe déjà.' });
    }

    const [result] = await db.query('INSERT INTO sites (name, status) VALUES (?, ?)', [name, 'actif']);
    res.status(201).json({ id: result.insertId, name, status: 'actif' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du site' });
  }
};

exports.toggleSite = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    await db.query('UPDATE sites SET status = ? WHERE id = ?', [status, id]);
    res.json({ id: parseInt(id), status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification du site' });
  }
};

exports.deleteSite = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    await db.query('DELETE FROM sites WHERE id = ?', [id]);
    res.json({ message: 'Site supprimé définitivement ainsi que ses données liées.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression définitive du site' });
  }
};

// 3. Users CRUD
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.site_id, u.status, u.created_at, s.name as site_name 
      FROM users u
      LEFT JOIN sites s ON u.site_id = s.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, full_name, role, site_id } = req.body;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Identifiant déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password, full_name, role, site_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, role, site_id || null, 'actif']
    );

    res.status(201).json({ id: result.insertId, username, full_name, role, site_id, status: 'actif' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur de création du compte' });
  }
};

exports.toggleUser = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ id: parseInt(id), status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur d\'activation du compte' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Compte utilisateur supprimé définitivement.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur de suppression du compte' });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (req.user.role !== 'responsable') return res.status(403).json({ message: 'Accès interdit.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    res.json({ message: 'Mot de passe réinitialisé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

// 4. Equipments
exports.getEquipments = async (req, res) => {
  const { role, site_id } = req.user;
  const filterSiteId = req.query.site_id ? parseInt(req.query.site_id) : null;
  const targetSiteId = role === 'responsable' ? filterSiteId : site_id;

  try {
    let query = `
      SELECT e.*, s.name as site_name 
      FROM equipments e
      JOIN sites s ON e.site_id = s.id
    `;
    const params = [];

    if (targetSiteId) {
      query += ' WHERE e.site_id = ?';
      params.push(targetSiteId);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des équipements' });
  }
};

exports.createEquipment = async (req, res) => {
  const { role, site_id } = req.user;
  if (role === 'technicien') return res.status(403).json({ message: 'Accès interdit.' });

  const { code, designation, category, type, brand, model, zone } = req.body;
  const targetSiteId = role === 'responsable' ? parseInt(req.body.site_id) : site_id;

  if (!code || !designation || !brand || !model || !zone || !targetSiteId) {
    return res.status(400).json({ message: 'Tous les champs requis ne sont pas fournis.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM equipments WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Un équipement existe déjà avec ce code.' });
    }

    const [result] = await db.query(
      `INSERT INTO equipments (code, designation, category, type, brand, model, zone, status, site_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, designation, category || 'terrain', type || 'Périmétrique', brand, model, zone, 'fonctionnel', targetSiteId]
    );

    res.status(201).json({ id: result.insertId, code, designation, brand, model, zone, status: 'fonctionnel', site_id: targetSiteId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de l\'équipement' });
  }
};

exports.updateEquipmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE equipments SET status = ? WHERE id = ?', [status, id]);
    res.json({ id: parseInt(id), status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification du statut' });
  }
};

// 5. Stocks (Inventory)
exports.getStocks = async (req, res) => {
  const { role, site_id } = req.user;
  const filterSiteId = req.query.site_id ? parseInt(req.query.site_id) : null;
  const targetSiteId = role === 'responsable' ? filterSiteId : site_id;

  try {
    let query = `
      SELECT a.*, s.name as site_name 
      FROM articles a
      JOIN sites s ON a.site_id = s.id
    `;
    const params = [];

    if (targetSiteId) {
      query += ' WHERE a.site_id = ?';
      params.push(targetSiteId);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement de l\'inventaire' });
  }
};

exports.createStock = async (req, res) => {
  const { role, site_id } = req.user;
  if (role === 'technicien') return res.status(403).json({ message: 'Accès interdit.' });

  const { name, reference, critical_threshold, quantity } = req.body;
  const targetSiteId = role === 'responsable' ? parseInt(req.body.site_id) : site_id;

  if (!name || !reference || !targetSiteId) {
    return res.status(400).json({ message: 'Nom, référence et site obligatoires.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM articles WHERE reference = ? AND site_id = ?', [reference, targetSiteId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Cet article existe déjà pour ce site.' });
    }

    const [result] = await db.query(
      'INSERT INTO articles (name, reference, critical_threshold, quantity, site_id) VALUES (?, ?, ?, ?, ?)',
      [name, reference, critical_threshold || 2, quantity || 0, targetSiteId]
    );

    res.status(201).json({ id: result.insertId, name, reference, critical_threshold, quantity, site_id: targetSiteId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de l\'article' });
  }
};

exports.recordStockMovement = async (req, res) => {
  const { article_id, type, quantity, description } = req.body;
  const userId = req.user.id;

  if (!article_id || !type || !quantity) {
    return res.status(400).json({ message: 'Tous les champs requis ne sont pas fournis.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get current stock
    const [artRows] = await connection.query('SELECT quantity, name FROM articles WHERE id = ?', [article_id]);
    if (artRows.length === 0) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    const article = artRows[0];
    let newQty = article.quantity;

    if (type === 'entrée') {
      newQty += parseInt(quantity);
    } else {
      newQty = Math.max(0, newQty - parseInt(quantity));
    }

    // 2. Update stock
    await connection.query('UPDATE articles SET quantity = ? WHERE id = ?', [newQty, article_id]);

    // 3. Record movement
    await connection.query(
      'INSERT INTO stock_movements (article_id, type, quantity, description, user_id) VALUES (?, ?, ?, ?, ?)',
      [article_id, type, quantity, description || '', userId]
    );

    await connection.commit();
    res.json({ id: article_id, quantity: newQty, message: 'Mouvement de stock enregistré.' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du mouvement' });
  } finally {
    connection.release();
  }
};

exports.getStockMovements = async (req, res) => {
  const { role, site_id } = req.user;
  const filterSiteId = req.query.site_id ? parseInt(req.query.site_id) : null;
  const targetSiteId = role === 'responsable' ? filterSiteId : site_id;

  try {
    let query = `
      SELECT sm.*, a.name as article_name, a.reference as article_ref, u.full_name as user_name
      FROM stock_movements sm
      JOIN articles a ON sm.article_id = a.id
      JOIN users u ON sm.user_id = u.id
    `;
    const params = [];

    if (targetSiteId) {
      query += ' WHERE a.site_id = ?';
      params.push(targetSiteId);
    }

    query += ' ORDER BY sm.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des mouvements de stock' });
  }
};
