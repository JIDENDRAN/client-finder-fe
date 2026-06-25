import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { API_URL } from '../config';

export default function Database() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScraped();
  }, []);

  const fetchScraped = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/scraped`);
      setBusinesses(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpoken = async (id, currentVal) => {
    try {
      const res = await axios.put(`${API_URL}/api/scraped/${id}`, {
        spokenToClient: !currentVal
      });
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, spokenToClient: res.data.spokenToClient } : b));
    } catch (err) {
      alert('Failed to update spoken status: ' + err.message);
    }
  };

  const exportCSV = () => {
    if (businesses.length === 0) return;
    const header = ['Name', 'Phone', 'Rating', 'Reviews', 'Address', 'Website', 'Source', 'Spoken to Client', 'Scraped At'];
    const rows = businesses.map(b => [
      `"${b.name || ''}"`,
      `"${b.phone || ''}"`,
      b.rating || 0,
      b.reviewsCount || 0,
      `"${b.address || ''}"`,
      `"${b.website || ''}"`,
      `"${b.source || ''}"`,
      b.spokenToClient ? 'Yes' : 'No',
      `"${new Date(b.scrapedAt).toLocaleString()}"`
    ]);
    
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scraped_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (businesses.length === 0) return;
    const doc = new jsPDF();
    doc.text('Scraped Leads Database', 14, 15);
    
    const tableColumn = ["Name", "Phone", "Rating", "Reviews", "Website", "Spoken to Client"];
    const tableRows = [];

    businesses.forEach(b => {
      const rowData = [
        b.name,
        b.phone || 'N/A',
        b.rating?.toString() || 'N/A',
        b.reviewsCount?.toString() || '0',
        b.website || 'N/A',
        b.spokenToClient ? 'Yes' : 'No'
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`scraped_leads_${Date.now()}.pdf`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Scraped Business Database</h2>
          <p className="text-sm text-gray-500 mt-1">
            Permanent record of all businesses you have discovered.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            disabled={businesses.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-icons text-sm">table_view</span>
            Export to Excel
          </button>
          <button 
            onClick={exportPDF}
            disabled={businesses.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-icons text-sm">picture_as_pdf</span>
            Export to PDF
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <span className="material-icons text-4xl mb-2 text-gray-400">search_off</span>
            <p>No businesses found in history. Run a search in the Lead Scanner to populate your database!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Spoken to Client</th>
                  <th className="px-4 py-3">Discovered At</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3">
                      {b.phone ? (
                        <span className="text-blue-600 font-medium">{b.phone}</span>
                      ) : (
                        <span className="text-gray-400 italic">No Phone Listed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="material-icons text-xs">star</span>
                        <span className="text-gray-800 font-medium">{b.rating}</span>
                        <span className="text-gray-400 text-xs">({b.reviewsCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{b.website || <span className="text-gray-400">-</span>}</td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!b.spokenToClient}
                          onChange={() => toggleSpoken(b.id, b.spokenToClient)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <span className="ml-2 text-xs font-medium text-gray-700">
                          {b.spokenToClient ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(b.scrapedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
