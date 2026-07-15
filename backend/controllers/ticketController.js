const db = require('../config/db');
const pdfService = require('../services/pdfService');

exports.getTickets = async (req, res) => {
  const { site_id, role } = req.user;
  try {
    let query = `
      SELECT t.*, 
             e.designation as equipment_name, 
             e.code as equipment_serial, 
             e.brand as equipment_brand,
             e.model as equipment_model,
             e.zone as equipment_zone,
             u.full_name as technician_name,
             s.name as site_name
      FROM tickets t
      JOIN equipments e ON t.equipment_id = e.id
      LEFT JOIN users u ON t.technician_id = u.id
      JOIN sites s ON t.site_id = s.id
    `;
    const params = [];

    if (role !== 'responsable') {
      query += ' WHERE t.site_id = ?';
      params.push(site_id);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des tickets' });
  }
};

exports.createTicket = async (req, res) => {
  const { equipment_id, description, severity } = req.body;
  const { site_id } = req.user;

  if (!equipment_id || !description || !severity) {
    return res.status(400).json({ message: 'Tous les champs requis ne sont pas fournis.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get next serial code
    const [[countRow]] = await connection.query('SELECT COUNT(*) as count FROM tickets');
    const ticketSeq = String(countRow.count + 1).padStart(4, '0');
    const ticketCode = `TKT-CUR-${ticketSeq}`;

    // 2. Insert ticket
    const [result] = await connection.query(
      `INSERT INTO tickets (code, equipment_id, description, severity, status, technician_id, site_id) 
       VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      [ticketCode, equipment_id, description, severity, 'ouvert', site_id]
    );

    // 3. Mark equipment status as "en_panne"
    await connection.query('UPDATE equipments SET status = ? WHERE id = ?', ['en_panne', equipment_id]);

    await connection.commit();
    res.status(201).json({ id: result.insertId, code: ticketCode, message: 'Ticket créé avec succès.' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création du ticket' });
  } finally {
    connection.release();
  }
};

exports.assignTechnician = async (req, res) => {
  const { id } = req.params;
  const { technician_id } = req.body;

  try {
    // Verify technician role
    const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [technician_id]);
    if (userRows.length === 0 || userRows[0].role !== 'technicien') {
      return res.status(400).json({ message: 'L\'utilisateur sélectionné n\'est pas un technicien valide.' });
    }

    await db.query(
      'UPDATE tickets SET technician_id = ?, status = ? WHERE id = ?',
      [technician_id, 'en_cours', id]
    );

    res.json({ message: 'Technicien affecté et ticket mis en cours.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'affectation du technicien' });
  }
};

exports.resolveTicket = async (req, res) => {
  const { id } = req.params;
  const { 
    date_intervention, heure_intervention, type_intervention,
    documentations,
    etat_equipement_arriving, cause_panne, chronology_actions, verification_results, etat_equipement_after, observations,
    gti, gtr, date_fin, heure_fin 
  } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get ticket details
    const [tRows] = await connection.query(`
      SELECT t.*, e.designation as equipment_name, s.name as site_name 
      FROM tickets t
      JOIN equipments e ON t.equipment_id = e.id
      JOIN sites s ON t.site_id = s.id
      WHERE t.id = ?
    `, [id]);

    if (tRows.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }

    const ticket = tRows[0];
    if (ticket.status === 'resolu') {
      return res.status(400).json({ message: 'Ce ticket est déjà résolu.' });
    }

    // 2. Update ticket status
    await connection.query('UPDATE tickets SET status = ? WHERE id = ?', ['resolu', id]);

    // 3. Mark equipment status as "fonctionnel"
    await connection.query('UPDATE equipments SET status = ? WHERE id = ?', ['fonctionnel', ticket.equipment_id]);

    // 4. Generate unique PV Code
    const year = new Date().getFullYear();
    const [[countRow]] = await connection.query('SELECT COUNT(*) as count FROM pv_reports');
    const pvSeq = String(countRow.count + 1).padStart(4, '0');
    const pvCode = `PV-CUR-${year}-${pvSeq}`;

    // 5. Build details object
    const details = {
      date_demand: ticket.created_at ? new Date(ticket.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      heure_demand: ticket.created_at ? new Date(ticket.created_at).toTimeString().substring(0, 5) : '09:00',
      date_intervention,
      heure_intervention,
      type_intervention,
      documentations: {
        autorisation_travail: !!(documentations && documentations.autorisation_travail),
        fi: !!(documentations && documentations.fi),
        ptr: !!(documentations && documentations.ptr),
        fpr: !!(documentations && documentations.fpr)
      },
      diagnostic: {
        etat_equipement_arriving: etat_equipement_arriving,
        cause_panne: cause_panne,
        chronology_actions: chronology_actions,
        verification_results: verification_results,
        etat_equipement_after: etat_equipement_after,
        observations: observations
      },
      delais: {
        gti,
        gtr,
        date_fin,
        heure_fin
      }
    };

    // 6. Generate PDF and upload to Cloudinary
    const visa_edet_name = req.user.username === 'ahmed_edet' ? 'Ahmed Amrani' : (req.user.username === 'youssef_edet' ? 'Youssef Alaoui' : 'Technicien EDET');
    const pdfUrl = await pdfService.generateAndUploadPV({
      code: pvCode,
      type: 'curative',
      site_name: ticket.site_name,
      equipment_name: ticket.equipment_name,
      description: `Maintenance curative de ${ticket.equipment_name} complétée avec succès.`,
      visa_edet_name,
      visa_ocp_status: 'en_attente',
      details
    });

    // 7. Create PV report row with pdf_url
    await connection.query(
      `INSERT INTO pv_reports (code, type, planning_id, ticket_id, title, description, visa_edet_name, visa_ocp_status, site_id, pdf_url, details_json) 
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pvCode, 
        'curative', 
        id, 
        ticket.equipment_name, 
        `Maintenance curative de ${ticket.equipment_name} complétée avec succès.`,
        visa_edet_name,
        'en_attente',
        ticket.site_id,
        pdfUrl,
        JSON.stringify(details)
      ]
    );

    await connection.commit();
    res.json({ message: 'Ticket résolu et PV OCP généré avec succès !' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la résolution du ticket' });
  } finally {
    connection.release();
  }
};
