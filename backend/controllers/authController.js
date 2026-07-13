const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.*, s.name as site_name 
       FROM users u 
       LEFT JOIN sites s ON u.site_id = s.id 
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiant incorrect.' });
    }

    const user = rows[0];

    if (user.status !== 'actif') {
      return res.status(403).json({ message: 'Ce compte est inactif.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // Sign final JWT token immediately (removing OTP logic)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        site_id: user.site_id,
        site_name: user.site_name || 'Tous'
      },
      process.env.JWT_SECRET || 'supersecretkey_ocp_2026',
      { expiresIn: '24h' }
    );

    // Set JWT token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true if running under HTTPS/production SSL
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 Hours
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        site_id: user.site_id,
        site_name: user.site_name || 'Tous'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { username, otpCode } = req.body;
  if (!username || !otpCode) {
    return res.status(400).json({ message: 'Identifiant et code OTP requis.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.*, s.name as site_name 
       FROM users u 
       LEFT JOIN sites s ON u.site_id = s.id 
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const user = rows[0];

    if (!user.otp_code || user.otp_code !== otpCode.trim()) {
      return res.status(401).json({ message: 'Code OTP invalide ou expiré.' });
    }

    // Clear OTP in DB
    await db.query('UPDATE users SET otp_code = NULL WHERE id = ?', [user.id]);

    // Sign final JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        site_id: user.site_id,
        site_name: user.site_name || 'Tous'
      },
      process.env.JWT_SECRET || 'supersecretkey_ocp_2026',
      { expiresIn: '24h' }
    );

    // Set JWT token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true if running under HTTPS/production SSL
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 Hours
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        site_id: user.site_id,
        site_name: user.site_name || 'Tous'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la validation OTP' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    res.json({ success: true, message: 'Déconnexion réussie.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la déconnexion' });
  }
};
