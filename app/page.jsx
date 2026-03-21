'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";

export default function LoginPage() {
  const axios = useAxios();
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const response = await axios.post("/auth/admin/login", { email, password });
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        // Also store user info if available
        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        router.push('/dashboard');
      } else {
        setLoginError('Login failed: No token received.');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Invalid email or password. Please try again.');
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

            <form onSubmit={handleLogin}>
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                  {loginError}
                </div>
              )}

              <div className="form-row">
                <label className="remember">
                  <input id="remember-me" name="remember-me" type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                {!loading && (
                  <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
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