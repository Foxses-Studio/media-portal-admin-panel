'use client';

import { useState, useEffect } from 'react';
import { UserPlus, X, Check, AlertCircle, Loader2, ChevronDown, Filter } from 'lucide-react';
import useAxios from '@/hooks/useAxios';
import UsersTable from '@/components/dashboard/UsersTable';
import { extractUsers } from '@/components/dashboard/utils';

const AVAILABLE_PAGES = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/posts',     label: 'Manage Posts' },
  { value: '/media',     label: 'Media Library' },
  { value: '/settings',  label: 'Settings' },
  { value: '/users',     label: 'Manage Users' },
];

const ROLES = ['admin', 'editor', 'moderator'];
const FILTER_ROLES = ['All', 'admin', 'moderator', 'editor', 'parent'];

const EMPTY_FORM = { name: '', email: '', password: '', role: 'editor', accessiblePages: [] };

export default function RegisterUserPage() {
  const axios = useAxios();

  const [users, setUsers]               = useState([]);
  const [isLoadingUsers, setLoading]    = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [filterRole, setFilterRole]     = useState('All');
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [status, setStatus]             = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage]           = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/users');
      // extractUsers handles all response formats: [], {users:[]}, {data:[]}, etc.
      setUsers(extractUsers(res.data));
    } catch (err) {
      console.error('fetchUsers error:', err.response?.data || err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePageToggle = (page) =>
    setFormData(prev => ({
      ...prev,
      accessiblePages: prev.accessiblePages.includes(page)
        ? prev.accessiblePages.filter(p => p !== page)
        : [...prev.accessiblePages, page],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const payload = {
      name:     formData.name,
      email:    formData.email,
      password: formData.password,
      role:     formData.role.toLowerCase(),
    };

    if (formData.role === 'moderator' && formData.accessiblePages.length > 0) {
      payload.accessiblePages = formData.accessiblePages;
    }

    const token    = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const endpoint = token ? '/users' : '/auth/admin/register';

    try {
      await axios.post(endpoint, payload);
      setStatus('success');
      setMessage(`${formData.name} has been registered successfully!`);
      setFormData(EMPTY_FORM);
      fetchUsers();
      setTimeout(() => { setShowForm(false); setStatus(null); }, 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    }
  };

  const filteredUsers = filterRole === 'All'
    ? users
    : users.filter(u => u.role?.toLowerCase() === filterRole);

  return (
    <div className="space-y-6 w-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl px-7 py-5 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">User Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">View all registered users and manage their access.</p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setStatus(null); setMessage(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><UserPlus className="w-4 h-4" /> Register New User</>}
        </button>
      </div>

      {/* ── Register Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Create New User Account</h3>
            <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1">* required fields</span>
          </div>

          {/* Status Alert */}
          {status && status !== 'loading' && (
            <div className={`mx-6 mt-5 flex items-center gap-3 p-4 rounded-xl text-sm font-medium border ${
              status === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {status === 'success'
                ? <Check className="w-5 h-5 shrink-0" />
                : <AlertCircle className="w-5 h-5 shrink-0" />}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name *</label>
                <input
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address *</label>
                <input
                  type="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Password *</label>
                <input
                  type="password" name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Role *</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm appearance-none cursor-pointer pr-10"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Accessible Pages (Moderator only) */}
            {formData.role === 'moderator' && (
              <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">Assign Accessible Pages</label>
                <p className="text-xs text-slate-500 mb-4">Select the routes this Moderator is allowed to access.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_PAGES.map(page => {
                    const selected = formData.accessiblePages.includes(page.value);
                    return (
                      <label
                        key={page.value}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                          selected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        <input type="checkbox" className="hidden" checked={selected} onChange={() => handlePageToggle(page.value)} />
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${selected ? 'bg-white border-transparent' : 'border-slate-300 bg-white'}`}>
                          {selected && <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />}
                        </div>
                        {page.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-60 text-sm"
              >
                {status === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><UserPlus className="w-4 h-4" /> Create User</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Users Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">All Registered Users</h3>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none pr-1"
            >
              {FILTER_ROLES.map(r => (
                <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>

        <UsersTable
          users={filteredUsers}
          loading={isLoadingUsers}
          emptyMessage={filterRole === 'All' ? "No users yet. Click 'Register New User' to add one." : `No ${filterRole} users found.`}
        />
      </div>

    </div>
  );
}
