'use client';

import { useState, useEffect, useRef } from 'react';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';
import {
  MessagesSquare, Send, Search, RefreshCw, User, Clock,
  ChevronDown, CheckCircle2, AlertCircle, X, Plus, Filter
} from 'lucide-react';

const STATUS_COLORS = {
  Open:   { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400' },
  Closed: { bg: 'bg-slate-100',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400' },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const messagesEndRef = useRef(null);
  const axios = useAxios();

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    let list = tickets;
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.subject?.toLowerCase().includes(q) ||
        t.student?.firstName?.toLowerCase().includes(q) ||
        t.student?.lastName?.toLowerCase().includes(q) ||
        t.student?.studentId?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [tickets, search, statusFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
        if (selected) {
          const refreshed = res.data.data.find(t => t._id === selected._id);
          if (refreshed) setSelected(refreshed);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;
    try {
      setSending(true);
      const res = await axios.post(`/tickets/${selected._id}/reply`, { message: replyText });
      if (res.data.success) {
        const updated = res.data.data;
        setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
        setSelected(updated);
        setReplyText('');
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to send reply', 'error');
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async (ticket) => {
    const newStatus = ticket.status === 'Open' ? 'Closed' : 'Open';
    try {
      const res = await axios.patch(`/tickets/${ticket._id}/status`, { status: newStatus });
      if (res.data.success) {
        const updated = res.data.data;
        setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
        setSelected(updated);
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const openCount = tickets.filter(t => t.status === 'Open').length;

  return (
    <div className="flex flex-col h-full -m-8 bg-slate-50">

      {/* ── Page Header ── */}
      <div className="px-8 py-5 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/25">
            <MessagesSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
            <p className="text-xs text-slate-500 font-medium">
              {openCount} open · {tickets.length} total
            </p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Ticket List ── */}
        <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

          {/* Search + Filter */}
          <div className="p-3 space-y-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400  pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets or student…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="flex gap-1.5">
              {['All', 'Open', 'Closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === s
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-sm text-slate-400">Loading tickets…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                <MessagesSquare className="w-8 h-8 opacity-50" />
                <p className="text-sm">No tickets found</p>
              </div>
            ) : filtered.map(t => {
              const sc = STATUS_COLORS[t.status] || STATUS_COLORS.Open;
              const isActive = selected?._id === t._id;
              const lastMsg = t.messages?.[t.messages.length - 1];
              return (
                <button
                  key={t._id}
                  onClick={() => setSelected(t)}
                  className={`w-full text-left px-4 py-4 border-b border-slate-100 transition-all ${
                    isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-800 line-clamp-1 flex-1">{t.subject}</span>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    {t.student?.firstName} {t.student?.lastName}
                    <span className="text-slate-400 font-normal ml-1">({t.student?.studentId})</span>
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {lastMsg?.message || 'No messages yet'}
                  </p>
                  <p className="text-[10px] text-slate-300 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {t.messages.length} {t.messages.length === 1 ? 'message' : 'messages'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Conversation View ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Ticket Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 truncate">{selected.subject}</h2>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {selected.student?.firstName} {selected.student?.lastName}
                      <span className="font-mono text-slate-400">({selected.student?.studentId})</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span>Ticket #{selected._id.slice(-6).toUpperCase()}</span>
                    <span className="text-slate-300">·</span>
                    <span>{selected.messages.length} messages</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleStatus(selected)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selected.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {selected.status === 'Open'
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Close Ticket</>
                      : <><AlertCircle className="w-3.5 h-3.5" /> Reopen Ticket</>
                    }
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
                {selected.messages.map((msg, i) => {
                  const isAdmin = msg.sender?.role !== 'parent';
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 mt-1 shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <div className={`max-w-[72%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isAdmin
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <span className={`text-[10px] font-bold ${isAdmin ? 'text-indigo-500' : 'text-slate-400'}`}>
                            {isAdmin ? (msg.sender?.name || 'Admin') : 'Parent'}
                          </span>
                          <span className="text-[10px] text-slate-300">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ml-3 mt-1 shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              {selected.status === 'Open' ? (
                <form onSubmit={handleReply} className="px-6 py-4 bg-white border-t border-slate-200 flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); }
                    }}
                    placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl flex items-center justify-center shrink-0 transition-all shadow-md shadow-indigo-600/20"
                  >
                    {sending
                      ? <RefreshCw className="w-5 h-5 animate-spin" />
                      : <Send className="w-5 h-5" />
                    }
                  </button>
                </form>
              ) : (
                <div className="px-6 py-4 bg-white border-t border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    This ticket is closed · Reopen to reply
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10 bg-slate-50">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
                <MessagesSquare className="w-10 h-10 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Select a ticket</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-1">
                  Choose a support ticket from the left panel to view the full conversation and reply.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
