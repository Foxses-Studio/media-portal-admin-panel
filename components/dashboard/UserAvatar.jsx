'use client';
import { getRoleBadge } from './utils';

export default function UserAvatar({ user, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 border border-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase overflow-hidden shrink-0`}>
      {user?.image
        ? <img src={user.image} alt={user.name || ''} className="h-full w-full object-cover" />
        : initial
      }
    </div>
  );
}

export function RoleBadge({ role }) {
  const { badge } = getRoleBadge(role);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${badge}`}>
      {role || 'n/a'}
    </span>
  );
}
