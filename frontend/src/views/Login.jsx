import React, { useState } from 'react';
import { 
  Shield, BarChart2, Clock, Users, User, Lock, Eye, EyeOff, 
  HelpCircle
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Veuillez saisir votre identifiant et mot de passe');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'authentification');
      }

      onLoginSuccess(data.user, 'cookie_authenticated');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Global Reset & Layout */
        .login-page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #F8FAF9;
          font-family: 'Outfit', 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        @media (min-width: 1024px) {
          .login-page-container {
            flex-direction: row;
          }
        }

        /* Left Marketing Pane */
        .login-left-pane {
          display: none;
          background: #ffffff;
          border-right: 1px solid rgba(226, 232, 240, 0.8);
          padding: 3rem 4rem;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        
        .login-left-pane::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 1024px) {
          .login-left-pane {
            display: flex;
            flex: 1.1;
          }
        }

        /* Right Form Pane */
        .login-right-pane {
          flex: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background-color: #F8FAF9;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 1024px) {
          .login-right-pane {
            padding: 3rem;
          }
        }

        /* Left Pane Header & Branding */
        .brand-logo-container {
          display: flex;
          align-items: center;
          z-index: 10;
        }

        .brand-logo-img {
          height: 85px;
          object-fit: contain;
        }

        .left-content-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 560px;
          width: 100%;
          z-index: 10;
        }

        .hero-title {
          font-size: 2.7rem;
          font-weight: 800;
          color: #0c1829;
          line-height: 1.25;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        
        .hero-title-accent {
          color: #1B5E3C;
        }

        .hero-green-dash {
          width: 32px;
          height: 4px;
          background-color: #1B5E3C;
          border-radius: 99px;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.025rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 2.25rem;
          font-weight: 500;
        }

        /* Features List block matching new mockup exactly */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feature-item-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .feature-icon-box {
          color: #1B5E3C;
          background-color: #F0FDF4; /* Very soft light green background */
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease-in-out;
        }

        .feature-item-card:hover .feature-icon-box {
          transform: scale(1.05);
        }

        .feature-details {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .feature-heading {
          font-size: 1.18rem;
          font-weight: 800;
          color: #0f172a;
        }

        .feature-description {
          font-size: 0.95rem;
          color: #64748b;
          margin-top: 0.125rem;
        }

        /* Background Shapes */
        .dot-grid-pattern {
          position: absolute;
          top: 2rem;
          right: 2rem;
          width: 120px;
          height: 120px;
          background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
          background-size: 10px 10px;
          opacity: 0.6;
          z-index: 0;
          pointer-events: none;
        }

        .bottom-right-wave {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 260px;
          height: 220px;
          background-color: rgba(27, 94, 60, 0.02);
          border-top-left-radius: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .left-pane-wave-overlay {
          position: absolute;
          right: 0;
          bottom: 5%;
          width: 200px;
          height: 320px;
          background-color: rgba(27, 94, 60, 0.015);
          border-radius: 100% 0 0 100%;
          z-index: 1;
          pointer-events: none;
        }

        /* Right Pane Form Card */
        .form-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
          background-color: #ffffff;
          border-radius: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          text-align: center;
          position: relative;
          z-index: 10;
          transition: transform 0.2s;
        }

        .form-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .form-logo {
          height: 64px;
          object-fit: contain;
          margin-bottom: 0.75rem;
        }

        .form-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .form-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        /* Form Controls */
        .error-alert {
          margin-bottom: 1rem;
          padding: 0.65rem;
          background-color: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          color: #dc2626;
          font-weight: 600;
          text-align: center;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          text-align: left;
          margin-bottom: 1.15rem;
        }

        .form-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.375rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon-left {
          position: absolute;
          left: 0.875rem;
          color: #94a3b8;
          transition: color 0.2s;
        }

        .input-icon-right {
          position: absolute;
          right: 0.875rem;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .text-input {
          width: 100%;
          height: 42px;
          padding: 0 1rem 0 2.5rem;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
          transition: all 0.2s ease-in-out;
        }

        .text-input::placeholder {
          color: #94a3b8;
        }

        .text-input:focus {
          outline: none;
          border-color: #1B5E3C;
          box-shadow: 0 0 0 3px rgba(27, 94, 60, 0.08);
        }

        .input-wrapper:focus-within .input-icon-left {
          color: #1B5E3C;
        }

        /* Submit Button */
        .btn-submit {
          width: 100%;
          height: 42px;
          background-color: #1B5E3C;
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #124029;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* SSO Divider under Login button matching mockup */
        .sso-divider-row {
          display: flex;
          align-items: center;
          margin: 1.5rem 0 0 0;
          gap: 0.75rem;
        }

        .sso-divider-line {
          flex: 1;
          height: 1px;
          background-color: #cbd5e1;
        }

        .sso-divider-icon-box {
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Help link footer */
        .help-link-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          margin-top: 1.5rem;
        }

        .help-link-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
        }

        .help-link-item:hover {
          color: #475569;
        }

        /* Diagram Styles */
        .diagram-container-block {
          z-index: 10;
          width: 100%;
          margin-top: 1.5rem;
          display: flex;
          justify-content: center;
        }
      `}</style>

      <div className="login-page-container">
        
        {/* Left Marketing Pane */}
        <div className="login-left-pane">
          <div className="left-pane-wave-overlay"></div>
          
          {/* Logo Header */}
          <div className="brand-logo-container">
            <img src="/logo_ocp_horizontal.png" alt="OCP Logo" className="brand-logo-img" />
          </div>

          {/* Marketing Content */}
          <div className="left-content-wrapper">
            <h1 className="hero-title">
              Engineering Digital <br />
              Industrial <span className="hero-title-accent">Security</span>
            </h1>
            <div className="hero-green-dash"></div>
            
            <p className="hero-subtitle">
              Plateforme centralisée pour la maintenance préventive et corrective des systèmes électroniques et de sûreté industrielle.
            </p>

            {/* List of Features matching mockup */}
            <div className="features-list">
              <div className="feature-item-card">
                <span className="feature-icon-box">
                  <Shield size={20} />
                </span>
                <div className="feature-details">
                  <span className="feature-heading">Sécurisé</span>
                  <span className="feature-description">Données protégées et accès contrôlés.</span>
                </div>
              </div>

              <div className="feature-item-card">
                <span className="feature-icon-box">
                  <BarChart2 size={20} />
                </span>
                <div className="feature-details">
                  <span className="feature-heading">Centralisé</span>
                  <span className="feature-description">Toutes les opérations au même endroit.</span>
                </div>
              </div>

              <div className="feature-item-card">
                <span className="feature-icon-box">
                  <Clock size={20} />
                </span>
                <div className="feature-details">
                  <span className="feature-heading">Efficace</span>
                  <span className="feature-description">Suivi en temps réel et meilleure réactivité.</span>
                </div>
              </div>

              <div className="feature-item-card">
                <span className="feature-icon-box">
                  <Users size={20} />
                </span>
                <div className="feature-details">
                  <span className="feature-heading">Collaboratif</span>
                  <span className="feature-description">Travail d'équipe simplifié et coordonné.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Form Card Panel */}
        <div className="login-right-pane">
          {/* Background decorations */}
          <div className="dot-grid-pattern"></div>
          <div className="bottom-right-wave"></div>

          <div className="form-card">
            
            {/* OCP Logo Header */}
            <div className="form-header">
              <img src="/logo_ocp_horizontal.png" alt="OCP Logo" className="form-logo" />
              <h2 className="form-title">Maintenance Sûreté</h2>
              <p className="form-subtitle">Bienvenue sur la plateforme de maintenance</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Username Field */}
              <div className="form-group">
                <label className="form-label">Identifiant de connexion</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon-left" />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Ex: rachid_benguérir"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Mot de passe</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon-left" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="text-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              </button>
            </form>

            {/* SSO Divider with centered Shield icon matching mockup */}
            <div className="sso-divider-row">
              <div className="sso-divider-line"></div>
              <div className="sso-divider-icon-box">
                <Shield size={16} />
              </div>
              <div className="sso-divider-line"></div>
            </div>

            {/* Bottom Help link */}
            <div className="help-link-container">
              <a 
                href="#help" 
                className="help-link-item"
                onClick={(e) => { e.preventDefault(); alert("Veuillez contacter votre administrateur Sûreté OCP pour réinitialiser vos accès."); }}
              >
                <HelpCircle size={14} />
                <span>Besoin d'aide ? Contactez l'administrateur.</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
