'use client';

import { useEffect, useRef, useState } from 'react';
import {
  School, CalendarDays, BookOpen, Images, Upload, Check,
  ChevronRight, ChevronLeft, Loader2, AlertCircle, X, RefreshCw,
  ImageIcon, FileX, ArrowLeft, Search,
} from 'lucide-react';
import useAxios from '@/hooks/useAxios';

const PAGE_SIZE = 10;

// ─── Paged search hook ────────────────────────────────────────────────────────
function usePagedSearch(items) {
  const [search, setSearchRaw] = useState('');
  const [page, setPage]        = useState(1);

  const filtered   = items.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setSearch = (v) => { setSearchRaw(v); setPage(1); };

  return { search, setSearch, page: safePage, setPage, totalPages, paged, total: filtered.length };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  const colors = {
    success: '#059669',
    error:   '#dc2626',
    info:    '#2563eb',
    warn:    '#d97706',
  };
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium"
      style={{ background: colors[type] || colors.info }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = [
    { n: 1, label: 'School', Icon: School      },
    { n: 2, label: 'Event',  Icon: CalendarDays },
    { n: 3, label: 'Class',  Icon: BookOpen     },
    { n: 4, label: 'Upload', Icon: Upload       },
  ];
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => {
        const done   = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1.5 ${active ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? '#059669' : active ? '#2563eb' : '#e2e8f0',
                  boxShadow:  active ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                }}
              >
                {done
                  ? <Check className="w-4 h-4 text-white" />
                  : <s.Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />}
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: active ? '#2563eb' : done ? '#059669' : '#94a3b8' }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-4 transition-colors duration-300"
                style={{ background: done ? '#059669' : '#e2e8f0' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none transition-all"
        style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = '#fff'; }}
        onBlur={e =>  { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={e => e.currentTarget.style.color = '#374151'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  let start = Math.max(1, page - 2), end = Math.min(total, page + 2);
  if (end - start < 4) { start = Math.max(1, end - 4); end = Math.min(total, start + 4); }
  for (let i = start; i <= end; i++) pages.push(i);

  const Btn = ({ children, onClick, disabled, active }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
      style={{
        background: active ? '#6366f1' : 'transparent',
        color:      active ? '#fff' : disabled ? '#d1d5db' : '#6b7280',
        cursor:     disabled ? 'not-allowed' : 'pointer',
        border:     '1px solid ' + (active ? '#6366f1' : 'transparent'),
      }}
      onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; } }}
      onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
      <p className="text-xs" style={{ color: '#9ca3af' }}>
        Page <span className="font-semibold" style={{ color: '#374151' }}>{page}</span> of{' '}
        <span className="font-semibold" style={{ color: '#374151' }}>{total}</span>
      </p>
      <div className="flex items-center gap-0.5">
        <Btn onClick={() => onChange(page - 1)} disabled={page === 1}><ChevronLeft className="w-3.5 h-3.5" /></Btn>
        {start > 1 && <><Btn onClick={() => onChange(1)}>1</Btn>{start > 2 && <span className="px-1 text-xs" style={{ color: '#d1d5db' }}>…</span>}</>}
        {pages.map(p => <Btn key={p} onClick={() => onChange(p)} active={p === page}>{p}</Btn>)}
        {end < total && <>{end < total - 1 && <span className="px-1 text-xs" style={{ color: '#d1d5db' }}>…</span>}<Btn onClick={() => onChange(total)}>{total}</Btn></>}
        <Btn onClick={() => onChange(page + 1)} disabled={page === total}><ChevronRight className="w-3.5 h-3.5" /></Btn>
      </div>
    </div>
  );
}

