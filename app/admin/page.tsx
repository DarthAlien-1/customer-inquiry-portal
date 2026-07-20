'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceRequested: string;
  message: string;
  status: 'New' | 'In Progress' | 'Completed';
  createdAt: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'In Progress' | 'Completed'>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(true);

  // Helper function to add a timestamped UI log entry
  const addLog = (actionText: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
    setLogs(prev => [{ id: Math.random().toString(), timestamp: timeStr, action: actionText }, ...prev]);
  };

  // 1. Load data grid from database route on page load
  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads');
        if (!response.ok) throw new Error();
        const data = await response.json();
        setLeads(data);
        addLog('Dashboard data grid pulled from database.');
      } catch (error) {
        addLog('Error: Failed to fetch data grid from database.');
      }
    }
    fetchLeads();
  }, []);

  // 2. Update progress status dropdown
  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    const leadToUpdate = leads.find(l => l.id === id);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error();
      
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      addLog(`Updated status for ${leadToUpdate?.firstName} to ${newStatus}`);
    } catch (error) {
      addLog(`Error: Failed to change status for ${leadToUpdate?.firstName}`);
    }
  };

  // 3. Delete a single entry
  const deleteLead = async (id: string) => {
    const leadToDelete = leads.find(l => l.id === id);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      setLeads(leads.filter(lead => lead.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      addLog(`Removed inquiry from ${leadToDelete?.firstName} ${leadToDelete?.lastName}`);
    } catch (error) {
      addLog(`Error: Failed to remove inquiry from ${leadToDelete?.firstName}`);
    }
  };

  // 4. Delete multiple items
  const handleBulkDelete = async () => {
    addLog(`Starting bulk delete for ${selectedIds.length} items...`);
    
    // Process deletions side by side
    const deletePromises = selectedIds.map(async (id) => {
      try {
        const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        if (response.ok) return id;
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(deletePromises);
    const successfullyDeleted = results.filter((id): id is string => id !== null);

    setLeads(leads.filter(lead => !successfullyDeleted.includes(lead.id)));
    addLog(`Bulk deleted ${successfullyDeleted.length} items.`);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortBy === 'name') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    return b.createdAt.localeCompare(a.createdAt);
  });

  const filteredLeads = sortedLeads.filter(lead => {
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    const email = lead.email.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || lead.status === activeTab;
    const matchesService = serviceFilter === 'All' || lead.serviceRequested === serviceFilter;
    return matchesSearch && matchesTab && matchesService;
  });

  const countNew = leads.filter(l => l.status === 'New').length;
  const countInProgress = leads.filter(l => l.status === 'In Progress').length;
  const countCompleted = leads.filter(l => l.status === 'Completed').length;

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-6 md:p-10 text-zinc-700 font-sans tracking-tight">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="pb-4 border-b border-zinc-300 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Internal Management Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Private business portal to track and organize requests.</p>
          </div>
          <button 
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-medium text-xs rounded-md transition-colors shadow-sm cursor-pointer"
          >
            {showStats ? 'Hide Totals' : 'Show Totals'}
          </button>
        </div>

        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-300 p-4 rounded-lg shadow-sm">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">All Inquiries</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5">{leads.length}</div>
            </div>
            <div className="bg-white border border-zinc-300 p-4 rounded-lg shadow-sm border-l-amber-500 border-l-4">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">New</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5">{countNew}</div>
            </div>
            <div className="bg-white border border-zinc-300 p-4 rounded-lg shadow-sm border-l-blue-500 border-l-4">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">In Progress</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5">{countInProgress}</div>
            </div>
            <div className="bg-white border border-zinc-300 p-4 rounded-lg shadow-sm border-l-green-500 border-l-4">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Completed</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5">{countCompleted}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3 bg-white rounded-lg border border-zinc-300 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-300 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 bg-zinc-50/50">
              <div className="flex bg-white p-0.5 rounded-md border border-zinc-300">
                {(['All', 'New', 'In Progress', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                      activeTab === tab ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}
                  className="p-1.5 bg-white border border-zinc-300 rounded-md text-xs text-zinc-600 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Services</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="E-commerce Consulting">E-commerce Consulting</option>
                  <option value="System Automation">System Automation</option>
                </select>

                <select
                  value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                  className="p-1.5 bg-white border border-zinc-300 rounded-md text-xs text-zinc-600 focus:outline-none cursor-pointer"
                >
                  <option value="date">Sort: Newest</option>
                  <option value="name">Sort: Name</option>
                </select>

                <input 
                  type="text" placeholder="Search..."
                  className="p-1.5 px-2.5 bg-white border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none w-full sm:w-[130px]"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                />

                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1.5 text-xs bg-red-50 text-red-600 border border-red-300 rounded-md font-medium cursor-pointer"
                  >
                    Remove Selected ({selectedIds.length})
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100/80">
                    <th className="py-3 px-4 w-10 text-center border-r border-zinc-300">
                      <input 
                        type="checkbox" className="cursor-pointer border-zinc-400"
                        checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-4 border-r border-zinc-300">Customer Details</th>
                    <th className="py-3 px-4 border-r border-zinc-300">Service Category</th>
                    <th className="py-3 px-4 border-r border-zinc-300">Request Details</th>
                    <th className="py-3 px-4 border-r border-zinc-300">Current Progress</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-300 text-xs">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-400 italic bg-zinc-50/30">
                        No customer records available.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3 px-4 text-center border-r border-zinc-300 align-top">
                          <input 
                            type="checkbox" className="cursor-pointer border-zinc-400"
                            checked={selectedIds.includes(lead.id)}
                            onChange={() => toggleSelectOne(lead.id)}
                          />
                        </td>
                        <td className="py-3 px-4 border-r border-zinc-300 align-top">
                          <div className="font-semibold text-zinc-900">{lead.firstName} {lead.lastName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{lead.email}</div>
                        </td>
                        <td className="py-3 px-4 border-r border-zinc-300 align-top">
                          <span className="text-[10px] font-medium text-zinc-700 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
                            {lead.serviceRequested}
                          </span>
                        </td>
                        
                        {/* NEW: Expandable Message Column */}
                        <td className="py-3 px-4 border-r border-zinc-300 align-top max-w-[200px]">
                          <details className="cursor-pointer group">
                            <summary className="truncate text-[11px] font-medium text-zinc-600 hover:text-zinc-900 outline-none list-none">
                              {lead.message || "No additional message provided."}
                            </summary>
                            <p className="mt-2 text-[11px] text-zinc-600 whitespace-pre-wrap p-2 bg-zinc-50 rounded border border-zinc-200">
                              {lead.message}
                            </p>
                          </details>
                        </td>

                        <td className="py-3 px-4 border-r border-zinc-300 align-top">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                            className={`p-1 font-bold text-[10px] border rounded bg-white cursor-pointer focus:outline-none ${
                              lead.status === 'New' ? 'border-amber-300 text-amber-800' :
                              lead.status === 'In Progress' ? 'border-blue-300 text-blue-800' :
                              'border-green-300 text-green-800'
                            }`}
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right align-top">
                          <button 
                            onClick={() => deleteLead(lead.id)}
                            className="text-zinc-400 hover:text-red-600 font-medium transition-colors cursor-pointer border border-zinc-200 hover:border-red-200 bg-zinc-50 hover:bg-red-50 px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-zinc-300 rounded-lg p-4 space-y-3 shadow-sm max-h-[400px] overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Recent Activity Log</h3>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 border-t border-zinc-300 pt-2">
              {logs.map((log) => (
                <div key={log.id} className="text-[11px] leading-relaxed text-zinc-600 flex gap-1.5 items-start">
                  <span className="font-mono text-zinc-400 text-[10px] shrink-0">{log.timestamp}</span>
                  <span className="text-zinc-600">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}