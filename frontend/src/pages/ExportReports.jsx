import React, { useState } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';

const ExportReports = () => {
  const [reportType, setReportType] = useState('transactions');

  const handleDownload = () => {
    // Mock CSV Data Generation
    const headers = ['Date', 'Transaction ID', 'Type', 'Amount', 'Status'];
    const rows = [
      ['2023-10-01', 'TX-1001', 'DEBIT', '50', 'SUCCESS'],
      ['2023-10-01', 'TX-1002', 'CREDIT', '500', 'SUCCESS'],
      ['2023-10-02', 'TX-1003', 'DEBIT', '25', 'SUCCESS'],
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Data Export & Reporting</h2>
        <p className="text-gray-500">Generate and download CSV/PDF reports.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Generate Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="transactions">Transaction History</option>
                <option value="inventory">Card Inventory Status</option>
                <option value="revenue">Revenue Summary</option>
                <option value="audit">Operator Audit Logs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
                <Calendar size={18} />
                <span>Last 30 Days</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="format" className="text-blue-600" defaultChecked />
                  <span>CSV (Excel)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="format" className="text-blue-600" />
                  <span>PDF Document</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-center items-center text-center">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4 text-blue-600">
              <FileText size={32} />
            </div>
            <h4 className="font-semibold text-blue-900">Ready to Export</h4>
            <p className="text-sm text-blue-700 mt-2 mb-6">
              This will generate a detailed report of <strong>{reportType}</strong> for the selected period.
            </p>
            <button 
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full justify-center"
            >
              <Download size={20} />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;
