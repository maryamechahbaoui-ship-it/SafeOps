const db = require('../config/db');
const pdfService = require('../services/pdfService');

exports.getPlannings = async (req, res) => {
  const { site_id, role } = req.user;
  try {
    let query = `
      SELECT p.*, 
             e.designation as equipment_name, 
             e.code as equipment_serial, 
             e.zone as equipment_zone,
             e.brand as equipment_brand,
             e.model as equipment_model,
             u.full_name as technician_name,
             s.name as site_name
      FROM plannings p
      JOIN equipments e ON p.equipment_id = e.id
      LEFT JOIN users u ON p.technician_id = u.id
      JOIN sites s ON p.site_id = s.id
    `;
    const params = [];

    if (role !== 'responsable') {
      query += ' WHERE p.site_id = ?';
      params.push(site_id);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des plannings' });
  }
};

exports.assignTechnician = async (req, res) => {
  const { id } = req.params;
  const { technician_id } = req.body;

  try {
    // Verify technician role
    const [userRows] = await db.query('SELECT role, full_name FROM users WHERE id = ?', [technician_id]);
    if (userRows.length === 0 || userRows[0].role !== 'technicien') {
      return res.status(400).json({ message: 'L\'utilisateur sélectionné n\'est pas un technicien valide.' });
    }

    await db.query('UPDATE plannings SET technician_id = ? WHERE id = ?', [technician_id, id]);

    res.json({ message: 'Technicien assigné avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'affectation du technicien' });
  }
};

exports.completePlanning = async (req, res) => {
  const { id } = req.params;
  const { 
    date_intervention, heure_intervention, outillage, produits, 
    docsAT, docsFI, docsPTR, docsFPR, results, date_fin, heure_fin,
    spareParts 
  } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get planning details
    const [pRows] = await connection.query(`
      SELECT p.*, e.designation as equipment_name, s.name as site_name 
      FROM plannings p
      JOIN equipments e ON p.equipment_id = e.id
      JOIN sites s ON p.site_id = s.id
      WHERE p.id = ?
    `, [id]);

    if (pRows.length === 0) {
      return res.status(404).json({ message: 'Planning non trouvé.' });
    }

    const planning = pRows[0];
    if (planning.status === 'realise') {
      return res.status(400).json({ message: 'Cette intervention est déjà clôturée.' });
    }

    // 2. Update planning status
    await connection.query('UPDATE plannings SET status = ? WHERE id = ?', ['realise', id]);

    // 3. Process spare parts if any (deduct from inventory)
    if (spareParts && spareParts.length > 0) {
      for (const part of spareParts) {
        if (part.article_id && part.used_qty > 0) {
          // Check stock
          const [artRows] = await connection.query('SELECT quantity, name FROM articles WHERE id = ?', [part.article_id]);
          if (artRows.length > 0) {
            const article = artRows[0];
            const newQty = Math.max(0, article.quantity - parseInt(part.used_qty));
            
            // Update stock
            await connection.query('UPDATE articles SET quantity = ? WHERE id = ?', [newQty, part.article_id]);
            
            // Record movement
            await connection.query(
              'INSERT INTO stock_movements (article_id, type, quantity, description, user_id) VALUES (?, ?, ?, ?, ?)',
              [part.article_id, 'sortie', part.used_qty, `Consommé lors du préventif ${planning.code}`, req.user.id]
            );
          }
        }
      }
    }

    // 4. Generate unique PV Code
    const year = new Date().getFullYear();
    const [[countRow]] = await connection.query('SELECT COUNT(*) as count FROM pv_reports');
    const pvSeq = String(countRow.count + 1).padStart(4, '0');
    const pvCode = `PV-PREV-${year}-${pvSeq}`;

    // 5. Build details object
    const details = {
      date_demand: planning.created_at ? new Date(planning.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      heure_demand: '08:00',
      date_intervention,
      heure_intervention,
      outillage,
      produits,
      documentations: {
        autorisation_travail: !!docsAT,
        fi: !!docsFI,
        ptr: !!docsPTR,
        fpr: !!docsFPR
      },
      results,
      delais: {
        date_fin,
        heure_fin
      },
      spare_parts_used: spareParts || []
    };

    // 6. Generate PDF and upload to Cloudinary
    const visa_edet_name = req.user.username === 'ahmed_edet' ? 'Ahmed Amrani' : (req.user.username === 'youssef_edet' ? 'Youssef Alaoui' : 'Technicien EDET');
    const pdfUrl = await pdfService.generateAndUploadPV({
      code: pvCode,
      type: 'preventive',
      site_name: planning.site_name,
      equipment_name: planning.equipment_name,
      description: `Maintenance préventive de ${planning.equipment_name} complétée avec succès.`,
      visa_edet_name,
      visa_ocp_status: 'en_attente',
      details
    });

    // 7. Create PV report row with pdf_url
    await connection.query(
      `INSERT INTO pv_reports (code, type, planning_id, ticket_id, title, description, visa_edet_name, visa_ocp_status, site_id, pdf_url, details_json) 
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pvCode, 
        'preventive', 
        id, 
        planning.equipment_name, 
        `Maintenance préventive de ${planning.equipment_name} complétée avec succès.`,
        visa_edet_name,
        'en_attente',
        planning.site_id,
        pdfUrl,
        JSON.stringify(details)
      ]
    );

    await connection.commit();
    res.json({ message: 'Intervention préventive clôturée et PV OCP généré avec succès !' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la validation du préventif' });
  } finally {
    connection.release();
  }
};
