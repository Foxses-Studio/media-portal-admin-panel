import React, { useEffect, useState } from 'react';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';
import { MessagesSquare, Plus, Send, X } from 'lucide-react';

export default function SupportSystem({ studentId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  
  const axios = useAxios();

  useEffect(() => {
    if (studentId) {
      fetchTickets();
    }
  }, [studentId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/tickets/student/${studentId}`);
      if (res.data.success) setTickets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;
    try {
      setSubmitting(true);
      const res = await axios.post('/tickets', {
        studentId,
        subject: newTicketSubject,
        message: newTicketMessage
      });
      if (res.data.success) {
        setTickets([res.data.data, ...tickets]);
        setIsCreatingTicket(false);
        setNewTicketSubject('');
        setNewTicketMessage('');
        Swal.fire({ icon: 'success', title: 'Ticket Created', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;
    try {
      setSubmitting(true);
      const res = await axios.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyText
      });
      if (res.data.success) {
        const updatedTicket = res.data.data;
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setReplyText('');
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to send reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (ticket) => {
    try {
      const newStatus = ticket.status === 'Open' ? 'Closed' : 'Open';
      const res = await axios.patch(`/tickets/${ticket._id}/status`, { status: newStatus });
      if (res.data.success) {
        const updatedTicket = res.data.data;
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        if (selectedTicket && selectedTicket._id === updatedTicket._id) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <MessagesSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Support Tickets</h3>
            <p className="text-xs text-slate-500 font-medium">Manage parent communication</p>
          </div>
        </div>
        
        <button 
          onClick={() => { setIsCreatingTicket(true); setSelectedTicket(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Ticket List */}
        <div className="w-full md:w-1/3 flex flex-col gap-3">
          {loading ? (
            <div className="text-sm text-slate-400 py-10 text-center flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-sm text-slate-400 py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No tickets recorded for this student.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {tickets.map(t => (
                <button 
                  key={t._id} 
                  onClick={() => { setSelectedTicket(t); setIsCreatingTicket(false); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTicket?._id === t._id 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      t.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{t.subject}</h4>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {t.messages[t.messages.length - 1]?.message || 'No messages'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="w-full md:w-2/3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
          {isCreatingTicket ? (
            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col h-full bg-white relative">
              <button type="button" onClick={() => setIsCreatingTicket(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
              <h4 className="text-lg font-bold text-slate-800 mb-6">Create New Ticket</h4>
              
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Subject</label>
                  <input 
                    type="text" 
                    required 
                    value={newTicketSubject}
                    onChange={e => setNewTicketSubject(e.target.value)}
                    placeholder="Ticket subject..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Message Details</label>
                  <textarea 
                    required 
                    value={newTicketMessage}
                    onChange={e => setNewTicketMessage(e.target.value)}
                    placeholder="Enter message details here..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          ) : selectedTicket ? (
            <div className="flex flex-col h-full bg-white">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h4 className="font-bold text-slate-800">{selectedTicket.subject}</h4>
                  <p className="text-xs text-slate-500">Ticket ID: {selectedTicket._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleStatus(selectedTicket)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                  >
                    Mark as {selectedTicket.status === 'Open' ? 'Closed' : 'Open'}
                  </button>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    selectedTicket.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[400px] bg-slate-50 custom-scrollbar">
                {selectedTicket.messages.map((msg, i) => {
                  const isAdmin = msg.sender?.role !== 'parent';
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm border ${
                        isAdmin ? 'bg-blue-600 text-white border-blue-700 rounded-tr-sm' : 'bg-white text-slate-800 border-slate-200 rounded-tl-sm'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold ${isAdmin ? 'text-blue-100' : 'text-slate-500'}`}>
                            {isAdmin ? 'Admin' : 'Parent'}
                          </span>
                          <span className={`text-[9px] ${isAdmin ? 'text-blue-300' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedTicket.status === 'Open' ? (
                <form onSubmit={handleReplyTicket} className="p-4 bg-white border-t border-slate-200 flex gap-3">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center justify-center transition-all shrink-0"
                  >
                    <Send className="w-5 h-5 -ml-0.5" />
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This ticket is closed</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-transparent">
              <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <MessagesSquare className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-700">Select a Ticket</h4>
              <p className="text-sm text-slate-500 max-w-xs mt-2">
                Click on an existing ticket from the list to view its conversation.
              </p>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
