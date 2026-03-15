import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        :root {
          --font-poppins: 'Poppins', sans-serif;
          --primary-dark: #0f172a;
          --primary-light: #ffffff;
          --accent-blue: #3b82f6;
          --accent-purple: #8b5cf6;
        }

        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: var(--font-poppins);
          background-color: var(--primary-light);
        }

        @media (max-width: 900px) {
          .login-page {
            grid-template-columns: 1fr;
          }
          .left-panel {
            display: none !important;
          }
        }

        /* ----- LEFT PANEL (DARK & PREMIUM) ----- */
        .left-panel {
          background: var(--primary-dark);
          padding: 4rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          color: white;
        }

        /* Premium glowing animated orbs */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.6;
          animation: orb-float 15s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(59, 130, 246, 0.4); /* Blue */
          top: -100px;
          left: -100px;
        }
        .orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(139, 92, 246, 0.4); /* Purple */
          bottom: -50px;
          right: -50px;
          animation-delay: -5s;
        }

        @keyframes orb-float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.1); }
          100% { transform: translate(-20px, 60px) scale(0.9); }
        }

        /* Glass overlay to make text readable */
        .left-glass {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(40px);
          z-index: 1;
        }

        .brand, .hero-content, .left-footer {
          position: relative;
          z-index: 2;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .brand-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: linear-gradient(to right, #fff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #94A3B8;
          margin-bottom: 1.5rem;
          display: inline-block;
          padding: 6px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
        }

        .hero-heading {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
        }

        .hero-heading span {
          background: linear-gradient(to right, var(--accent-blue), var(--accent-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }

        .hero-desc {
          font-size: 1.1rem;
          color: #cbd5e1;
          line-height: 1.7;
          max-width: 85%;
          font-weight: 400;
        }

        .left-footer {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        /* ----- RIGHT PANEL (LIGHT & CLEAN) ----- */
        .right-panel {
          background: var(--primary-light);
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .right-inner {
          width: 100%;
          max-width: 400px;
        }

        .form-eyebrow {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent-blue);
          margin-bottom: 0.5rem;
        }

        .form-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 3rem;
          letter-spacing: -0.03em;
        }

        .form-group {
          margin-bottom: 1.8rem;
          position: relative;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          width: 20px;
          height: 20px;
          transition: color 0.3s ease;
        }

        .form-group input {
          width: 100%;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem 1rem 1rem 3rem;
          font-size: 15px;
          font-family: var(--font-poppins);
          color: #0f172a;
          outline: none;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .form-group input:focus {
          border-color: var(--accent-blue);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-group input:focus + .input-icon {
          color: var(--accent-blue);
        }

        .form-group input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .form-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1.5rem 0 2.5rem;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .remember input[type="checkbox"] {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          background: #fff;
        }

        .remember input[type="checkbox"]:checked {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
        }

        .remember input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .remember span {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }

        .forgot-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--accent-blue);
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(to right, var(--accent-blue), #2563eb);
          color: white;
          border: none;
          padding: 1.1rem 1.5rem;
          font-family: var(--font-poppins);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.5);
        }

        .submit-btn:active {
          transform: translateY(1px);
        }

        .btn-icon {
          transition: transform 0.3s ease;
        }

        .submit-btn:hover .btn-icon {
          transform: translateX(5px);
        }
      `}</style>

      <div className="login-page">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="glow-orb orb-1" />
          <div className="glow-orb orb-2" />
          <div className="left-glass" />

          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-name">Media Portal</span>
          </div>

          <div className="hero-content">
            <p className="hero-label">Admin Platform</p>
            <h2 className="hero-heading">
              Manage your<br />
              <span>Digital Empire</span>
            </h2>
            <p className="hero-desc">
              Experience the next generation of content management. Powerful, intuitive, and designed for modern editorial teams.
            </p>
          </div>

          <div className="left-footer">
            &copy; {new Date().getFullYear()} Media Portal Inc. All rights reserved.
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="right-inner">
            <p className="form-eyebrow">Welcome Back</p>
            <h1 className="form-title">Secure Login</h1>

            <form action="#" method="POST">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@mediaportal.com"
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </div>

              <div className="form-row">
                <label className="remember">
                  <input id="remember-me" name="remember-me" type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="submit-btn">
                Sign In to Dashboard
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}