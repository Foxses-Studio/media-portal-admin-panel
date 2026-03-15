'use client';
import { Loader2, Users } from 'lucide-react';
import UserAvatar, { RoleBadge } from './UserAvatar';

export default function UsersTable({ users, loading, emptyMessage = "No users found." }) {
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
                    : <span className="text-xs text-slate-300 italic">Full Access</span>
                  }
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