// ─── Selectable Card ──────────────────────────────────────────────────────────
function SelectCard({ item, selected, onSelect, icon: Icon, color }) {
  const palette = {
    blue:   { activeBg: '#eff6ff', activeBorder: '#93c5fd', activeRing: 'rgba(59,130,246,0.2)',   iconBg: '#dbeafe', iconColor: '#2563eb', textColor: '#1d4ed8' },
    indigo: { activeBg: '#eef2ff', activeBorder: '#a5b4fc', activeRing: 'rgba(99,102,241,0.2)',   iconBg: '#e0e7ff', iconColor: '#4f46e5', textColor: '#4338ca' },
    purple: { activeBg: '#faf5ff', activeBorder: '#c4b5fd', activeRing: 'rgba(139,92,246,0.2)',   iconBg: '#ede9fe', iconColor: '#7c3aed', textColor: '#6d28d9' },
  };
  const p          = palette[color] || palette.blue;
  const isSelected = selected?._id === item._id;

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150"
      style={{
        background:  isSelected ? p.activeBg   : '#fff',
        border:      '1px solid ' + (isSelected ? p.activeBorder : '#e5e7eb'),
        boxShadow:   isSelected ? `0 0 0 3px ${p.activeRing}` : '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.07)'; } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; } }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: isSelected ? p.iconBg : '#f3f4f6', color: isSelected ? p.iconColor : '#9ca3af' }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold flex-1 text-left" style={{ color: isSelected ? p.textColor : '#374151' }}>
        {item.name}
      </span>
      {isSelected && <Check className="w-4 h-4 shrink-0" style={{ color: p.iconColor }} />}
    </button>
  );
}

// ─── Step List (search + cards + pagination) ──────────────────────────────────
function StepList({ items, selected, onSelect, icon, color, emptyIcon: EmptyIcon, emptyText, emptyHint, searchPlaceholder, loading, loadingText }) {
  const { search, setSearch, page, setPage, totalPages, paged, total } = usePagedSearch(items);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2" style={{ color: '#9ca3af' }}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">{loadingText}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#f3f4f6' }}>
          <EmptyIcon className="w-7 h-7" style={{ color: '#d1d5db' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#6b7280' }}>{emptyText}</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{emptyHint}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} />

      {/* result count */}
      <p className="text-[11px] font-medium mb-3" style={{ color: '#9ca3af' }}>
        {search
          ? <>{total} result{total !== 1 ? 's' : ''} for "<span style={{ color: '#374151' }}>{search}</span>"</>
          : <>{items.length} {items.length !== 1 ? 'items' : 'item'}</>
        }
      </p>

      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <Search className="w-7 h-7" style={{ color: '#d1d5db' }} />
          <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>No results for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map(item => (
            <SelectCard key={item._id} item={item} selected={selected} onSelect={onSelect} icon={icon} color={color} />
          ))}
        </div>
      )}

      <Pagination page={page} total={totalPages} onChange={setPage} />
    </>
  );
}

