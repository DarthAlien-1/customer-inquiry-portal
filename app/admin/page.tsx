"use client";

import { useEffect, useState } from "react";

// Defines the structure of the database rows coming from Supabase
type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceRequested: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the data from the database when the page loads
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch database records");
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers the specific dynamic route to delete a row
  const handleDelete = async (id: string) => {
    // Adds a safety check so you don't accidentally delete records
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // If successful, instantly remove that row from the screen
        setLeads(leads.filter((lead) => lead.id !== id));
      } else {
        console.error("Failed to delete record");
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // Show a loading screen while Next.js talks to Supabase
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-700">CUSTOMER DETAILS</th>
              <th className="p-4 font-semibold text-gray-700">SERVICE CATEGORY</th>
              <th className="p-4 font-semibold text-gray-700">REQUEST DETAILS</th>
              <th className="p-4 font-semibold text-gray-700">CURRENT PROGRESS</th>
              <th className="p-4 font-semibold text-gray-700">ACTION</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No customer inquiries found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Column 1: Customer Details */}
                  <td className="p-4 align-top">
                    <strong className="block text-gray-900 text-base">
                      {lead.firstName} {lead.lastName}
                    </strong>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </td>
                  
                  {/* Column 2: Service Category */}
                  <td className="p-4 align-top text-gray-700 font-medium">
                    {lead.serviceRequested}
                  </td>
                  
                  {/* Column 3: The Expanding Message Details */}
                  <td className="p-4 align-top max-w-xs">
                    <details className="cursor-pointer group">
                      <summary className="truncate text-gray-700 hover:text-blue-600 outline-none list-none font-medium">
                        {lead.message || "No additional message provided."}
                      </summary>
                      <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap p-3 bg-gray-100 rounded-md border border-gray-200 shadow-inner">
                        {lead.message}
                      </p>
                    </details>
                  </td>

                  {/* Column 4: Status Label */}
                  <td className="p-4 align-top">
                    <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                      {lead.status}
                    </span>
                  </td>
                  
                  {/* Column 5: Delete Action */}
                  <td className="p-4 align-top">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded shadow hover:bg-red-700 active:bg-red-800 transition-colors"
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
  );
}