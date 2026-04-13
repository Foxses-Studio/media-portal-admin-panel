'use client';

import { useState, useEffect } from 'react';
import {
  School, CalendarDays, Trash2, Pencil, Plus, Search,
  Download, Loader2, ChevronRight, GraduationCap, Users,
  UploadCloud, ImageIcon, ArrowLeft, Home, ChevronLeft, X, FileText
} from 'lucide-react';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

import Papa from 'papaparse';

const PAGE_SIZE = 10;

// ── Demo CSV templates per context ──────────────────────────────────────────
const DEMO_CSV = {
  'bulk': `className,studentId,firstName,lastName,parentEmail,dateOfBirth
Grade 3A,S001,Alice,Johnson,alice.parent@email.com,2015-05-12
Grade 3A,S002,Bob,Smith,bob.parent@email.com,2016-01-20
Grade 3B,S003,Carol,White,carol.parent@email.com,2015-11-08
Grade 3B,S004,David,Brown,david.parent@email.com,2016-03-30`,
  'students': `studentId,firstName,lastName,parentEmail,dateOfBirth
S001,Alice,Johnson,alice.parent@email.com,2015-05-12
S002,Bob,Smith,bob.parent@email.com,2016-01-20
S003,Carol,White,carol.parent@email.com,2015-11-08
S004,David,Brown,,2016-03-30`,
};

