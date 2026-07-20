'use client';

import React, { useState } from 'react';

export default function PublicForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    serviceRequested: 'Technical Support',
    message: '',
  });
  
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      // Send data to our backend API route
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response failed');
      }

      setStatus({ type: 'success', message: 'Your request has been submitted successfully.' });
      
      // Reset the form values
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        serviceRequested: 'Technical Support', 
        message: '' 
      });

      // Clear the message banner after 3 seconds
      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
      }, 3000);

    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.' 
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 text-zinc-700 font-sans tracking-tight">
      <div className="w-full max-w-md bg-white p-6 rounded-lg border border-zinc-300 shadow-sm space-y-4">
        <div className="text-center pb-2 border-b border-zinc-200">
          <h1 className="text-lg font-bold text-zinc-900">Customer Request Portal</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Please fill out the details below to submit your inquiry.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">First Name</label>
              <input 
                type="text" required className="w-full p-2 bg-zinc-50/50 border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">Last Name</label>
              <input 
                type="text" required className="w-full p-2 bg-zinc-50/50 border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Email Address</label>
            <input 
              type="email" required className="w-full p-2 bg-zinc-50/50 border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Service Needed</label>
            <select 
              className="w-full p-2 bg-white border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 cursor-pointer"
              value={formData.serviceRequested} onChange={e => setFormData({...formData, serviceRequested: e.target.value})}
            >
              <option value="Technical Support">Technical Support</option>
              <option value="E-commerce Consulting">E-commerce Consulting</option>
              <option value="System Automation">System Automation</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Message Details</label>
            <textarea 
              rows={4} className="w-full p-2 bg-zinc-50/50 border border-zinc-300 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-500 resize-none"
              value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Describe your request..."
            />
          </div>

          <button 
            type="submit" disabled={status.type === 'loading'}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white p-2.5 rounded-md text-xs font-semibold disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors cursor-pointer"
          >
            {status.type === 'loading' ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        {status.type === 'success' && (
          <div className="p-2 text-center rounded bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
            {status.message}
          </div>
        )}

        {status.type === 'error' && (
          <div className="p-2 text-center rounded bg-rose-50 text-rose-800 text-[11px] font-medium border border-rose-200">
            {status.message}
          </div>
        )}
      </div>
    </main>
  );
}