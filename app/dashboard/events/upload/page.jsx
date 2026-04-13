'use client';

import { useEffect, useRef, useState } from 'react';
import {
  School, CalendarDays, Upload, Check,
  ChevronRight, ChevronLeft, Loader2, AlertCircle, X,
  ImageIcon, FileX, ArrowLeft, Search, FileArchive, FolderOpen,
} from 'lucide-react';
import useAxios from '@/hooks/useAxios';

const PAGE_SIZE = 10;

/* ─── Toast ───────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, []);
  const bg = { success: '#059669', error: '#dc2626', info: '#2563eb', warn: '#d97706' };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium"
      style={{ background: bg[type] || bg.info }}>
      {type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

/* ─── Step Bar (3 steps) ──────────────────────────────────── */
function StepBar({ step }) {
  const steps = [
    { n: 1, label: 'School',  Icon: School      },
    { n: 2, label: 'Event',   Icon: CalendarDays },
    { n: 3, label: 'Upload',  Icon: Upload       },
  ];
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => {
        const done = step > s.n, active = step === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1.5 ${active ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ background: done ? '#059669' : active ? '#2563eb' : '#e2e8f0',
                         boxShadow: active ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none' }}>
                {done ? <Check className="w-4 h-4 text-white" /> : <s.Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />}
              </div>
              <span className="text-xs font-semibold" style={{ color: active ? '#2563eb' : done ? '#059669' : '#94a3b8' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-4 transition-colors duration-300"
                style={{ background: done ? '#059669' : '#e2e8f0' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Search Input ────────────────────────────────────────── */
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none transition-all"
        style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
        onFocus={e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background='#fff'; }}
        onBlur={e =>  { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; e.target.style.background='#f9fafb'; }}
      />
      {value && <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
    </div>
  );
}

/* ─── SelectCard ──────────────────────────────────────────── */
function SelectCard({ item, selected, onSelect, icon: Icon, color }) {
  const palette = {
    blue:   { activeBg: '#eff6ff', activeBorder: '#93c5fd', activeRing: 'rgba(59,130,246,0.2)',  iconBg: '#dbeafe', iconColor: '#2563eb', textColor: '#1d4ed8' },
    indigo: { activeBg: '#eef2ff', activeBorder: '#a5b4fc', activeRing: 'rgba(99,102,241,0.2)',  iconBg: '#e0e7ff', iconColor: '#4f46e5', textColor: '#4338ca' },
  };
  const p = palette[color] || palette.blue;
  const isSel = selected?._id === item._id;
  return (
    <button onClick={() => onSelect(item)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150"
      style={{ background: isSel ? p.activeBg : '#fff', border: '1px solid ' + (isSel ? p.activeBorder : '#e5e7eb'),
               boxShadow: isSel ? `0 0 0 3px ${p.activeRing}` : '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: isSel ? p.iconBg : '#f3f4f6', color: isSel ? p.iconColor : '#9ca3af' }}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold flex-1 text-left" style={{ color: isSel ? p.textColor : '#374151' }}>{item.name}</span>
      {isSel && <Check className="w-4 h-4 shrink-0" style={{ color: p.iconColor }} />}
    </button>
  );
}

/* ─── StepList ────────────────────────────────────────────── */
function StepList({ items, selected, onSelect, icon, color, emptyText, emptyHint, searchPlaceholder, loading }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filtered = items.filter(i => (i.name||'').toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  if (loading) return <div className="flex items-center justify-center py-12 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading…</span></div>;
  if (!items.length) return (
    <div className="flex flex-col items-center py-12 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100"><School className="w-7 h-7 text-slate-300" /></div>
      <p className="text-sm font-semibold text-slate-500">{emptyText}</p>
      <p className="text-xs text-slate-400">{emptyHint}</p>
    </div>
  );
  return (
    <>
      <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder={searchPlaceholder} />
      <p className="text-[11px] text-slate-400 mb-3">{filtered.length} item{filtered.length!==1?'s':''}</p>
      <div className="space-y-2">{paged.map(item => <SelectCard key={item._id} item={item} selected={selected} onSelect={onSelect} icon={icon} color={color} />)}</div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-semibold text-slate-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </>
  );
}

/* ─── Upload Result ───────────────────────────────────────── */
function UploadResult({ result, onReset }) {
  const matched   = result.matchedStudents || [];
  const unmatched = result.unmatchedFiles  || [];
  const [mSearch, setMSearch] = useState('');
  const [uSearch, setUSearch] = useState('');
  const fM = matched.filter(s => `${s.name} ${s.studentId} ${s.filename}`.toLowerCase().includes(mSearch.toLowerCase()));
  const fU = unmatched.filter(f => f.toLowerCase().includes(uSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Images', value: result.totalUploaded, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
          { label: 'Matched ✓',    value: result.matched,       bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
          { label: 'Unmatched ✗',  value: result.unmatched,     bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Matched */}
      {matched.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Matched Images</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{matched.length}</span>
          </div>
          <SearchInput value={mSearch} onChange={setMSearch} placeholder="Search matched…" />
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {fM.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">ID: {s.studentId} · {s.filename}</p>
                </div>
                <a href={s.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline shrink-0">View</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched */}
      {unmatched.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Unmatched Files</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">{unmatched.length}</span>
          </div>
          <SearchInput value={uSearch} onChange={setUSearch} placeholder="Search unmatched…" />
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {fU.map(f => (
              <div key={f} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <FileX className="w-4 h-4 shrink-0 text-red-500" />
                <span className="text-sm truncate text-red-600">{f}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 text-slate-400">
            💡 Filename must start with the student ID, e.g. <code className="bg-slate-100 px-1 rounded">212223.jpg</code> or <code className="bg-slate-100 px-1 rounded">212223_2.jpg</code>
          </p>
        </div>
      )}

      <button onClick={onReset}
        className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl border-2 text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors">
        Upload More Images
      </button>
    </div>
  );
}

/* ─── Breadcrumb ──────────────────────────────────────────── */
function Breadcrumb({ school, event }) {
  const items = [
    school && { Icon: School,       label: school.name,  iconBg: '#dbeafe', iconColor: '#2563eb', textColor: '#1d4ed8' },
    event  && { Icon: CalendarDays, label: event.name,   iconBg: '#e0e7ff', iconColor: '#4f46e5', textColor: '#4338ca' },
  ].filter(Boolean);
  return (
    <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl mb-5 bg-slate-50 border border-slate-100">
      {items.map((b, i) => (
        <span key={i} className="flex items-center gap-1.5 text-xs">
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: b.iconBg }}>
            <b.Icon className="w-3 h-3" style={{ color: b.iconColor }} />
          </div>
          <span className="font-semibold" style={{ color: b.textColor }}>{b.label}</span>
          {i < items.length - 1 && <ChevronRight className="w-3 h-3 ml-1 text-slate-300" />}
        </span>
      ))}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function UploadImagesPage() {
  const axios = useAxios();
  const fileRef = useRef();

  const [step,           setStep]          = useState(1);
  const [schools,        setSchools]       = useState([]);
  const [events,         setEvents]        = useState([]);
  const [selectedSchool, setSelectedSchool]= useState(null);
  const [selectedEvent,  setSelectedEvent] = useState(null);
  const [loading,        setLoading]       = useState(false);
  const [uploading,      setUploading]     = useState(false);
  const [uploadResult,   setUploadResult]  = useState(null);
  const [files,          setFiles]         = useState([]);
  const [toast,          setToast]         = useState(null);
  const [filePage,       setFilePage]      = useState(1);

  const filePages  = Math.max(1, Math.ceil(files.length / PAGE_SIZE));
  const pagedFiles = files.slice((filePage-1)*PAGE_SIZE, filePage*PAGE_SIZE);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get('/events/schools');
        setSchools(res.data?.data || []);
      } catch { showToast('Failed to load schools', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSelectSchool = async (school) => {
    setSelectedSchool(school); setSelectedEvent(null); setEvents([]);
    setLoading(true);
    try {
      const res = await axios.get(`/events/schools/${school._id}/events`);
      setEvents(res.data?.data || []);
      setStep(2);
    } catch { showToast('Failed to load events', 'error'); }
    finally { setLoading(false); }
  };

  const handleSelectEvent = (ev) => {
    setSelectedEvent(ev);
    setFiles([]); setUploadResult(null); setFilePage(1);
    setStep(3);
  };

  const handleUpload = async () => {
    if (!files.length) return showToast('Please select files first', 'warn');
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      const res = await axios.post(
        `/events/events/${selectedEvent._id}/upload-images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (!res.data?.success) throw new Error(res.data?.message || 'Upload failed');
      setUploadResult(res.data.data);
      showToast(`Done! ${res.data.data.matched} matched, ${res.data.data.unmatched} unmatched`);
    } catch (e) {
      showToast(e.response?.data?.message || e.message || 'Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const goBack = () => {
    if (step === 2) { setStep(1); setSelectedSchool(null); }
    else if (step === 3) { setStep(2); setSelectedEvent(null); setFiles([]); setUploadResult(null); }
  };

  const handleReset = () => { setFiles([]); setUploadResult(null); setFilePage(1); };

  const handleFiles = (newFiles) => {
    setFiles(Array.from(newFiles));
    setFilePage(1);
  };

  // Drag & drop
  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const SectionLabel = ({ children }) => (
    <p className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-400">{children}</p>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Upload Student Photos</h1>
            <p className="text-sm mt-0.5 text-slate-500">
              Select a school &amp; event — upload images or a ZIP. No class selection needed.
            </p>
          </div>
          {step > 1 && (
            <button onClick={goBack}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl shrink-0 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <StepBar step={step} />
          </div>
          <div className="p-6">

            {/* Step 1: School */}
            {step === 1 && (
              <>
                <SectionLabel>Select a School</SectionLabel>
                <StepList items={schools} selected={selectedSchool} onSelect={handleSelectSchool}
                  icon={School} color="blue"
                  emptyText="No schools found." emptyHint="Create a school first in Events / Schools."
                  searchPlaceholder="Search schools…" loading={loading} />
              </>
            )}

            {/* Step 2: Event */}
            {step === 2 && (
              <>
                <Breadcrumb school={selectedSchool} />
                <SectionLabel>Select an Event</SectionLabel>
                <StepList items={events} selected={selectedEvent} onSelect={handleSelectEvent}
                  icon={CalendarDays} color="indigo"
                  emptyText="No events found." emptyHint="Create an event in Events / Schools."
                  searchPlaceholder="Search events…" loading={loading} />
              </>
            )}

            {/* Step 3: Upload */}
            {step === 3 && (
              <>
                <Breadcrumb school={selectedSchool} event={selectedEvent} />

                {uploadResult ? (
                  <UploadResult result={uploadResult} onReset={handleReset} />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left: info + drop zone */}
                    <div>
                      {/* Naming guide */}
                      <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 mb-2">📁 Filename convention</p>
                        <ul className="text-xs text-blue-600 space-y-1">
                          <li><code className="bg-white px-1 rounded">212223.jpg</code> — primary photo for student 212223</li>
                          <li><code className="bg-white px-1 rounded">212223_2.jpg</code> — 2nd photo, same student</li>
                          <li><code className="bg-white px-1 rounded">212223_3.jpg</code> — 3rd photo, same student</li>
                        </ul>
                        <p className="text-xs text-blue-500 mt-2">You can also upload a <strong>.zip</strong> containing all photos — no class selection needed!</p>
                      </div>

                      {/* Drop zone */}
                      <div
                        onClick={() => fileRef.current?.click()}
                        onDrop={onDrop}
                        onDragOver={e => e.preventDefault()}
                        className="cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all"
                        style={{
                          padding: '48px 24px',
                          borderColor: files.length > 0 ? '#93c5fd' : '#e5e7eb',
                          background:  files.length > 0 ? '#eff6ff'  : '#fafafa',
                        }}
                        onMouseEnter={e => { if (!files.length) e.currentTarget.style.borderColor='#93c5fd'; }}
                        onMouseLeave={e => { if (!files.length) e.currentTarget.style.borderColor='#e5e7eb'; }}
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: files.length > 0 ? '#bfdbfe' : '#dbeafe' }}>
                          {files.some(f => f.name.endsWith('.zip'))
                            ? <FileArchive className="w-7 h-7 text-blue-600" />
                            : <FolderOpen  className="w-7 h-7 text-blue-600" />}
                        </div>
                        {files.length > 0 ? (
                          <>
                            <p className="text-sm font-bold text-blue-700">{files.length} file{files.length!==1?'s':''} selected</p>
                            <p className="text-xs text-blue-400">Click to change selection</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-600">Drop images or a ZIP here</p>
                            <p className="text-xs text-slate-400">JPG · PNG · WEBP · ZIP — or click to browse</p>
                          </>
                        )}
                      </div>

                      {/* Accept images and ZIP */}
                      <input ref={fileRef} type="file" accept="image/*,.zip" multiple className="hidden"
                        onChange={e => handleFiles(e.target.files)} />

                      <button onClick={handleUpload} disabled={uploading || files.length === 0}
                        className="mt-4 w-full py-3 flex items-center justify-center gap-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
                        onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background='#1d4ed8'; }}
                        onMouseLeave={e => e.currentTarget.style.background='#2563eb'}
                      >
                        {uploading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading &amp; Matching…</>
                          : <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? `${files.length} File${files.length!==1?'s':''}` : 'Files'}</>
                        }
                      </button>
                    </div>

                    {/* Right: file list */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Files</p>
                        {files.length > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{files.length}</span>
                        )}
                      </div>
                      {files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl gap-3 text-center p-10 bg-slate-50 border border-dashed border-slate-200">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                          <p className="text-sm text-slate-400">No files selected yet</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 340 }}>
                            {pagedFiles.map((f, i) => (
                              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50">
                                  {f.name.endsWith('.zip')
                                    ? <FileArchive className="w-3.5 h-3.5 text-blue-500" />
                                    : <ImageIcon   className="w-3.5 h-3.5 text-blue-500" />}
                                </div>
                                <span className="text-xs font-medium truncate flex-1 text-slate-600">{f.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{(f.size/1024).toFixed(0)} KB</span>
                              </div>
                            ))}
                          </div>
                          {filePages > 1 && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                              <button onClick={() => setFilePage(p => Math.max(1,p-1))} disabled={filePage===1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-semibold text-slate-500">{filePage} / {filePages}</span>
                              <button onClick={() => setFilePage(p => Math.min(filePages,p+1))} disabled={filePage===filePages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-colors">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
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