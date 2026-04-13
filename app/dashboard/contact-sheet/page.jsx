'use client';

import useAxios from '@/hooks/useAxios';
import {
  Loader2,
  Printer,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function ContactSheetPage() {
  const axios = useAxios();
  
  const [schools, setSchools] = useState([]);
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch Schools on mount
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoadingSchools(true);
    try {
      const res = await axios.get('/events/schools');
      if (res.data?.success) {
        setSchools(res.data.data);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch schools', 'error');
    } finally {
      setLoadingSchools(false);
    }
  };

  // Fetch Events when School changes
  useEffect(() => {
    if (selectedSchool) {
      fetchEvents(selectedSchool);
      setSelectedEvent('');
      setSelectedClass('');
      setClasses([]);
      setStudents([]);
    } else {
      setEvents([]);
      setClasses([]);
      setStudents([]);
    }
  }, [selectedSchool]);

  const fetchEvents = async (schoolId) => {
    setLoadingEvents(true);
    try {
      const res = await axios.get(`/events/schools/${schoolId}/events`);
      if (res.data?.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch Classes when Event changes
  useEffect(() => {
    if (selectedEvent) {
      fetchClasses(selectedEvent);
      setSelectedClass('');
      setStudents([]);
    } else {
      setClasses([]);
      setStudents([]);
    }
  }, [selectedEvent]);

  const fetchClasses = async (eventId) => {
    setLoadingClasses(true);
    try {
      const res = await axios.get(`/events/events/${eventId}/classes`);
      if (res.data?.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    setLoadingStudents(true);
    try {
      const res = await axios.get(`/events/classes/${selectedClass}/students`);
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch students', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handlePrint = () => {
    if (students.length === 0) {
      Swal.fire('No Students', 'Please fetch students before printing', 'warning');
      return;
    }
    window.print();
  };

  const getQRUrl = (code) => {
    // QR for access code - contains just the code
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`;
  };

  const getParentPortalQRUrl = () => {
    // QR for parent portal URL
    const portalUrl = process.env.NEXT_PUBLIC_PARENT_PORTAL_URL || 'https://botheyesopenphoto.com/studentswebsite';
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(portalUrl)}`;
  };

  const getParentPortalUrl = () => {
    return process.env.NEXT_PUBLIC_PARENT_PORTAL_URL || 'https://botheyesopenphoto.com/studentswebsite';
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-20">
      {/* ── CSS for Print ── */}
      <style>{`
        @media print {
          @page {
            size: 7in 5in;
            margin: 0;
          }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 7in;
            background: white !important;
            display: block !important;
          }
          .print-area > div {
            width: 7in;
            height: 5in;
            margin: 0;
            padding: 0;
          }
          .no-print { display: none !important; }
                
          .print-page {
            width: 7in;
            height: 5in;
            padding: 0.18in;
            box-sizing: border-box;
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
            background: white !important;
            color: black !important;
            font-family: 'Arial', 'Helvetica', sans-serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
      
          /* Header - Company Logo */
          .print-header {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0.1in 0;
            margin-bottom: 0.15in;
            border-bottom: 2px solid #000;
          }
          .company-logo {
            max-height: 0.55in;
            width: auto;
            object-fit: contain;
          }
      
          /* Main Content */
          .print-content {
            display: flex;
            gap: 0.2in;
            flex: 1;
          }
      
          /* Images Section */
          .images-section {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .proof-grid {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 0.08in;
          }
          .proof-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 3px;
            border: 1px solid #ccc;
          }
          .proof-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            font-weight: 800;
            color: #bbb;
            border: 1px dashed #ccc;
            border-radius: 3px;
            text-transform: uppercase;
          }
      
          /* Right Sidebar */
          .sidebar {
            width: 1.5in;
            display: flex;
            flex-direction: column;
            gap: 0.12in;
          }
      
          /* Student Name Box */
          .student-info-box {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 0.1in;
            text-align: center;
          }
          .student-name {
            font-size: 11px;
            font-weight: 800;
            color: #000;
            line-height: 1.2;
          }
          .student-id {
            font-size: 9px;
            font-weight: 700;
            color: #666;
            margin-top: 2px;
          }
      
          /* QR Box - Main access */
          .qr-main-box {
            background: #fff;
            border: 3px solid #000;
            border-radius: 8px;
            overflow: hidden;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .qr-main-header {
            background: #000;
            color: #fff;
            font-size: 10px;
            font-weight: 900;
            padding: 5px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .qr-main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 8px;
          }
          .qr-main-img {
            width: 1.1in;
            height: 1.1in;
          }
          .qr-hint {
            font-size: 7px;
            font-weight: 700;
            color: #333;
            text-align: center;
            margin-top: 4px;
            line-height: 1.3;
          }
      
          /* Bottom Section */
          .print-footer {
            margin-top: 0.12in;
            padding: 0.1in;
            background: #f9f9f9;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 0.12in;
          }
          .footer-qr {
            width: 0.7in;
            flex-shrink: 0;
          }
          .footer-qr-box {
            border: 1px solid #000;
            border-radius: 4px;
            overflow: hidden;
          }
          .footer-qr-header {
            background: #000;
            color: #fff;
            font-size: 6px;
            font-weight: 800;
            padding: 2px 0;
            text-align: center;
            text-transform: uppercase;
          }
          .footer-qr-img {
            width: 0.55in;
            height: 0.55in;
            display: block;
            margin: 3px auto;
          }
          .instructions {
            flex: 1;
          }
          .instructions-text {
            font-size: 8px;
            line-height: 1.4;
            font-weight: 600;
            color: #333;
            margin: 0;
          }
          .website-link {
            font-weight: 800;
            color: #000;
          }
          .highlight {
            background: #fff3cd;
            padding: 1px 3px;
            border-radius: 2px;
          }
      
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
      
      {/* ── Selection Panel (Hidden on Print) ── */}
      <div className="no-print bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Institution</label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select School</option>
                {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={!selectedSchool}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Event</option>
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedEvent}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
             <button
               onClick={fetchStudents}
               disabled={!selectedClass || loadingStudents}
               className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-black rounded-xl text-sm transition-all flex items-center gap-2"
             >
               {loadingStudents ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
               LOAD STUDENTS
             </button>
             <button
               onClick={handlePrint}
               disabled={students.length === 0}
               className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2"
             >
               <Printer className="w-4 h-4" />
               PRINT 5x7 SHEETS
             </button>
          </div>
        </div>
      </div>

      {/* ── Preview (Web) ── */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-8">
        {students.map(st => (
           <div key={st._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              {/* Header - Logo */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-center">
                <img 
                  src="/ContactSheet-Example.jpg" 
                  alt="Both Eyes Open Photography" 
                  className="h-12 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/media_logo.png';
                  }}
                />
              </div>
              
              {/* Main Content */}
              <div className="p-4 flex gap-4">
                {/* Images Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-1.5">
                     {[...Array(8)].map((_, i) => (
                       <div key={i} className="aspect-[3/4] bg-slate-100 rounded overflow-hidden border border-slate-200">
                          {st.uploadedImage ? (
                            <img src={st.uploadedImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-300">PROOF</div>
                          )}
                       </div>
                     ))}
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="w-32 flex flex-col gap-3">
                  {/* Student Info */}
                  <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-200">
                    <p className="text-xs font-bold text-slate-800">{st.firstName} {st.lastName}</p>
                    <p className="text-[10px] text-slate-500">ID: {st.studentId}</p>
                  </div>
                  
                  {/* QR Code */}
                  <div className="border-2 border-slate-900 rounded-lg overflow-hidden flex-1 flex flex-col">
                    <div className="bg-slate-900 text-white text-[10px] font-bold py-1 text-center uppercase">
                      Access Code QR
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-2">
                      <img src={getQRUrl(st.uniqueCode)} alt="QR" className="w-16 h-16" />
                      <p className="text-[8px] text-slate-500 mt-1 text-center">Scan for access code</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="bg-amber-50 border-t border-amber-200 p-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded border border-slate-200 p-1 shrink-0">
                   <img src={getParentPortalQRUrl()} alt="Portal QR" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs text-slate-600">
                  <p className="font-semibold">Visit: <span className="text-blue-600 underline">{getParentPortalUrl()}</span></p>
                  <p className="text-amber-700 font-medium mt-0.5">📌 Side QR = Access Code | This QR = Website</p>
                </div>
              </div>
           </div>
        ))}
      </div>

      {/* ── Print Area (Hidden normally, formatted as 5x7 Proof Sheet) ── */}
      <div className="print-area hidden">
        {students.map((st) => (
          <div key={st._id} className="print-page">
                  
            {/* Header - Company Logo */}
            <div className="print-header">
              <img 
                src="/ContactSheet-Example.jpg" 
                alt="Both Eyes Open Photography" 
                className="company-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/media_logo.png';
                }} 
              />
            </div>
      
            {/* Main Content */}
            <div className="print-content">
              {/* Images Grid */}
              <div className="images-section">
                <div className="proof-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                      {st.uploadedImage ? (
                        <img src={st.uploadedImage} className="proof-img" />
                      ) : (
                        <div className="proof-placeholder">PROOF</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
      
              {/* Right Sidebar */}
              <div className="sidebar">
                {/* Student Info */}
                <div className="student-info-box">
                  <div className="student-name">{st.firstName} {st.lastName}</div>
                  <div className="student-id">ID: {st.studentId}</div>
                </div>
      
                {/* QR Code - Access Code */}
                <div className="qr-main-box">
                  <div className="qr-main-header">Access Code QR</div>
                  <div className="qr-main-content">
                    <img src={getQRUrl(st.uniqueCode)} alt="QR Code" className="qr-main-img" />
                    <div className="qr-hint">
                      Scan for your<br/>access code
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            {/* Footer */}
            <div className="print-footer">
              <div className="footer-qr">
                <div className="footer-qr-box">
                  <div className="footer-qr-header">Visit Site</div>
                  <img src={getParentPortalQRUrl()} alt="Portal QR" className="footer-qr-img" />
                </div>
              </div>
                    
              <div className="instructions">
                <p className="instructions-text">
                  <strong>How to order:</strong> Scan "Access Code QR" (above right) to get your code, then scan "Visit Site" (left) to open website.<br/>
                  Or visit: <span className="website-link">{getParentPortalUrl()}</span> and enter code from QR.<br/>
                  <span className="highlight">Order by DD/MM/YYYY to avoid shipping fees!</span>
                </p>
              </div>
            </div>
      
          </div>
        ))}
      </div>
    </div>
  );
}
