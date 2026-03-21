'use client';

import { useState } from 'react';
import { 
  Search, User, Mail, School, CalendarDays, 
  MapPin, Loader2, Image as ImageIcon, Download, 
  ChevronLeft, ArrowRight, BookOpen
} from 'lucide-react';
import useAxios from '@/hooks/useAxios';

export default function StudentPortal() {
  const axios = useAxios();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSelectedStudent(null);
    setHasSearched(true);

    try {
      const res = await axios.get(`/events/students/search?q=${encodeURIComponent(query)}`);
      if (res.data?.success) {
        setResults(res.data.data);
        // If exactly one result, open it automatically
        if (res.data.data.length === 1) {
          setSelectedStudent(res.data.data[0]);
        }
      } else {
        setResults([]);
        setError(res.data?.message || 'No results found.');
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setError(err.response?.data?.message || 'Failed to search for student. Try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* --- Premium Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24 min-h-screen flex flex-col">
        
        {/* --- Header / Search Section --- */}
        <div className={`transition-all duration-700 ease-in-out ${hasSearched ? 'mb-12' : 'flex-1 flex flex-col justify-center mb-0'}`}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-widest uppercase text-indigo-300">Student Portal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-indigo-300 tracking-tight leading-tight mb-4 drop-shadow-sm">
              Discover Your Details
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Access your documents and high-resolution images instantly. Search by your Name, Student ID, or Parent Email.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl transition-all duration-300 hover:border-indigo-500/50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20">
              <div className="pl-4">
                <Search className="w-6 h-6 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 1001, John Doe, or parent@email.com"
                className="w-full bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 px-4 py-4 md:text-lg font-medium"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 md:px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Search</span>}
              </button>
            </div>
          </form>
        </div>

        {/* --- Content Area --- */}
        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out flex-1">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-400 font-medium">Searching our secure database...</p>
              </div>
            ) : error ? (
              <div className="max-w-2xl mx-auto bg-red-950/30 border border-red-900/50 backdrop-blur-md rounded-2xl p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800/50">
                  <User className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-200 mb-2">No Records Found</h3>
                <p className="text-red-400/80">{error}</p>
                <button 
                  onClick={() => {setQuery(''); setHasSearched(false);}}
                  className="mt-6 px-6 py-2 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-sm font-medium border border-slate-700/50 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : results.length > 0 && !selectedStudent ? (
              /* --- List View --- */
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full block"></span>
                    Search Results
                  </h2>
                  <span className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                    Found {results.length} student{results.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((student) => (
                    <div 
                      key={student._id} 
                      onClick={() => setSelectedStudent(student)}
                      className="group cursor-pointer bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {student.uploadedImage ? (
                              <img src={student.uploadedImage} alt={student.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-indigo-400" />
                            )}
                          </div>
                          <span className="bg-slate-800/80 text-xs font-mono font-semibold px-2.5 py-1 rounded-md text-slate-300 border border-slate-700/50 shrink-0">
                            ID: {student.studentId}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-indigo-300 transition-colors">
                          {student.firstName} {student.lastName}
                        </h3>
                        {student.parentEmail && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{student.parentEmail}</span>
                          </div>
                        )}
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/50">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <School className="w-4 h-4 text-indigo-400" />
                            <span className="truncate">{student.school?.name || 'Unknown School'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span className="truncate">{student.eventClass?.name || 'Unknown Class'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-400">
                          <span>View Full Profile</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedStudent ? (
              /* --- Detailed Profile View --- */
              <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
                {results.length > 1 && (
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors group"
                  >
                    <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Results
                  </button>
                )}
                
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-2xl relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
                    
                    {/* Left: Image / Showcase */}
                    <div className="lg:col-span-5 bg-slate-950/50 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="w-full max-w-[280px] aspect-[4/5] rounded-2xl bg-slate-800/50 border-2 border-slate-700/50 relative group overflow-hidden shadow-2xl">
                        {selectedStudent.uploadedImage ? (
                          <>
                            <img 
                              src={selectedStudent.uploadedImage} 
                              alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                              <button 
                                onClick={() => handleDownload(selectedStudent.uploadedImage, `${selectedStudent.studentId}_${selectedStudent.firstName}.jpg`)}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-white/20 transition-colors"
                              >
                                <Download className="w-4 h-4" /> Download Original
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3 bg-slate-900/50">
                            <ImageIcon className="w-16 h-16 opacity-50" />
                            <span className="text-sm font-medium">No Image Uploaded</span>
                          </div>
                        )}
                        
                        {/* ID Badge overlay */}
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-lg shadow-lg">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Student ID</p>
                          <p className="text-sm font-mono font-bold text-white">{selectedStudent.studentId}</p>
                        </div>
                      </div>
                      
                      {selectedStudent.imageMatched && (
                        <div className="mt-6 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-full max-w-[280px]">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Verified Match</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Data / Details */}
                    <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                      <div className="mb-8">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                          <User className="w-3.5 h-3.5" /> Identity Profile
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </h2>
                        {selectedStudent.parentEmail && (
                          <p className="text-slate-400 flex items-center gap-2 font-medium">
                            <Mail className="w-4 h-4 opacity-70" /> {selectedStudent.parentEmail}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* School Info Block */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                              <School className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Institution</h4>
                          </div>
                          <p className="text-lg font-bold text-slate-200 mt-1 pl-11">
                            {selectedStudent.school?.name || 'Not Assigned'}
                          </p>
                        </div>

                        {/* Class Info Block */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Class Group</h4>
                          </div>
                          <p className="text-lg font-bold text-slate-200 mt-1 pl-11">
                            {selectedStudent.eventClass?.name || 'Not Enrolled'}
                          </p>
                        </div>
                        
                        {/* Event Info Block (Span 2 cols on md) */}
                        <div className="md:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                              <CalendarDays className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Captured Event</h4>
                          </div>
                          <p className="text-lg font-bold text-slate-200 mt-1 pl-11">
                            {selectedStudent.event?.name ? `${selectedStudent.event.name} Photo Session` : 'No Event Linked'}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions / Info */}
                      <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Profile fetched securely from Media Portal
                        </p>
                        
                        {selectedStudent.uploadedImage && (
                          <a 
                            href={selectedStudent.uploadedImage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                          >
                            Open Image in New Tab <ArrowRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            
          </div>
        )}
      </div>
    </div>
  );
}