function downloadDemoCSV(type) {
  const content = DEMO_CSV[type] || DEMO_CSV['students'];
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `demo_${type}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EventsPage() {
  const axios = useAxios();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ schools: 0, events: 0, classes: 0 });
  const [navStack, setNavStack] = useState([{ type: 'root', id: null, name: 'Events / Schools' }]);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [uploadModal, setUploadModal] = useState({
    isOpen: false, url: '', callback: null, accept: '',
    title: '', multiple: false, paramName: 'file', demoType: null
  });

  const current = navStack[navStack.length - 1];

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (current.type === 'class') fetchStudents(current.id);
    else setClassStudents([]);
    setSearch(''); setPage(1);
  }, [current]);

  const fetchStudents = async (classId) => {
    setLoadingStudents(true);
    try {
      const res = await axios.get(`/events/classes/${classId}/students`);
      setClassStudents(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingStudents(false); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/events/schools');
      const schoolsData = res.data?.data || [];
      let totalEvents = 0, totalClasses = 0;
      const augmented = await Promise.all(schoolsData.map(async (school) => {
        let events = [];
        try {
          const evRes = await axios.get(`/events/schools/${school._id}/events`);
          events = evRes.data?.data || [];
          totalEvents += events.length;
          events = await Promise.all(events.map(async (ev) => {
            let classes = [];
            try {
              const classRes = await axios.get(`/events/events/${ev._id}/classes`);
              classes = classRes.data?.data || [];
              totalClasses += classes.length;
              classes = await Promise.all(classes.map(async (cls) => {
                try {
                  const stRes = await axios.get(`/events/classes/${cls._id}/students`);
                  return { ...cls, studentCount: (stRes.data?.data || []).length };
                } catch { return { ...cls, studentCount: 0 }; }
              }));
            } catch {}
            return { ...ev, classes };
          }));
        } catch {}
        return { ...school, events };
      }));
      setSchools(augmented);
      setStats({ schools: augmented.length, events: totalEvents, classes: totalClasses });
    } catch {
      Swal.fire('Error', 'Failed to load data.', 'error');
    } finally { setLoading(false); }
  };

  const pushNav = (item) => { setNavStack(p => [...p, item]); setPage(1); };
  const goTo = (idx) => { setNavStack(p => p.slice(0, idx + 1)); setPage(1); };

  const getCurrentRows = () => {
    if (current.type === 'root') return schools;
    if (current.type === 'school') return schools.find(s => s._id === current.id)?.events || [];
    if (current.type === 'event') {
      for (const s of schools) {
        const ev = s.events.find(e => e._id === current.id);
        if (ev) return ev.classes || [];
      }
    }
    return [];
  };

  const getCtx = () => {
    if (current.type === 'school') return schools.find(s => s._id === current.id);
    if (current.type === 'event') {
      for (const s of schools) { const ev = s.events.find(e => e._id === current.id); if (ev) return { ...ev, schoolName: s.name }; }
    }
    if (current.type === 'class') {
      for (const s of schools) { for (const ev of s.events) { const cls = ev.classes.find(c => c._id === current.id); if (cls) return { ...cls, eventName: ev.name, schoolName: s.name }; } }
    }
    return null;
  };

  const allRows = getCurrentRows();
  const ctx = getCtx();
  const isClass = current.type === 'class';

  const filteredRows = allRows.filter(r => (r.name || '').toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = classStudents.filter(st =>
    `${st.firstName} ${st.lastName} ${st.studentId}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeList = isClass ? filteredStudents : filteredRows;
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedList = activeList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ─── CRUD ──────────────────────────────────────────────────────────────
  const ask = (title, placeholder, val = '') =>
    Swal.fire({ title, input: 'text', inputValue: val, inputPlaceholder: placeholder, showCancelButton: true, inputValidator: v => !v?.trim() && 'Required!' });

  const handleAddSchool    = async () => { const { value: n } = await ask('New School', 'e.g. Riverside Elementary'); if (!n?.trim()) return; try { await axios.post('/events/schools', { name: n.trim() }); fetchData(); } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Error', 'error'); } };
  const handleEditSchool   = async (s, e) => { e.stopPropagation(); const { value: n } = await ask('Rename School', '', s.name); if (!n?.trim() || n === s.name) return; try { await axios.put(`/events/schools/${s._id}`, { name: n.trim() }); fetchData(); } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Error', 'error'); } };
  const handleDeleteSchool = async (s, e) => { e.stopPropagation(); const r = await Swal.fire({ title: `Delete "${s.name}"?`, text: 'Removes all events & classes.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' }); if (!r.isConfirmed) return; try { await axios.delete(`/events/schools/${s._id}`); goTo(0); fetchData(); } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Error', 'error'); } };
  const handleExport       = async (s, e) => { e.stopPropagation(); try { const res = await axios.get(`/events/schools/${s._id}/export`); const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${s.name.replace(/\s+/g, '_')}.json`; a.click(); } catch { Swal.fire('Error', 'Export failed', 'error'); } };
  const handleAddEvent     = async () => { const { value: n } = await ask('New Event', 'e.g. Spring 2026 Photos'); if (!n?.trim()) return; try { await axios.post(`/events/schools/${current.id}/events`, { name: n.trim() }); fetchData(); } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Error', 'error'); } };
  const handleEditEvent    = async (ev, e) => { e.stopPropagation(); const { value: n } = await ask('Rename Event', '', ev.name); if (!n?.trim() || n === ev.name) return; try { await axios.put(`/events/events/${ev._id}`, { name: n.trim() }); fetchData(); } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Error', 'error'); } };
  const handleDeleteEvent  = async (ev, e) => { e.stopPropagation(); const r = await Swal.fire({ title: `Delete "${ev.name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' }); if (!r.isConfirmed) return; try { await axios.delete(`/events/events/${ev._id}`); goTo(navStack.length - 2); fetchData(); } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Error', 'error'); } };
  const handleAddClass     = async () => { const { value: n } = await ask('New Class', 'e.g. Grade 3A'); if (!n?.trim()) return; try { await axios.post(`/events/events/${current.id}/classes`, { name: n.trim() }); fetchData(); } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Error', 'error'); } };
  const handleEditClass    = async (cls, e) => { e.stopPropagation(); const { value: n } = await ask('Rename Class', '', cls.name); if (!n?.trim() || n === cls.name) return; try { await axios.put(`/events/classes/${cls._id}`, { name: n.trim() }); fetchData(); } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Error', 'error'); } };
  const handleDeleteClass  = async (cls, e) => { e.stopPropagation(); const r = await Swal.fire({ title: `Delete "${cls.name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' }); if (!r.isConfirmed) return; try { await axios.delete(`/events/classes/${cls._id}`); goTo(navStack.length - 2); fetchData(); } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Error', 'error'); } };

  const handleAddStudent = async () => {
    const { value: fv } = await Swal.fire({
      title: 'New Student',
      html: '<input id="sw-id" class="swal2-input" placeholder="Student ID"><input id="sw-fn" class="swal2-input" placeholder="First Name"><input id="sw-ln" class="swal2-input" placeholder="Last Name"><input id="sw-em" class="swal2-input" placeholder="Parent Email (optional)"><input id="sw-dob" type="date" class="swal2-input" placeholder="Date of Birth" style="margin-top: 15px; width: 80%; max-width: 100%; border: 1px solid #d9d9d9; border-radius: 4px; padding: 0 12px; height: 3.25em;">',
      focusConfirm: false, showCancelButton: true,
      preConfirm: () => [document.getElementById('sw-id').value, document.getElementById('sw-fn').value, document.getElementById('sw-ln').value, document.getElementById('sw-em').value, document.getElementById('sw-dob').value]
    });
    if (fv) {
      const [studentId, firstName, lastName, parentEmail, dateOfBirth] = fv;
      if (!studentId || !firstName || !lastName || !dateOfBirth) return Swal.fire('Error', 'ID, First Name, Last Name and Date of Birth required', 'error');
      try { await axios.post(`/events/classes/${current.id}/students`, { studentId, firstName, lastName, parentEmail, dateOfBirth }); fetchStudents(current.id); } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Error', 'error'); }
    }
  };
  const handleEditStudent = async (st) => {
    const { value: fv } = await Swal.fire({
      title: 'Edit Student',
      html: `<input id="sw-id" class="swal2-input" value="${st.studentId}" placeholder="Student ID"><input id="sw-fn" class="swal2-input" value="${st.firstName}" placeholder="First Name"><input id="sw-ln" class="swal2-input" value="${st.lastName}" placeholder="Last Name"><input id="sw-em" class="swal2-input" value="${st.parentEmail || ''}" placeholder="Parent Email"><input id="sw-dob" type="date" class="swal2-input" value="${st.dob ? new Date(st.dob).toISOString().split('T')[0] : ''}" placeholder="Date of Birth" style="margin-top: 15px; width: 80%; max-width: 100%; border: 1px solid #d9d9d9; border-radius: 4px; padding: 0 12px; height: 3.25em;">`,
      focusConfirm: false, showCancelButton: true,
      preConfirm: () => [document.getElementById('sw-id').value, document.getElementById('sw-fn').value, document.getElementById('sw-ln').value, document.getElementById('sw-em').value, document.getElementById('sw-dob').value]
    });
    if (fv) {
      const [studentId, firstName, lastName, parentEmail, dateOfBirth] = fv;
      if (!studentId || !firstName || !lastName || !dateOfBirth) return Swal.fire('Error', 'ID, First Name, Last Name and Date of Birth required', 'error');
      try { await axios.put(`/events/students/${st._id}`, { studentId, firstName, lastName, parentEmail, dateOfBirth }); fetchStudents(current.id); } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Error', 'error'); }
    }
  };
  const handleDeleteStudent = async (st) => {
    const r = await Swal.fire({ title: `Delete ${st.firstName}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (!r.isConfirmed) return;
    try { await axios.delete(`/events/students/${st._id}`); fetchStudents(current.id); } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Error', 'error'); }
  };

  const handleFileUpload = (url, callback, title, demoType) =>
    setUploadModal({ isOpen: true, url, callback, accept: '.csv', title, multiple: false, paramName: 'file', demoType });
  const handleImageUpload = () =>
    setUploadModal({ isOpen: true, url: `/events/classes/${current.id}/upload-images`, callback: () => fetchStudents(current.id), accept: 'image/*', title: 'Upload Student Photos', multiple: true, paramName: 'images', demoType: null });

  // ─── Level config ───────────────────────────────────────────────────────
  const levelCfg = {
    root:   { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: <School className="w-4 h-4" />,        label: 'School',  drillType: 'school', addLabel: 'Add School'  },
    school: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: <CalendarDays className="w-4 h-4" />,  label: 'Event',   drillType: 'event',  addLabel: 'Add Event'   },
    event:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  icon: <GraduationCap className="w-4 h-4" />, label: 'Class',   drillType: 'class',  addLabel: 'Add Class'   },
    class:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: <Users className="w-4 h-4" />,          label: 'Student', drillType: null,     addLabel: 'Add Student' },
  };
  const cfg = levelCfg[current.type];

  const addAction = () => {
    if (current.type === 'root')   return handleAddSchool();
    if (current.type === 'school') return handleAddEvent();
    if (current.type === 'event')  return handleAddClass();
    if (current.type === 'class')  return handleAddStudent();
  };

  const getRowActions = (row) => {
    if (current.type === 'root')   return [
      { label: 'Export', icon: <Download className="w-3.5 h-3.5" />, fn: (e) => handleExport(row, e) },
      { label: 'Rename', icon: <Pencil className="w-3.5 h-3.5" />,   fn: (e) => handleEditSchool(row, e) },
      { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />,   fn: (e) => handleDeleteSchool(row, e), danger: true },
    ];
    if (current.type === 'school') return [
      { label: 'Rename', icon: <Pencil className="w-3.5 h-3.5" />, fn: (e) => handleEditEvent(row, e) },
      { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, fn: (e) => handleDeleteEvent(row, e), danger: true },
    ];
    if (current.type === 'event')  return [
      { label: 'Rename', icon: <Pencil className="w-3.5 h-3.5" />, fn: (e) => handleEditClass(row, e) },
      { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, fn: (e) => handleDeleteClass(row, e), danger: true },
    ];
    return [];
  };

  const avatarColor = (name = '') => {
    const colors = ['#6366f1','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#14b8a6'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };
  const initials = (name = '') => name.slice(0, 1).toUpperCase();

  // ─── Pagination ─────────────────────────────────────────────────────────
  const PgBtn = ({ children, onClick, disabled, active }) => (
    <button
      onClick={onClick} disabled={disabled}
      className="min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
      style={{
        background: active ? '#6366f1' : 'transparent',
        color: active ? '#fff' : disabled ? '#d1d5db' : '#6b7280',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid ' + (active ? '#6366f1' : 'transparent'),
      }}
      onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; } }}
      onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
    >{children}</button>
  );

  const Pagination = ({ total, current: pg, onChange }) => {
    if (total <= 1) return null;
    const pages = [];
    let start = Math.max(1, pg - 2), end = Math.min(total, pg + 2);
    if (end - start < 4) { start = Math.max(1, end - 4); end = Math.min(total, start + 4); }
    for (let i = start; i <= end; i++) pages.push(i);
    return (
      <div className="flex items-center gap-0.5">
        <PgBtn onClick={() => onChange(pg - 1)} disabled={pg === 1}><ChevronLeft className="w-3.5 h-3.5" /></PgBtn>
        {start > 1 && <><PgBtn onClick={() => onChange(1)}>1</PgBtn>{start > 2 && <span className="px-1 text-xs" style={{ color: '#9ca3af' }}>…</span>}</>}
        {pages.map(p => <PgBtn key={p} onClick={() => onChange(p)} active={p === pg}>{p}</PgBtn>)}
        {end < total && <>{end < total - 1 && <span className="px-1 text-xs" style={{ color: '#9ca3af' }}>…</span>}<PgBtn onClick={() => onChange(total)}>{total}</PgBtn></>}
        <PgBtn onClick={() => onChange(pg + 1)} disabled={pg === total}><ChevronRight className="w-3.5 h-3.5" /></PgBtn>
      </div>
    );
  };

  // ─── Upload Modal ────────────────────────────────────────────────────────
  const UploadModal = ({ isOpen, onClose, url, callback, accept, title, multiple, paramName, demoType }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [parsedHeaders, setParsedHeaders] = useState([]);

    useEffect(() => {
      if (files.length === 1 && files[0].name.endsWith('.csv')) {
        Papa.parse(files[0], {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.meta && results.meta.fields) {
               setParsedHeaders(results.meta.fields);
            }
            setParsedData(results.data);
            setShowPreview(true);
          }
        });
      } else {
        setParsedData([]);
        setParsedHeaders([]);
      }
    }, [files]);

    if (!isOpen) return null;

    const csvContent = demoType ? DEMO_CSV[demoType] : null;

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type !== 'dragleave'); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handle(e.dataTransfer.files); };
    const handle = (sel) => { const arr = Array.from(sel); setFiles(multiple ? p => [...p, ...arr] : [arr[0]]); };

    const handleSubmit = async () => {
      if (!files.length) return;
      const fd = new FormData();
      if (multiple) files.forEach(f => fd.append(paramName, f)); else fd.append(paramName, files[0]);
      setIsUploading(true);
      try {
        const res = await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const d = res.data?.data || {};
        const isBulk = d.addedClasses !== undefined;
        let htmlMsg = `<div class="text-sm text-left space-y-2 mt-2" style="color: #475569;">`;
        if (isBulk) {
           htmlMsg += `<p><strong>Classes Added:</strong> ${d.addedClasses || 0}</p>`;
           htmlMsg += `<p><strong>Students Added/Updated:</strong> ${d.addedStudents || 0}</p>`;
        } else if (d.added !== undefined) {
           htmlMsg += `<p><strong>Students Processed:</strong> ${d.added || 0}</p>`;
        } else if (d.matched !== undefined) {
           htmlMsg += `<p><strong>Images Matched:</strong> ${d.matched || 0}</p>`;
           htmlMsg += `<p><strong>Unmatched:</strong> ${d.unmatched || 0}</p>`;
        }
        
        let errorsCount = d.errors || 0;
        if (errorsCount > 0) {
           htmlMsg += `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-top: 16px; border-radius: 4px;">`;
           htmlMsg += `<p style="color: #b91c1c; font-weight: bold; margin: 0;">⚠️ Rows skipped: ${errorsCount}</p>`;
           htmlMsg += `<p style="color: #ef4444; font-size: 11px; margin-top: 4px;">Missing required fields (ID, First Name, Last Name).</p>`;
           htmlMsg += `</div>`;
        } else if (d.errors !== undefined || d.matched !== undefined) {
           htmlMsg += `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; margin-top: 16px; border-radius: 4px;">`;
           htmlMsg += `<p style="color: #047857; font-weight: bold; margin: 0;">✅ Uploaded perfectly with no errors!</p>`;
           htmlMsg += `</div>`;
        }
        htmlMsg += `</div>`;

        Swal.fire({ title: 'Upload Results', html: htmlMsg, icon: errorsCount > 0 ? 'warning' : 'success' });
        if (callback) callback(); onClose(); setFiles([]);
      } catch (err) { Swal.fire('Error', err.response?.data?.message || 'Upload failed', 'error'); }
      finally { setIsUploading(false); }
    };

    const csvRows = csvContent ? csvContent.trim().split('\n') : [];
    const csvHeaders = csvRows[0]?.split(',') || [];
    const csvData = csvRows.slice(1).map(r => r.split(','));

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: '640px', border: '1px solid #e5e7eb' }}>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <UploadCloud className="w-4.5 h-4.5" style={{ color: '#6366f1' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#111827' }}>{title}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                  {accept === '.csv' ? 'Upload a CSV file to import data in bulk' : 'Upload images to match with students'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: '#9ca3af' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">

            {/* Demo CSV section */}
            {demoType && csvContent && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  style={{ background: '#f9fafb', borderBottom: showPreview ? '1px solid #e5e7eb' : 'none' }}
                  onClick={() => setShowPreview(v => !v)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: '#6366f1' }} />
                    <span className="text-xs font-semibold" style={{ color: '#374151' }}>
                      Sample CSV Template
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                      {csvRows.length - 1} rows
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadDemoCSV(demoType); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: '#6366f1', color: '#fff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <ChevronRight
                      className="w-4 h-4 transition-transform"
                      style={{ color: '#9ca3af', transform: showPreview ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </div>

                {showPreview && (
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-[#f9fafb]">
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                          {csvHeaders.map((h, i) => (
                            <th key={i} className="px-4 py-2 font-semibold uppercase tracking-wider" style={{ color: '#9ca3af', fontSize: '10px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, i) => (
                          <tr key={i} style={{ borderBottom: i < csvData.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: cell ? '#374151' : '#d1d5db' }}>
                                {cell || <span style={{ color: '#d1d5db' }}>—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Actual Uploaded CSV Preview Section */}
            {parsedData.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #10b981' }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(16,185,129,0.05)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: '#10b981' }} />
                    <span className="text-xs font-semibold" style={{ color: '#047857' }}>
                      Ready to Upload Preview
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: '#047857' }}>
                      {parsedData.length} valid rows
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-white shadow-sm">
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                        {parsedHeaders.map((h, i) => (
                          <th key={`ph-${i}`} className="px-4 py-2 font-semibold uppercase tracking-wider" style={{ color: '#047857', fontSize: '10px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 50).map((row, i) => (
                        <tr key={`pr-${i}`} style={{ borderBottom: i < Math.min(parsedData.length, 50) - 1 ? '1px solid #f9fafb' : 'none' }}>
                          {parsedHeaders.map((h, j) => {
                            const val = row[h];
                            const isMissing = !val || !val.trim();
                            // Required fields roughly check: containing id, name
                            const isRequired = h.toLowerCase().includes('id') || h.toLowerCase().includes('name') || h.toLowerCase() === 'class';
                            return (
                               <td key={`pc-${j}`} className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: isMissing ? (isRequired ? '#ef4444' : '#d1d5db') : '#374151' }}>
                                 {val || (isRequired ? <span className="text-red-500 font-bold">MISSING</span> : <span style={{ color: '#d1d5db' }}>—</span>)}
                               </td>
                            );
                          })}
                        </tr>
                      ))}
                      {parsedData.length > 50 && (
                        <tr>
                          <td colSpan={parsedHeaders.length} className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#10b981', background: 'rgba(16,185,129,0.02)' }}>
                            + {parsedData.length - 50} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Drop zone */}
            <div
              className="relative rounded-xl transition-all"
              style={{
                border: `2px dashed ${dragActive ? '#6366f1' : '#e5e7eb'}`,
                background: dragActive ? 'rgba(99,102,241,0.04)' : '#fafafa',
                padding: '32px 24px',
                textAlign: 'center',
              }}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input
                type="file" multiple={multiple} accept={accept}
                onChange={e => { if (e.target.files?.[0]) handle(e.target.files); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: dragActive ? 'rgba(99,102,241,0.12)' : '#f3f4f6' }}
              >
                <UploadCloud className="w-6 h-6" style={{ color: dragActive ? '#6366f1' : '#9ca3af' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                {dragActive ? 'Drop to upload' : 'Drag & drop files here'}
              </p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>or click anywhere to browse</p>
              {accept && (
                <span className="inline-block mt-3 text-[10.5px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                  Accepts: {accept}
                </span>
              )}
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
                    </div>
                    <span className="text-xs font-medium truncate flex-1" style={{ color: '#374151' }}>{f.name}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: '#9ca3af' }}>
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="w-5 h-5 flex items-center justify-center rounded-md transition-colors flex-shrink-0"
                      style={{ color: '#d1d5db' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                : 'No file selected'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors"
                style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!files.length || isUploading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#6366f1', color: '#fff' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#4f46e5'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                {isUploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Stat badge ─────────────────────────────────────────────────────────
  const CountBadge = ({ icon, count, color, bg, label }) => (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: bg, color }}>
      {icon}{count} {label}
    </span>
  );

  // ─── Table column widths (fixed, consistent) ────────────────────────────
  // Name col = auto, count cols = 140px each, actions col = 140px
  const COL_W = '140px';

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ background: '#f3f4f6' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .ep * { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.18s ease; }
        .drill-row { transition: background 0.1s; cursor: pointer; }
        .drill-row:hover { background: rgba(99,102,241,0.03) !important; }
        .drill-row:hover .row-name { color: #6366f1 !important; }
        .drill-row:hover .drill-arrow { color: #6366f1 !important; opacity: 1 !important; }
        .plain-row { transition: background 0.1s; }
        .plain-row:hover { background: #fafafa !important; }
        .act-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; transition:all 0.1s; color:#9ca3af; border: 1px solid transparent; flex-shrink:0; }
        .act-btn:hover { background:#f3f4f6; color:#374151; border-color:#e5e7eb; }
        .act-btn.del:hover { background:#fef2f2; color:#ef4444; border-color:#fee2e2; }
        td, th { vertical-align: middle; }
      `}</style>

      <UploadModal
        {...uploadModal}
        onClose={() => setUploadModal({ isOpen: false, url: '', callback: null, accept: '', title: '', multiple: false, paramName: 'file', demoType: null })}
      />

      <div className="ep flex flex-col gap-5">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Events / Schools</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Manage schools, photo events and class rosters</p>
          </div>
          <button
            onClick={addAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: '#6366f1', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
          >
            <Plus className="w-4 h-4" /> {cfg.addLabel}
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Schools', val: stats.schools,  icon: <School className="w-4.5 h-4.5" />,        color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
            { label: 'Total Events',  val: stats.events,   icon: <CalendarDays className="w-4.5 h-4.5" />,  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
            { label: 'Total Classes', val: stats.classes,  icon: <GraduationCap className="w-4.5 h-4.5" />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          ].map(({ label, val, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-bold leading-tight" style={{ color: '#111827' }}>{val}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>

          {/* Card toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 gap-3 flex-wrap" style={{ borderBottom: '1px solid #f3f4f6' }}>

            {/* Left: back + title */}
            <div className="flex items-center gap-3 min-w-0">
              {navStack.length > 1 && (
                <button
                  onClick={() => goTo(navStack.length - 2)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
                  style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="min-w-0">
                {navStack.length > 1 && (
                  <div className="flex items-center gap-1 flex-wrap mb-0.5">
                    <button onClick={() => goTo(0)} className="text-[11px] font-medium transition-colors" style={{ color: '#9ca3af' }} onMouseEnter={e => e.currentTarget.style.color = '#6366f1'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                      <Home className="w-3 h-3 inline mr-0.5 -mt-px" />Schools
                    </button>
                    {navStack.slice(1, -1).map((crumb, i) => (
                      <span key={crumb.id} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: '#d1d5db' }} />
                        <button onClick={() => goTo(i + 1)} className="text-[11px] font-medium max-w-[120px] truncate transition-colors" style={{ color: '#9ca3af' }} onMouseEnter={e => e.currentTarget.style.color = '#6366f1'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{crumb.name}</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: '#111827' }}>{current.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                    {activeList.length} {isClass ? 'students' : `${cfg.label.toLowerCase()}s`}
                  </span>
                </div>
                {ctx && <p className="text-[11px] mt-0.5 truncate" style={{ color: '#9ca3af' }}>{ctx.schoolName}{ctx.eventName ? ` · ${ctx.eventName}` : ''}</p>}
              </div>
            </div>

            {/* Right: search + import buttons */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#9ca3af' }} />
                <input
                  className="pl-9 pr-3 py-2 rounded-xl text-xs font-medium w-44 outline-none transition-all"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  placeholder="Search…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              {current.type === 'event' && (
                <button
                  onClick={() => handleFileUpload(`/events/events/${current.id}/upload-classes-students`, fetchData, 'Bulk Import Classes & Students', 'bulk')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#f9fafb'; }}
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Import CSV
                </button>
              )}
              {current.type === 'class' && (
                <>
                  <button
                    onClick={() => handleFileUpload(`/events/classes/${current.id}/upload-students`, () => fetchStudents(current.id), 'Import Students via CSV', 'students')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#f9fafb'; }}
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Import CSV
                  </button>
                  <button
                    onClick={handleImageUpload}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#f9fafb'; }}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Import Images
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-x-auto fade-up" key={`${current.id}-${current.type}-${page}`}>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d1d5db' }} /></div>
            ) : isClass ? (
              /* Students table */
              loadingStudents ? (
                <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d1d5db' }} /></div>
              ) : (
                <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col />
                    <col style={{ width: COL_W }} />
                    <col style={{ width: COL_W }} />
                    <col style={{ width: COL_W }} />
                    <col style={{ width: COL_W }} />
                    <col style={{ width: COL_W }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                      <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Student</th>
                      <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Student ID</th>
                      <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Parent Email</th>
                      <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Date of Birth</th>
                      <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Access Code</th>
                      <th className="py-3 px-5 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.length === 0 ? (
                      <tr><td colSpan={6}><EmptyRow icon={<Users className="w-6 h-6" />} text="No students yet" /></td></tr>
                    ) : paginatedList.map(st => (
                      <tr key={st._id} className="plain-row" style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {st.uploadedImage
                              ? <img src={st.uploadedImage} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ border: '2px solid #e5e7eb' }} />
                              : <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: avatarColor(st.firstName) }}>{initials(st.firstName)}</div>
                            }
                            <span className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{st.firstName} {st.lastName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>{st.studentId}</span>
                        </td>
                        <td className="py-3.5 px-5 text-sm truncate" style={{ color: st.parentEmail ? '#374151' : '#d1d5db' }}>
                          {st.parentEmail || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-sm truncate" style={{ color: st.dob ? '#374151' : '#d1d5db' }}>
                          {st.dob ? new Date(st.dob).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-block text-[11px] font-mono font-bold px-2.5 py-1 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}>
                            {st.uniqueCode || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="act-btn" onClick={() => handleEditStudent(st)} title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                            <button className="act-btn del" onClick={() => handleDeleteStudent(st)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              /* Drill-down table */
              (() => {
                const showEventsCol  = current.type === 'root';
                const showClassesCol = current.type === 'root' || current.type === 'school';
                const showStudentCol = current.type === 'school' || current.type === 'event';
                const colCount = 1 + [showEventsCol, showClassesCol, showStudentCol].filter(Boolean).length + 1;

                return (
                  <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col />
                      {showEventsCol  && <col style={{ width: COL_W }} />}
                      {showClassesCol && <col style={{ width: COL_W }} />}
                      {showStudentCol && <col style={{ width: COL_W }} />}
                      <col style={{ width: COL_W }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                        <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>{cfg.label}</th>
                        {showEventsCol  && <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Events</th>}
                        {showClassesCol && <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Classes</th>}
                        {showStudentCol && <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Students</th>}
                        <th className="py-3 px-5 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedList.length === 0 ? (
                        <tr><td colSpan={colCount}><EmptyRow icon={cfg.icon} text={`No ${cfg.label.toLowerCase()}s yet`} /></td></tr>
                      ) : paginatedList.map(row => {
                        const eventsCount  = row.events?.length ?? 0;
                        const classesCount = current.type === 'root'
                          ? row.events?.reduce((a, e) => a + (e.classes?.length || 0), 0) ?? 0
                          : row.classes?.length ?? 0;
                        const studentCount = current.type === 'school'
                          ? row.classes?.reduce((a, c) => a + (c.studentCount || 0), 0) ?? 0
                          : row.studentCount ?? 0;
                        const actions = getRowActions(row);

                        return (
                          <tr
                            key={row._id}
                            className="drill-row"
                            style={{ borderBottom: '1px solid #f9fafb' }}
                            onClick={() => pushNav({ type: cfg.drillType, id: row._id, name: row.name })}
                          >
                            {/* Name */}
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: avatarColor(row.name) }}>
                                  {initials(row.name)}
                                </div>
                                <span className="row-name text-sm font-semibold truncate transition-colors" style={{ color: '#111827' }}>{row.name}</span>
                              </div>
                            </td>

                            {/* Events count (root only) */}
                            {showEventsCol && (
                              <td className="py-3.5 px-5">
                                <CountBadge
                                  icon={<CalendarDays className="w-3 h-3" />}
                                  count={eventsCount} label="events"
                                  color="#3b82f6" bg="rgba(59,130,246,0.08)"
                                />
                              </td>
                            )}

                            {/* Classes count */}
                            {showClassesCol && (
                              <td className="py-3.5 px-5">
                                <CountBadge
                                  icon={<GraduationCap className="w-3 h-3" />}
                                  count={classesCount} label="classes"
                                  color="#8b5cf6" bg="rgba(139,92,246,0.08)"
                                />
                              </td>
                            )}

                            {/* Students count */}
                            {showStudentCol && (
                              <td className="py-3.5 px-5">
                                <CountBadge
                                  icon={<Users className="w-3 h-3" />}
                                  count={studentCount} label="students"
                                  color="#10b981" bg="rgba(16,185,129,0.08)"
                                />
                              </td>
                            )}

                            {/* Actions */}
                            <td className="py-3.5 px-5" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {actions.map((act, i) => (
                                  <button key={i} className={`act-btn ${act.danger ? 'del' : ''}`} onClick={act.fn} title={act.label}>
                                    {act.icon}
                                  </button>
                                ))}
                                <ChevronRight className="drill-arrow w-4 h-4 ml-1 flex-shrink-0 transition-colors" style={{ color: '#d1d5db', opacity: 0.6 }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()
            )}
          </div>

          {/* ── Footer / Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2" style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              {activeList.length > PAGE_SIZE
                ? <>Showing <span className="font-semibold" style={{ color: '#374151' }}>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, activeList.length)}</span> of <span className="font-semibold" style={{ color: '#374151' }}>{activeList.length}</span></>
                : <><span className="font-semibold" style={{ color: '#374151' }}>{activeList.length}</span> {isClass ? 'student' : cfg.label.toLowerCase()}{activeList.length !== 1 ? 's' : ''} total</>
              }
            </p>
            <Pagination total={totalPages} current={safePage} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyRow({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f3f4f6', color: '#d1d5db' }}>{icon}</div>
      <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>{text}</p>
    </div>
  );
}