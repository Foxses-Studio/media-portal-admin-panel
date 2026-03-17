export function extractUsers(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.users)) return responseData.users;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.result)) return responseData.result;
  return [];
}

export const ROLE_STYLES = {
  admin:     { badge: 'bg-purple-100 text-purple-700 border border-purple-200', dot: 'bg-purple-500' },
  moderator: { badge: 'bg-orange-100 text-orange-700 border border-orange-200', dot: 'bg-orange-500' },
  editor:    { badge: 'bg-blue-100 text-blue-700 border border-blue-200',       dot: 'bg-blue-500' },
  parent:    { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
};

export function getRoleBadge(role) {
  return ROLE_STYLES[role?.toLowerCase()] || { badge: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' };
}
