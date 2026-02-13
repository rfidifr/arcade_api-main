import React from 'react';
import { useApp } from '../context/AppContext';

const ManagerLogs = () => {
  const { logs } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Logs & Audit Trail</h2>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          Total Events: {logs.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No logs available.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action / Message</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Operator</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-sm text-gray-500">{log.time}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${
                      log.type === 'ERROR' ? 'bg-red-100 text-red-600' :
                      log.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                      log.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800 font-medium">{log.message}</td>
                  <td className="px-6 py-3">
                    {log.operator ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {log.operator}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{log.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerLogs;
