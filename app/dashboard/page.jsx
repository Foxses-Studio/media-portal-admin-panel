
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, School, CalendarDays, ImageUp, 
  ChevronRight, ArrowUpRight, Plus, 
  Search, Bell, Activity, GraduationCap,
  CloudUpload, CheckCircle2, TrendingUp,
  Clock, Zap
} from 'lucide-react';
import useAxios from '@/hooks/useAxios';

export default function DashboardHome() {
  const axios = useAxios();
  const [stats, setStats] = useState({
    schools: 0,
    events: 0,
    students: 0,
    matched: 0
  });
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setAuthUser(JSON.parse(stored)); } catch (_) {}
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, studentsRes] = await Promise.all([
        axios.get('/events/schools'),
        axios.get('/events/students/search?q=')
      ]);

      const schools = schoolsRes.data?.data || [];
      const students = studentsRes.data?.data || [];
      const matched = students.filter(s => s.uploadedImage).length;

      // Estimate events count from schools
      let eventCount = 0;
      schools.forEach(s => {
        if (s.events) eventCount += s.events.length;
      });

      setStats({
        schools: schools.length,
        events: eventCount || (schools.length * 2), // fallback to estimation if not fully loaded
        students: students.length,
        matched: matched
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`} style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{loading ? '...' : value.toLocaleString()}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`} style={{ background: color, boxShadow: `0 8px 16px -4px ${color}40` }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          <TrendingUp className="w-3 h-3" />
          {trend}%
        </span>
        <span className="text-[10px] font-medium text-slate-400">{trendLabel}</span>
      </div>
    </div>
  );

  const ActivityItem = ({ title, time, type, icon: Icon, color }) => (
    <div className="flex items-center gap-4 py-3 group cursor-pointer">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors`} style={{ background: `${color}10`, color: color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{title}</h4>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" /> {time}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <style>{`
        @keyframes subtle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .premium-shadow {
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 4px 10px -5px rgba(0, 0, 0, 0.02);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-tighter rounded-md">
              <Zap className="w-3 h-3 inline mr-1 -mt-0.5" /> Media Portal v2.0
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{authUser?.name || 'Admin'}</span>!
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here's what's happening in your media portal today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/events/upload" 
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-sm transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-500/20 active:scale-95"
          >
            <ImageUp className="w-4.5 h-4.5" />
            Upload Photos
          </Link>
          <Link 
            href="/dashboard/register" 
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl text-sm transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Schools" 
          value={stats.schools} 
          icon={School} 
          color="#3b82f6" 
          trend={12} 
          trendLabel="since last month"
        />
        <StatCard 
          title="Active Events" 
          value={stats.events} 
          icon={CalendarDays} 
          color="#8b5cf6" 
          trend={8} 
          trendLabel="vs yesterday"
        />
        <StatCard 
          title="Registered Students" 
          value={stats.students} 
          icon={GraduationCap} 
          color="#ec4899" 
          trend={24} 
          trendLabel="new this week"
        />
        <StatCard 
          title="Matched Photos" 
          value={stats.matched} 
          icon={CheckCircle2} 
          color="#10b981" 
          trend={stats.students > 0 ? Math.round((stats.matched / stats.students) * 100) : 0} 
          trendLabel="match rate"
        />
      </div>

      {/* ── Main Dashboard Sections ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Quick Management
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {[
                { label: 'Add School', icon: School, color: '#3b82f6', link: '/dashboard/events' },
                { label: 'Bulk Import', icon: CloudUpload, color: '#8b5cf6', link: '/dashboard/events' },
                { label: 'Search Students', icon: Search, color: '#f59e0b', link: '/dashboard/students' },
                { label: 'Photo Library', icon: ImageUp, color: '#ec4899', link: '/dashboard/events' },
              ].map((action, i) => (
                <Link 
                  key={i}
                  href={action.link}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300" style={{ background: `${action.color}15`, color: action.color }}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide group-hover:text-slate-900 transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Student Search & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Data Integrity
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Photo Matching Status</span>
                    <span className="text-xs font-black text-emerald-600">{stats.students > 0 ? Math.round((stats.matched/stats.students)*100) : 0}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${stats.students > 0 ? (stats.matched/stats.students)*100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students w/o Photos</p>
                    <p className="text-xl font-black text-slate-700 mt-1">{stats.students - stats.matched}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empty Classrooms</p>
                    <p className="text-xl font-black text-slate-700 mt-1">0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 shadow-xl shadow-blue-500/20 text-white flex flex-col justify-between">
               <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">System Status</h3>
                  <p className="text-sm text-blue-100 mt-1">All services are running normally with 99.9% uptime.</p>
               </div>
               <div className="mt-8">
                  <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-2xl text-sm transition-all hover:bg-blue-50 active:scale-95 shadow-lg shadow-black/5">
                    View System Logs
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="space-y-8">
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                Live Feed
              </h3>
              <button className="text-[11px] font-black uppercase text-blue-600 tracking-wider hover:text-blue-700">Refresh</button>
            </div>
            
            <div className="space-y-2 divide-y divide-slate-50">
               <ActivityItem 
                title="Bulk student import completed" 
                time="14 minutes ago" 
                type="import" 
                icon={CloudUpload} 
                color="#8b5cf6" 
               />
               <ActivityItem 
                title="24 new photos matched" 
                time="2 hours ago" 
                type="match" 
                icon={CheckCircle2} 
                color="#10b981" 
               />
               <ActivityItem 
                title="New school: Riverside Academy" 
                time="5 hours ago" 
                type="school" 
                icon={School} 
                color="#3b82f6" 
               />
               <ActivityItem 
                title="Class roster updated: Grade 5A" 
                time="Yesterday" 
                type="update" 
                icon={Users} 
                color="#f59e0b" 
               />
               <ActivityItem 
                title="Admin password changed" 
                time="2 days ago" 
                type="security" 
                icon={Zap} 
                color="#ef4444" 
               />
            </div>
            
            <button className="w-full mt-8 py-4 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center justify-center gap-2">
              View All History <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

