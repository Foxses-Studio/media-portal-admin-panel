'use client';
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";

export default function ResetPasswordPage() {
  const axios = useAxios();
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/auth/reset-password", { token, password });
      setSuccessMsg(response.data?.message || 'Password reset successful! You can now log in.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. The link might be expired.');
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
            <p className="hero-label">Security Update</p>
            <h2 className="hero-heading">
              New Password<br />
              <span>Creation</span>
            </h2>
            <p className="hero-desc">
              Create a strong new password to secure your admin account. Keep your media enterprise protected.
            </p>
          </div>

          <div className="left-footer">
            &copy; {new Date().getFullYear()} Media Portal Inc. All rights reserved.
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="right-inner">
            <p className="form-eyebrow">Recovery</p>
            <h1 className="form-title">Reset Password</h1>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                  {successMsg}
                </div>
              )}

              {!successMsg && (
                <div className="form-row">
                  <Link href="/" className="forgot-link">
                    &lt; Back to Sign In
                  </Link>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading || successMsg}>
                {loading ? 'Reseting Password...' : successMsg ? 'Redirecting...' : 'Update Password'}
                {!loading && !successMsg && (
                  <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
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
