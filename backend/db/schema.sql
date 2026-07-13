-- Database creation (run this manually in phpMyAdmin or mysql client if database does not exist)
CREATE DATABASE IF NOT EXISTS ocp_surete_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ocp_surete_db;

-- 1. Sites Table
CREATE TABLE IF NOT EXISTS sites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL, -- 'responsable', 'superviseur', 'technicien'
  site_id INT NULL,
  status VARCHAR(20) DEFAULT 'actif',
  otp_code VARCHAR(6) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Equipments Table
CREATE TABLE IF NOT EXISTS equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  designation VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'central', 'terrain'
  type VARCHAR(50) NOT NULL, -- 'Équipement Central', 'Périmétrique', 'Accès'
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'fonctionnel', -- 'fonctionnel', 'en_panne'
  site_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tickets Table (Maintenance Curative)
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  equipment_id INT NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(30) NOT NULL, -- 'mineur', 'majeur', 'critique'
  status VARCHAR(30) DEFAULT 'ouvert', -- 'ouvert', 'en_cours', 'resolu'
  technician_id INT NULL,
  site_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Plannings Table (Maintenance Préventive)
CREATE TABLE IF NOT EXISTS plannings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  equipment_id INT NOT NULL,
  periodicity VARCHAR(30) NOT NULL, -- 'mensuel', 'bimensuel', 'trimestriel'
  target_date DATE NOT NULL,
  technician_id INT NULL,
  status VARCHAR(30) DEFAULT 'planifie', -- 'planifie', 'realise'
  site_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. PV Reports Table
CREATE TABLE IF NOT EXISTS pv_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(30) NOT NULL, -- 'preventive', 'curative'
  planning_id INT NULL,
  ticket_id INT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  visa_edet_name VARCHAR(100) NOT NULL,
  visa_ocp_status VARCHAR(30) DEFAULT 'en_attente', -- 'en_attente', 'signe'
  visa_ocp_date VARCHAR(100) NULL,
  site_id INT NOT NULL,
  pdf_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details_json TEXT NULL, -- Storing technical diagnostic structures as a JSON string
  FOREIGN KEY (planning_id) REFERENCES plannings(id) ON DELETE SET NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Articles Table (Stock Management)
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  reference VARCHAR(100) NOT NULL,
  critical_threshold INT NOT NULL DEFAULT 2,
  quantity INT NOT NULL DEFAULT 0,
  site_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'entrée', 'sortie'
  quantity INT NOT NULL,
  description TEXT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================
-- DEFAULT SEED DATA
-- ==========================================

-- Seeding Sites
INSERT INTO sites (id, name, status) VALUES 
(1, 'Benguerir', 'actif'),
(2, 'Khouribga', 'actif'),
(3, 'Safi', 'actif'),
(4, 'Jorf Lasfar', 'actif');