// ─── Upload Result ────────────────────────────────────────────────────────────
function UploadResult({ result, onReset }) {
  const [mSearch, setMSearch] = useState('');
  const [uSearch, setUSearch] = useState('');
  const [mPage,   setMPage]   = useState(1);
  const [uPage,   setUPage]   = useState(1);

  const matched   = result.matchedStudents  || [];
  const unmatched = result.unmatchedFiles   || [];

  const fMatched   = matched.filter(s   => `${s.name} ${s.studentId}`.toLowerCase().includes(mSearch.toLowerCase()));
  const fUnmatched = unmatched.filter(f => f.toLowerCase().includes(uSearch.toLowerCase()));

  const mPages = Math.max(1, Math.ceil(fMatched.length   / PAGE_SIZE));
  const uPages = Math.max(1, Math.ceil(fUnmatched.length / PAGE_SIZE));
  const safeMPage = Math.min(mPage, mPages);
  const safeUPage = Math.min(uPage, uPages);

  const pagedM = fMatched.slice((safeMPage - 1) * PAGE_SIZE, safeMPage * PAGE_SIZE);
  const pagedU = fUnmatched.slice((safeUPage - 1) * PAGE_SIZE, safeUPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Uploaded', value: result.totalUploaded, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
          { label: 'Matched ✓',      value: result.matched,       bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
          { label: 'Unmatched ✗',    value: result.unmatched,     bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Matched students */}
      {matched.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Matched Students</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#059669' }}>
              {matched.length}
            </span>
          </div>
          <SearchInput value={mSearch} onChange={v => { setMSearch(v); setMPage(1); }} placeholder="Search matched students…" />
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {pagedM.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: '#9ca3af' }}>No results</p>
              : pagedM.map(s => (
                <div key={s.studentId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#d1fae5' }}>
                    <ImageIcon className="w-4 h-4" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>ID: {s.studentId}</p>
                  </div>
                  <a href={s.imageUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold shrink-0 hover:underline" style={{ color: '#059669' }}>
                    View
                  </a>
                </div>
              ))
            }
          </div>
          {mPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
              <span className="text-xs" style={{ color: '#9ca3af' }}>
                {(safeMPage - 1) * PAGE_SIZE + 1}–{Math.min(safeMPage * PAGE_SIZE, fMatched.length)} of {fMatched.length}
              </span>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setMPage(p => Math.max(1,p-1))} disabled={safeMPage===1} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30" style={{ color: '#6b7280' }} onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background='transparent'}><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-xs font-semibold px-2" style={{ color: '#374151' }}>{safeMPage} / {mPages}</span>
                <button onClick={() => setMPage(p => Math.min(mPages,p+1))} disabled={safeMPage===mPages} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30" style={{ color: '#6b7280' }} onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background='transparent'}><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unmatched files */}
      {unmatched.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Unmatched Files</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#ef4444' }}>
              {unmatched.length}
            </span>
          </div>
          <SearchInput value={uSearch} onChange={v => { setUSearch(v); setUPage(1); }} placeholder="Search unmatched files…" />
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {pagedU.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: '#9ca3af' }}>No results</p>
              : pagedU.map(f => (
                <div key={f} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <FileX className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
                  <span className="text-sm truncate" style={{ color: '#dc2626' }}>{f}</span>
                </div>
              ))
            }
          </div>
          {uPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
              <span className="text-xs" style={{ color: '#9ca3af' }}>
                {(safeUPage - 1) * PAGE_SIZE + 1}–{Math.min(safeUPage * PAGE_SIZE, fUnmatched.length)} of {fUnmatched.length}
              </span>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setUPage(p => Math.max(1,p-1))} disabled={safeUPage===1} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30" style={{ color: '#6b7280' }} onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background='transparent'}><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-xs font-semibold px-2" style={{ color: '#374151' }}>{safeUPage} / {uPages}</span>
                <button onClick={() => setUPage(p => Math.min(uPages,p+1))} disabled={safeUPage===uPages} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30" style={{ color: '#6b7280' }} onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background='transparent'}><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
          <p className="text-xs mt-3" style={{ color: '#9ca3af' }}>
            💡 Ensure filenames match student IDs (e.g.{' '}
            <code className="rounded px-1" style={{ background: '#f3f4f6' }}>1001.jpg</code>)
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-colors"
        style={{ color: '#2563eb', border: '2px solid #bfdbfe', background: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <RefreshCw className="w-4 h-4" /> Upload More Images
      </button>
    </div>
  );
}

// ─── Breadcrumb strip ─────────────────────────────────────────────────────────
function BreadcrumbStrip({ school, event, cls }) {
  const items = [
    { icon: School,       label: school?.name, iconBg: '#dbeafe', iconColor: '#2563eb', textColor: '#1d4ed8' },
    event && { icon: CalendarDays, label: event?.name,  iconBg: '#e0e7ff', iconColor: '#4f46e5', textColor: '#4338ca' },
    cls   && { icon: BookOpen,     label: cls?.name,    iconBg: '#ede9fe', iconColor: '#7c3aed', textColor: '#6d28d9' },
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl mb-5" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
      {items.map((b, i) => (
        <span key={i} className="flex items-center gap-1.5 text-xs">
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: b.iconBg }}>
            <b.icon className="w-3 h-3" style={{ color: b.iconColor }} />
          </div>
          <span className="font-semibold" style={{ color: b.textColor }}>{b.label}</span>
          {i < items.length - 1 && <ChevronRight className="w-3 h-3 ml-1" style={{ color: '#d1d5db' }} />}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UploadImagesPage() {
  const axios = useAxios();

  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState([]);
  const [events,  setEvents]  = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedEvent,  setSelectedEvent]  = useState(null);
  const [selectedClass,  setSelectedClass]  = useState(null);

  const [loading,      setLoading]      = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [files,        setFiles]        = useState([]);
  const [toast,        setToast]        = useState(null);
  const fileRef = useRef();

  const [filePage, setFilePage] = useState(1);
  const filePages   = Math.max(1, Math.ceil(files.length / PAGE_SIZE));
  const safeFilePg  = Math.min(filePage, filePages);
  const pagedFiles  = files.slice((safeFilePg - 1) * PAGE_SIZE, safeFilePg * PAGE_SIZE);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Step 1: load schools ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get('/events/schools');
        setSchools(res.data?.data || []);
      } catch {
        showToast('Failed to load schools', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Step 2: school selected → load events ───────────────────────────────────
  const handleSelectSchool = async (school) => {
    setSelectedSchool(school);
    setSelectedEvent(null); setSelectedClass(null);
    setEvents([]); setClasses([]);
    setLoading(true);
    try {
      const res = await axios.get(`/events/schools/${school._id}/events`);
      setEvents(res.data?.data || []);
      setStep(2);
    } catch {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: event selected → load classes ───────────────────────────────────
  const handleSelectEvent = async (ev) => {
    setSelectedEvent(ev);
    setSelectedClass(null); setClasses([]);
    setLoading(true);
    try {
      const res = await axios.get(`/events/events/${ev._id}/classes`);
      setClasses(res.data?.data || []);
      setStep(3);
    } catch {
      showToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: class selected ──────────────────────────────────────────────────
  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setFiles([]); setUploadResult(null); setFilePage(1);
    setStep(4);
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!files.length) return showToast('Please select images first', 'warn');
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await axios.post(
        `/events/classes/${selectedClass._id}/upload-images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (!res.data?.success) throw new Error(res.data?.message || 'Upload failed');
      setUploadResult(res.data.data);
      showToast(`Done! ${res.data.data.matched} matched, ${res.data.data.unmatched} unmatched`);
    } catch (e) {
      showToast(e.response?.data?.message || e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => { setFiles([]); setUploadResult(null); setFilePage(1); };

  const goBack = () => {
    if (step === 2) { setStep(1); setSelectedSchool(null); }
    else if (step === 3) { setStep(2); setSelectedEvent(null); }
    else if (step === 4) { setStep(3); setSelectedClass(null); setFiles([]); setUploadResult(null); }
  };

  // ── Section label ────────────────────────────────────────────────────────────
  const SectionLabel = ({ children }) => (
    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#9ca3af' }}>{children}</p>
  );

  return (
    <div className="w-full min-h-screen" style={{ background: '#f3f4f6', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="p-6 flex flex-col gap-5">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Upload Student Photos</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
              Select a school, event, and class — then upload images to Cloudflare.
            </p>
          </div>
          {step > 1 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
              style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>

          {/* Step bar inside card header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <StepBar step={step} />
          </div>

          {/* Card body */}
          <div className="p-6">

            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <SectionLabel>Select a School</SectionLabel>
                <StepList
                  items={schools} selected={selectedSchool} onSelect={handleSelectSchool}
                  icon={School} color="blue"
                  emptyIcon={School} emptyText="No schools found." emptyHint="Create a school first in Events / Schools."
                  searchPlaceholder="Search schools…" loading={loading} loadingText="Loading schools…"
                />
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <BreadcrumbStrip school={selectedSchool} />
                <SectionLabel>Select an Event</SectionLabel>
                <StepList
                  items={events} selected={selectedEvent} onSelect={handleSelectEvent}
                  icon={CalendarDays} color="indigo"
                  emptyIcon={CalendarDays} emptyText="No events in this school." emptyHint="Go to Events / Schools to add events."
                  searchPlaceholder="Search events…" loading={loading} loadingText="Loading events…"
                />
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <>
                <BreadcrumbStrip school={selectedSchool} event={selectedEvent} />
                <SectionLabel>Select a Class</SectionLabel>
                <StepList
                  items={classes} selected={selectedClass} onSelect={handleSelectClass}
                  icon={BookOpen} color="purple"
                  emptyIcon={BookOpen} emptyText="No classes in this event." emptyHint="Go to Events / Schools to add classes."
                  searchPlaceholder="Search classes…" loading={loading} loadingText="Loading classes…"
                />
              </>
            )}

            {/* ── Step 4: Upload ── */}
            {step === 4 && (
              <>
                <BreadcrumbStrip school={selectedSchool} event={selectedEvent} cls={selectedClass} />

                {uploadResult ? (
                  <UploadResult result={uploadResult} onReset={handleReset} />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left: hint + drop zone */}
                    <div>
                      {/* Naming hint */}
                      <div className="mb-5 p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#1d4ed8' }}>📁 File naming convention</p>
                        <p className="text-xs" style={{ color: '#2563eb' }}>
                          Name each image with the student ID:{' '}
                          <code className="px-1.5 py-0.5 rounded font-mono" style={{ background: '#fff' }}>1001.jpg</code>,{' '}
                          <code className="px-1.5 py-0.5 rounded font-mono" style={{ background: '#fff' }}>1002.png</code>
                        </p>
                        <p className="text-xs mt-1.5" style={{ color: '#60a5fa' }}>
                          Files are matched automatically. Unmatched files will be flagged.
                        </p>
                      </div>

                      {/* Drop zone */}
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors"
                        style={{
                          padding: '48px 24px',
                          borderColor: files.length > 0 ? '#93c5fd' : '#e5e7eb',
                          background:  files.length > 0 ? '#eff6ff'  : '#fafafa',
                        }}
                        onMouseEnter={e => { if (!files.length) e.currentTarget.style.borderColor = '#93c5fd'; }}
                        onMouseLeave={e => { if (!files.length) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#dbeafe' }}>
                          <Images className="w-7 h-7" style={{ color: '#2563eb' }} />
                        </div>
                        {files.length > 0 ? (
                          <>
                            <p className="text-sm font-bold" style={{ color: '#1d4ed8' }}>
                              {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </p>
                            <p className="text-xs" style={{ color: '#60a5fa' }}>Click to change selection</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold" style={{ color: '#374151' }}>Click to browse or drop images</p>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>JPG, PNG, WEBP — multiple files supported</p>
                          </>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={e => { setFiles(Array.from(e.target.files)); setFilePage(1); }} />

                      <button
                        onClick={handleUpload}
                        disabled={uploading || files.length === 0}
                        className="mt-4 w-full py-3 flex items-center justify-center gap-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
                        onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#1d4ed8'; }}
                        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                      >
                        {uploading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading to Cloudflare…</>
                          : <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? `${files.length} Image${files.length !== 1 ? 's' : ''}` : 'Images'}</>
                        }
                      </button>
                    </div>

                    {/* Right: selected files list */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Selected Files</p>
                        {files.length > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            {files.length} files
                          </span>
                        )}
                      </div>

                      {files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl gap-3 text-center" style={{ padding: '48px 24px', background: '#fafafa', border: '1px dashed #e5e7eb' }}>
                          <ImageIcon className="w-8 h-8" style={{ color: '#d1d5db' }} />
                          <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>No files selected yet</p>
                          <p className="text-xs" style={{ color: '#d1d5db' }}>Select images from the left panel</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '340px' }}>
                            {pagedFiles.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                                style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
                              >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#dbeafe' }}>
                                  <ImageIcon className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
                                </div>
                                <span className="text-xs font-medium truncate flex-1" style={{ color: '#374151' }}>{f.name}</span>
                                <span className="text-[10px] shrink-0" style={{ color: '#9ca3af' }}>
                                  {(f.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            ))}
                          </div>

                          {filePages > 1 && (
                            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                              <span className="text-xs" style={{ color: '#9ca3af' }}>
                                {(safeFilePg - 1) * PAGE_SIZE + 1}–{Math.min(safeFilePg * PAGE_SIZE, files.length)} of {files.length}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => setFilePage(p => Math.max(1, p-1))} disabled={safeFilePg === 1}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                                  style={{ color: '#6b7280' }}
                                  onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'}
                                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-semibold px-2" style={{ color: '#374151' }}>{safeFilePg} / {filePages}</span>
                                <button onClick={() => setFilePage(p => Math.min(filePages, p+1))} disabled={safeFilePg === filePages}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                                  style={{ color: '#6b7280' }}
                                  onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'}
                                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}