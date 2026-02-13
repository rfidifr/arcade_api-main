import React, { useState } from 'react';
import { AlertOctagon, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Logs = () => {
  const { logs } = useApp();
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
          <p className="text-gray-500">Technical logs for debugging and auditing.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ALL' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('ERROR')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ERROR' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Errors
          </button>
          <button 
            onClick={() => setFilter('WARNING')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'WARNING' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            Warnings
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden font-mono text-sm">
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-gray-400">
          <span>Console Output</span>
          <span className="text-xs">Live Stream</span>
        </div>
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No logs found for this filter.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 border-b border-slate-800 pb-2 last:border-0">
                <span className="text-gray-500 shrink-0 w-24">{log.time}</span>
                <div className="shrink-0">
                  {log.type === 'ERROR' && <AlertOctagon size={16} className="text-red-500" />}
                  {log.type === 'WARNING' && <AlertTriangle size={16} className="text-amber-500" />}
                  {log.type === 'INFO' && <Info size={16} className="text-blue-500" />}
                  {log.type === 'SUCCESS' && <CheckCircle size={16} className="text-green-500" />}
                </div>
                <div className="flex-1">
                  <span className={`font-bold mr-2 ${
                    log.type === 'ERROR' ? 'text-red-400' : 
                    log.type === 'WARNING' ? 'text-amber-400' : 
                    log.type === 'SUCCESS' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>
                    [{log.type}]
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
                <span className="text-gray-600 px-2 py-0.5 bg-slate-800 rounded text-xs">
                  {log.source}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
