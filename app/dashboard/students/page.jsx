'use client';

import { useState, useEffect } from 'react';
import { 
  Search, User, Mail, School, CalendarDays, 
  BookOpen, Loader2, Image as ImageIcon, Download, 
  X, AlertCircle, ChevronRight, ChevronLeft, MapPin
} from 'lucide-react';
import useAxios from '@/hooks/useAxios';

const PAGE_SIZE = 10;

export default function GlobalStudentSearch() {
  const axios = useAxios();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);

  // For Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch all initially
  useEffect(() => {
    fetchStudents('');
  }, []);

  const fetchStudents = async (searchQuery) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get(`/events/students/search?q=${encodeURIComponent(searchQuery || '')}`);
      if (res.data?.success) {
        setResults(res.data.data);
      } else {
        setResults([]);
        setError(res.data?.message || 'No results found.');
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      const status = err.response?.status;
      if (status === 404) {
        setError('Student search API not available yet. Please deploy the latest backend to Render.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch students. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchStudents(query);
  };

  const handleDownload = async (imageUrl, fileName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(imageUrl, '_blank');
    }
  };

  const avatarColor = (name = '') => {
    const colors = ['#6366f1','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#14b8a6'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  const initials = (name = '') => name.slice(0, 1).toUpperCase();

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedResults = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const Pagination = ({ currentPage, total, onChange }) => {
    if (total <= 1) return null;

    const pages = [];
    let start = Math.max(1, currentPage - 2), end = Math.min(total, currentPage + 2);
    if (end - start < 4) { start = Math.max(1, end - 4); end = Math.min(total, start + 4); }
    for (let i = start; i <= end; i++) pages.push(i);

    const Btn = ({ children, onClick, disabled, active }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
          active 
            ? 'bg-blue-600 text-white shadow-sm border border-blue-600' 
            : disabled 
              ? 'text-slate-300 cursor-not-allowed border border-transparent' 
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-transparent'
        }`}
      >
        {children}
      </button>
    );

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-700">{results.length > 0 ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * PAGE_SIZE, results.length)}</span> of <span className="font-bold text-slate-700">{results.length}</span> students
        </p>
        <div className="flex items-center gap-1">
          <Btn onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="w-3.5 h-3.5" /></Btn>
          {start > 1 && <><Btn onClick={() => onChange(1)}>1</Btn>{start > 2 && <span className="px-1 text-xs text-slate-300">…</span>}</>}
          {pages.map(p => <Btn key={p} onClick={() => onChange(p)} active={p === currentPage}>{p}</Btn>)}
          {end < total && <>{end < total - 1 && <span className="px-1 text-xs text-slate-300">…</span>}<Btn onClick={() => onChange(total)}>{total}</Btn></>}
          <Btn onClick={() => onChange(currentPage + 1)} disabled={currentPage === total}><ChevronRight className="w-3.5 h-3.5" /></Btn>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <style>{`
        .act-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; transition:all 0.1s; color:#9ca3af; border: 1px solid transparent; flex-shrink:0; cursor: pointer; }
        .act-btn:hover { background:#f3f4f6; color:#374151; border-color:#e5e7eb; }
        .plain-row { transition: background 0.1s; cursor: pointer; }
        .plain-row:hover { background: #fafafa !important; }
      `}</style>
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl px-7 py-5 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Global Student Search</h2>
          <p className="text-sm text-slate-400 mt-0.5">Search and view student profiles globally.</p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSearch} className="px-6 py-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Optional: live search feature could be added here if desired.
              }}
              placeholder="Search by Student ID, Name, or Parent Email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
          
          {/* Reset Button */}
          {query && (
             <button
              type="button"
              onClick={() => { setQuery(''); setPage(1); fetchStudents(''); }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
             >
               Reset
             </button>
          )}
        </form>
      </div>

      {/* ── Results Area ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Student Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing records for matched students</p>
          </div>
          {results.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              {results.length} Total Students
            </span>
          )}
        </div>

        <div className="overflow-x-auto min-h-[300px]">
           {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-slate-500">Loading records...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Records Found</h3>
                <p className="text-xs text-slate-500">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-2">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Students Matched</h3>
                <p className="text-xs text-slate-500">Try searching with a different criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '180px' }} />
                  <col style={{ width: '180px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student ID</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">School</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Class</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Photo</th>
                    <th className="py-3 px-5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedResults.map((st) => (
                    <tr 
                      key={st._id} 
                      className="plain-row border-b border-slate-50 last:border-0"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {st.uploadedImage
                            ? <img src={st.uploadedImage} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200" />
                            : <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm" style={{ background: avatarColor(st.firstName) }}>{initials(st.firstName)}</div>
                          }
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-slate-800">{st.firstName} {st.lastName}</p>
                            {st.parentEmail && <p className="text-xs text-slate-500 truncate mt-0.5">{st.parentEmail}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-block text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">{st.studentId}</span>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-slate-600 truncate">
                        {st.school?.name || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-slate-600 truncate">
                        {st.eventClass?.name || '—'}
                      </td>
                      <td className="py-3.5 px-5">
                        {st.uploadedImage ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                            <ImageIcon className="w-3 h-3" /> MATCHED
                          </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                             NO PHOTO
                           </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex justify-end">
                          <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
        
        {/* Pagination Controls */}
        {!loading && !error && results.length > 0 && (
          <Pagination currentPage={page} total={totalPages} onChange={setPage} />
        )}

      </div>

      {/* ── Student Profile Modal ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Student Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">ID: {selectedStudent.studentId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Photo Section */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                  <div className="w-full aspect-[4/5] rounded-2xl bg-slate-50 border-2 border-slate-100 overflow-hidden relative shadow-sm">
                     {selectedStudent.uploadedImage ? (
                        <img 
                          src={selectedStudent.uploadedImage} 
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                          <ImageIcon className="w-12 h-12 opacity-30" />
                          <span className="text-xs font-semibold">No Photo Linked</span>
                        </div>
                      )}
                  </div>
                  {selectedStudent.uploadedImage && (
                    <button 
                      onClick={() => handleDownload(selectedStudent.uploadedImage, `${selectedStudent.studentId}_${selectedStudent.firstName}.jpg`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl text-center shadow-sm transition-colors active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4 text-slate-500" /> Download Photo
                    </button>
                  )}
                  {selectedStudent.imageMatched && (
                    <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Cloudflare Matched</span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col">
                   <div className="mb-6 pb-6 border-b border-slate-100">
                      <h2 className="text-3xl font-bold text-slate-900 mb-1">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h2>
                      {selectedStudent.parentEmail && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 font-medium">
                          <Mail className="w-4 h-4" /> {selectedStudent.parentEmail}
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* School */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <School className="w-4 h-4 text-blue-500" />
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">School / Institution</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mt-1 pl-6">
                          {selectedStudent.school?.name || 'Unassigned'}
                        </p>
                      </div>

                      {/* Class */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Class / Grade</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mt-1 pl-6">
                          {selectedStudent.eventClass?.name || 'Unassigned'}
                        </p>
                      </div>

                      {/* Event */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarDays className="w-4 h-4 text-amber-500" />
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Associated Event</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mt-1 pl-6">
                          {selectedStudent.event?.name || 'No Event Linked'}
                        </p>
                      </div>
                   </div>

                   {/* Footer Metadata */}
                   <div className="mt-auto pt-8 flex items-center justify-between">
                     <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                       <MapPin className="w-3.5 h-3.5" /> Media Portal Database
                     </p>
                     <p className="text-[11px] font-medium text-slate-400">
                       Created: {new Date(selectedStudent.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
