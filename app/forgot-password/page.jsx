'use client';
import { useState } from "react";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";

export default function ForgotPasswordPage() {
  const axios = useAxios();
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await axios.post("/auth/forgot-password", { email });
      if (response.data && response.data.message) {
        setStatusMessage(response.data.message);
      } else {
        setStatusMessage('Password reset link sent to your email.');
      }
      setEmail('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <p className="hero-label">Security</p>
            <h2 className="hero-heading">
              Secure Account<br />
              <span>Recovery</span>
            </h2>
            <p className="hero-desc">
              Regain access to your modern digital workspace rapidly and securely. Your editorial journey continues here.
            </p>
          </div>

          <div className="left-footer">
            &copy; {new Date().getFullYear()} Media Portal Inc. All rights reserved.
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="right-inner">
            <p className="form-eyebrow">Forgot Password</p>
            <h1 className="form-title">Reset Access</h1>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Registered Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@mediaportal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                  {errorMsg}
                </div>
              )}

              {statusMessage && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                  {statusMessage}
                </div>
              )}

              <div className="form-row">
                <Link href="/" className="forgot-link">
                  &lt; Back to Sign In
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending Link...' : 'Send Reset Link'}
                {!loading && (
                  <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
