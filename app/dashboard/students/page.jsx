'use client';

import useAxios from '@/hooks/useAxios';
import {
    AlertCircle,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Download,
    Image as ImageIcon,
    Loader2,
    Mail,
    Search,
    Star, Trash2,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import SupportSystem from './SupportSystem';

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
  const [studentRecords, setStudentRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedEventFilter, setSelectedEventFilter] = useState('');

  // Fetch all records for the selected student
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentRecords(selectedStudent.studentId);
    } else {
      setStudentRecords([]);
      setSelectedEventFilter('');
    }
  }, [selectedStudent]);

  const fetchStudentRecords = async (studentId) => {
    setLoadingRecords(true);
    try {
      const res = await axios.get(`/events/students/${studentId}/all-records`);
      if (res.data?.success) {
        setStudentRecords(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const markBestImage = async (recordId) => {
    try {
       const res = await axios.put(`/events/students/${recordId}/best-image`);
       if (res.data?.success) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Marked as Best Image',
            showConfirmButton: false,
            timer: 2000
          });
          setStudentRecords(prev => prev.map(rec => ({
            ...rec,
            isBestImage: rec._id === recordId
          })));
       }
    } catch (err) {
        Swal.fire('Error', 'Failed to update best image', 'error');
    }
  };

  const deleteImage = async (studentId, cloudflareId, imageId) => {
    const confirm = await Swal.fire({
      title: 'Delete Image?',
      text: 'This action cannot be undone. The image will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`/events/students/${studentId}/images/${cloudflareId}`);
      if (res.data?.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Image deleted',
          showConfirmButton: false,
          timer: 2000
        });
        // Refresh student records
        fetchStudentRecords(selectedStudent.studentId);
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to delete image', 'error');
    }
  };

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

  if (selectedStudent) {
    return (
      <div className="space-y-6 w-full animate-in fade-in duration-200">
         {/* Profile Card */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div 
                   className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                   style={{ background: avatarColor(selectedStudent.firstName) }}
                 >
                   {initials(selectedStudent.firstName)}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900">
                     {selectedStudent.firstName} {selectedStudent.lastName}
                   </h2>
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm text-slate-600">
                     <span className="flex items-center gap-1.5 font-medium">
                       <User className="w-4 h-4 text-slate-400"/> {selectedStudent.studentId}
                     </span>
                     {selectedStudent.parentEmail && (
                       <>
                         <span className="hidden sm:inline text-slate-300">•</span>
                         <span className="flex items-center gap-1.5 font-medium">
                           <Mail className="w-4 h-4 text-slate-400"/> {selectedStudent.parentEmail}
                         </span>
                       </>
                     )}
                     {selectedStudent.dob && (
                       <>
                         <span className="hidden sm:inline text-slate-300">•</span>
                         <span className="flex items-center gap-1.5 font-medium">
                           <CalendarDays className="w-4 h-4 text-slate-400"/> {new Date(selectedStudent.dob).toLocaleDateString()}
                         </span>
                       </>
                     )}
                   </div>
                   {selectedStudent.uniqueCode && (
                     <div className="mt-3">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-widest" style={{ background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}>
                         ACCESS CODE: {selectedStudent.uniqueCode}
                       </span>
                     </div>
                   )}
                 </div>
              </div>

              {/* Filter */}
              <div className="w-full md:w-auto">
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Filter by Event</label>
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="w-full min-w-[200px] border border-slate-300 bg-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer text-slate-700"
                >
                  <option value="">All Events</option>
                  {Array.from(new Set(studentRecords.map(r => r.event?.name))).filter(Boolean).map(eventName => (
                    <option key={eventName} value={eventName}>{eventName}</option>
                  ))}
                </select>
              </div>
            </div>
         </div>

         {/* Gallery Container */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gallery</h3>
                <p className="text-sm text-slate-500 mt-0.5">All images associated with this student across events.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                 {studentRecords.reduce((acc, rec) => {
                   const primaryCount = rec.uploadedImage ? 1 : 0;
                   const additionalCount = rec.images ? rec.images.filter(img => img.url !== rec.uploadedImage).length : 0;
                   return acc + primaryCount + additionalCount;
                 }, 0)} Photos
              </span>
            </div>

            {/* Gallery Grid */}
            {loadingRecords ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-slate-500">Loading gallery...</p>
              </div>
            ) : studentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-xl border border-slate-100">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-800">No media found</p>
                <p className="text-xs text-slate-500 mt-1">No images have been linked for this student yet.</p>
              </div>
            ) : (
              (() => {
                // Flatten all images from all records, including images array
                const allImages = [];
                studentRecords
                  .filter(rec => !selectedEventFilter || rec.event?.name === selectedEventFilter)
                  .forEach(rec => {
                    // Add primary image (uploadedImage)
                    if (rec.uploadedImage) {
                      allImages.push({
                        id: rec._id,
                        url: rec.uploadedImage,
                        cloudflareId: rec.cloudflareId,
                        filename: `${rec.studentId}.jpg`,
                        event: rec.event,
                        eventClass: rec.eventClass,
                        isBestImage: rec.isBestImage,
                        imageMatched: rec.imageMatched,
                        studentId: rec.studentId,
                        isPrimary: true,
                        recordId: rec._id
                      });
                    }
                    // Add additional images from images array
                    if (rec.images && rec.images.length > 0) {
                      rec.images.forEach((img, idx) => {
                        // Skip if already added as primary (same URL)
                        if (img.url !== rec.uploadedImage) {
                          allImages.push({
                            id: `${rec._id}_img_${idx}`,
                            url: img.url,
                            cloudflareId: img.cloudflareId,
                            filename: img.filename || `${rec.studentId}_${idx + 1}.jpg`,
                            event: rec.event,
                            eventClass: rec.eventClass,
                            isBestImage: false,
                            imageMatched: true,
                            studentId: rec.studentId,
                            isPrimary: false,
                            parentRecordId: rec._id,
                            recordId: rec._id
                          });
                        }
                      });
                    }
                  });

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {allImages.map((img) => (
                      <div key={img.id} className={`flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden ${img.isBestImage ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                          <div className="w-full aspect-[4/5] bg-slate-100 relative group">
                            <>
                              <img src={img.url} className="w-full h-full object-cover" alt="Student" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 <button 
                                   onClick={() => handleDownload(img.url, `${img.studentId}_${img.event?.name || 'photo'}.jpg`)}
                                   className="bg-white text-slate-900 text-xs font-semibold px-4 py-2 rounded shadow-sm hover:bg-slate-50 flex items-center gap-1.5"
                                 >
                                   <Download className="w-3.5 h-3.5" /> Download
                                 </button>
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     deleteImage(img.recordId, img.cloudflareId, img.id);
                                   }}
                                   className="bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded shadow-sm hover:bg-red-600 flex items-center gap-1.5"
                                 >
                                   <Trash2 className="w-3.5 h-3.5" /> Delete
                                 </button>
                              </div>
                            </>
                            {img.isBestImage && (
                              <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" /> BEST
                              </div>
                            )}
                            {img.imageMatched && !img.isBestImage && (
                              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                                MATCHED
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col gap-1 border-t border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase">Event</p>
                                <p className="text-sm font-semibold text-slate-800 line-clamp-1" title={img.event?.name}>{img.event?.name || 'Unassigned'}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1 mb-2">Class: {img.eventClass?.name || 'Unassigned'}</p>
                            <p className="text-[10px] text-slate-400">{img.filename}</p>
                            
                            {img.isPrimary && !img.isBestImage && (
                              <button
                                onClick={() => markBestImage(img.id)}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 py-1 text-left w-full mt-auto border-t border-slate-50 pt-2"
                              >
                                Set as Best
                              </button>
                            )}
                          </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
         </div>

         {/* Support Tickets Section */}
         <SupportSystem studentId={selectedStudent._id} />

      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
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
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student ID</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">School</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Class</th>
                    <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Access Code</th>
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
                        <span className="inline-block text-[11px] font-mono font-bold px-2.5 py-1 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}>
                          {st.uniqueCode || '—'}
                        </span>
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


    </div>
  );
}
