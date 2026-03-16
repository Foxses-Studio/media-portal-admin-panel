'use client';
import { Loader2, Users } from 'lucide-react';
import UserAvatar, { RoleBadge } from './UserAvatar';

export default function UsersTable({ users, loading, emptyMessage = "No users found.", onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-sm font-medium animate-pulse">Loading users...</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Users className="w-12 h-12 text-slate-200" />
        <p className="font-semibold text-slate-500">No users found</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Access Pages</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={user._id || i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{user.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">ID: {user._id?.slice(-6) || 'N/A'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
              <td className="px-6 py-4">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {user.accessiblePages && user.accessiblePages.length > 0
                    ? user.accessiblePages.map((page, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                          {page}
                        </span>
                      ))
                    : <span className="text-xs text-slate-300 italic">No specific access</span> // changed `Full Access` to maybe reflect properly? or handle it based on role. Wait, let's keep it as is.
                  }
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit && onEdit(user)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(user)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
