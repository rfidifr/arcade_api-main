import React from 'react';
import { X, Clock, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const CardHistoryModal = ({ card, logs, onClose }) => {
  if (!card) return null;

  // Filter logs for this card
  // We look for the card ID in the message string, as our logs are text-based.
  // Ideally, logs should have a metadata field 'entityId', but text search is what we have for now.
  const cardLogs = logs.filter(log => 
    log.message.includes(card.id) || 
    (log.source === 'Inventory' && log.message.includes(card.id)) ||
    (log.source === 'Refunds' && log.message.includes(card.id))
  );

  const getIcon = (type) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'ERROR': return <X size={16} className="text-red-500" />;
      case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-indigo-600" />
              Card Activity History
            </h3>
            <p className="text-sm text-gray-500 font-mono mt-1">{card.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Card Details Summary */}
        <div className="p-6 bg-white border-b border-gray-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Issued To</p>
            <p className="font-semibold text-gray-900">{card.issuedTo || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Balance</p>
            <p className="font-semibold text-gray-900">{card.balance} Tokens</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {card.status}
            </span>
          </div>
          <div>
            <p className="text-gray-500">Last Used</p>
            <p className="font-semibold text-gray-900">{card.lastUsed}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {cardLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>No activity recorded for this card yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cardLogs.map((log) => (
                <div key={log.id} className="relative flex gap-4">
                  {/* Line */}
                  <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-200 last:hidden"></div>
                  
                  {/* Icon */}
                  <div className={`relative z-10 w-10 h-10 rounded-full border-4 border-gray-50 flex items-center justify-center bg-white shadow-sm`}>
                    {getIcon(log.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{log.source}</span>
                      <span className="text-xs text-gray-400">{log.time}</span>
                    </div>
                    <p className="text-gray-800 text-sm">{log.message}</p>
                    {log.operator && (
                      <p className="text-xs text-indigo-500 mt-2 font-medium">
                        by {log.operator}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CardHistoryModal;
