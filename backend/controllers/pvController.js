const db = require('../config/db');

exports.getPvs = async (req, res) => {
  const { site_id, role } = req.user;
  try {
    let query = `
      SELECT pv.*, s.name as site_name
      FROM pv_reports pv
      JOIN sites s ON pv.site_id = s.id
    `;
    const params = [];

    if (role !== 'responsable') {
      query += ' WHERE pv.site_id = ?';
      params.push(site_id);
    }

    const [rows] = await db.query(query, params);
    
    // Parse JSON details dynamically
    const formattedRows = rows.map(row => {
      let details = null;
      if (row.details_json) {
        try {
          details = JSON.parse(row.details_json);
        } catch (e) {
          console.error('Error parsing details_json for PV', row.id, e.message);
        }
      }
      return {
        id: row.id,
        code: row.code,
        type: row.type,
        planning_id: row.planning_id,
        ticket_id: row.ticket_id,
        title: row.title,
        description: row.description,
        visa_edet_name: row.visa_edet_name,
        visa_ocp_status: row.visa_ocp_status,
        visa_ocp_date: row.visa_ocp_date,
        site_id: row.site_id,
        site_name: row.site_name,
        pdf_url: row.pdf_url,
        created_at: row.created_at,
        details
      };
    });

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des rapports PV' });
  }
};

exports.signOcpPv = async (req, res) => {
  const { id } = req.params;
  const nowStr = new Date().toISOString();

  try {
    const [rows] = await db.query('SELECT visa_ocp_status FROM pv_reports WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rapport non trouvé.' });
    }

    if (rows[0].visa_ocp_status === 'signe') {
      return res.status(400).json({ message: 'Ce rapport est déjà signé.' });
    }

    await db.query(
      'UPDATE pv_reports SET visa_ocp_status = ?, visa_ocp_date = ? WHERE id = ?',
      ['signe', nowStr, id]
    );

    res.json({ message: 'Visa OCP appliqué avec succès.', visa_ocp_date: nowStr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'approbation du rapport' });
  }
};