-- Seeding Users (Passwords are cryptographically compatible with Bcrypt for 'password123')
INSERT INTO users (id, username, password, full_name, role, site_id, status) VALUES
(1, 'anas_surete_global', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Anas El Filali', 'responsable', NULL, 'actif'),
(2, 'rachid_benguerir', '$2b$10$nuxLYDMPZHYonjY.hzOMS.D6rRBdsklTIFfzaDoQW5NcWp0/rs3Pm', 'Rachid Benslimane', 'superviseur', 1, 'actif'),
(3, 'amine_khouribga', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Amine Chahbaoui', 'superviseur', 2, 'actif'),
(4, 'fatim_safi', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Fatim-Zahra El Alami', 'superviseur', 3, 'actif'),
(5, 'khalid_jorf', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Khalid Kassimi', 'superviseur', 4, 'actif'),
(6, 'ahmed_edet', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Ahmed Amrani', 'technicien', 1, 'actif'),
(7, 'youssef_edet', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Youssef Alaoui', 'technicien', 1, 'actif'),
(8, 'karim_benjelloun', '$2b$10$Mpxw3Ag1CWqNIcQ0kTcdOe9jQyvoD2XH/COVlpBjNVhTVT9w7Ue92', 'Karim Benjelloun', 'technicien', 2, 'actif');

-- Seeding Equipments
INSERT INTO equipments (id, code, designation, category, type, brand, model, zone, status, site_id) VALUES
(1, 'EQ-BEN-MUR-01', 'Mur d''images PCS', 'central', 'Équipement Central', 'Barco', 'OverView LVD5521B', 'Salle PCS Benguerir', 'fonctionnel', 1),
(2, 'EQ-BEN-SCR-02', 'Écrans PCS Opérateur', 'central', 'Équipement Central', 'Dell', 'ultraSharp U2723QE', 'Postes PCS Benguerir', 'fonctionnel', 1),
(3, 'EQ-BEN-SVR-03', 'Poste opérateur Client VMS', 'central', 'Équipement Central', 'HP', 'Z2 G9 Workstation', 'Salle PCS Benguerir', 'fonctionnel', 1),
(4, 'EQ-BEN-LT-BAIE-01', 'Baie Local Technique', 'central', 'Équipement Central', 'APC', 'NetShelter 42U', 'Local Technique RDC', 'fonctionnel', 1),
(5, 'CAM-BEN-PER-N01', 'Caméra Périmétrique Clôture Nord 1', 'terrain', 'Périmétrique', 'Hikvision', 'DS-2CD5A26G0', 'Zone Nord Clôture', 'fonctionnel', 1),
(6, 'CAM-BEN-PER-N02', 'Caméra Périmétrique Clôture Nord 2', 'terrain', 'Périmétrique', 'Hikvision', 'DS-2CD5A26G0', 'Zone Nord Clôture', 'en_panne', 1),
(7, 'CAM-BEN-PER-S02', 'Caméra Périmétrique Clôture Sud 2', 'terrain', 'Périmétrique', 'Hikvision', 'DS-2CD5A26G0', 'Zone Sud Clôture', 'fonctionnel', 1),
(8, 'EQ-BEN-TRN-03', 'Tourniquet Tripode Entrée', 'terrain', 'Accès', 'Automatic Systems', 'TRS 370', 'Portail Entrée Principal', 'fonctionnel', 1),
(9, 'EQ-KHO-CAM-01', 'Caméra Clôture Est Khouribga', 'terrain', 'Périmétrique', 'Hikvision', 'DS-2CD5A26G0', 'Secteur Est', 'en_panne', 2);

-- Seeding Tickets
INSERT INTO tickets (id, code, equipment_id, description, severity, status, technician_id, site_id) VALUES
(1, 'TKT-CUR-0001', 6, 'Perte intermittente de signal vidéo. Coupure brutale la nuit.', 'mineur', 'ouvert', NULL, 1),
(2, 'TKT-CUR-0002', 7, 'Image complètement figée sur le poste opérateur, ne répond plus à l''alimentation POE.', 'majeur', 'en_cours', 6, 1),
(3, 'TKT-CUR-0003', 8, 'Rotor bloqué à mi-course. Risque de sécurité pour la sortie d''urgence.', 'majeur', 'ouvert', NULL, 1),
(4, 'TKT-CUR-0004', 9, 'Caméra Clôture Est Khouribga en panne', 'majeur', 'ouvert', NULL, 2);

-- Seeding Plannings
INSERT INTO plannings (id, code, equipment_id, periodicity, target_date, technician_id, status, site_id) VALUES
(1, '#plan-1', 1, 'bimensuel', '2026-07-16', NULL, 'planifie', 1),
(2, '#plan-2', 2, 'bimensuel', '2026-07-16', NULL, 'planifie', 1),
(3, '#plan-3', 8, 'mensuel', '2026-07-16', NULL, 'planifie', 1);

-- Seeding PV Reports
INSERT INTO pv_reports (id, code, type, planning_id, ticket_id, title, description, visa_edet_name, visa_ocp_status, visa_ocp_date, site_id, details_json) VALUES
(1, 'PV-PREV-2026-0001', 'preventive', 1, NULL, 'Mur d''images PCS', 'Maintenance préventive de Mur d''images PCS', 'Ahmed Amrani', 'signe', '2026-07-06T09:36:48.492Z', 1, '{"date_demand":"2026-07-05","heure_demand":"14:00","outillage":"Standard","produits":"Nettoyants","results":"Contrôle OK","date_fin":"2026-07-05","heure_fin":"15:30"}');

-- Seeding Articles
INSERT INTO articles (id, name, reference, critical_threshold, quantity, site_id) VALUES
(1, 'Caméra Dôme PTZ 2MP', 'AXIS-Q6075-E', 1, 3, 1),
(2, 'Module Injecteur POE+ 30W', 'POE-INJ-30W', 3, 1, 1),
(3, 'Lecteur de Badges RFID', 'HID-SIGNO-40', 2, 6, 1),
(4, 'Ressort de rappel Tourniquet', 'AS-TRN-RS', 2, 2, 1),
(5, 'Câble RJ45 Cat6 blindé (50m)', 'CAT6-STP-50', 4, 10, 1);

-- Seeding Stock Movements
INSERT INTO stock_movements (id, article_id, type, quantity, description, user_id) VALUES
(1, 1, 'entrée', 3, 'Stock initial', 2),
(2, 2, 'entrée', 1, 'Stock initial', 2),
(3, 3, 'entrée', 6, 'Stock initial', 2),
(4, 4, 'entrée', 2, 'Stock initial', 2),
(5, 5, 'entrée', 10, 'Stock initial', 2);
