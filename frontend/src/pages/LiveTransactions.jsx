import React, { useState } from 'react';
import { Activity, ArrowDownLeft, ArrowUpRight, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LiveTransactions = () => {
  const { transactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.cardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.terminal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Live Transactions</h2>
          <p className="text-gray-500">Real-time feed of all card activities.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Card ID..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none flex items-center space-x-2 px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="CREDIT">Credits Only</option>
              <option value="DEBIT">Debits Only</option>
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Card ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Terminal / Game</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{txn.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{txn.cardId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{txn.terminal}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center space-x-1 font-medium ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'CREDIT' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      <span>{Math.abs(txn.amount)} Tokens</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      txn.status === 'SUCCESS' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveTransactions;
