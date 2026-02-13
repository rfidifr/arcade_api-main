import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const UndoToast = () => {
  const { undoData, performUndo } = useApp();
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (undoData) {
      setTimeLeft(20);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [undoData]);

  if (!undoData) return null;

  const getMessage = () => {
    switch (undoData.type) {
      case 'DELETE_CARD': return `Card ${undoData.restoreData.id} deleted`;
      case 'BLOCK_CARD': return `Card ${undoData.restoreData.id} status changed`;
      case 'REFUND_CARD': return `Refund processed for ${undoData.restoreData.id}`;
      default: return 'Action completed';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center space-x-4 border border-slate-700 max-w-sm w-full">
        <div className="flex-1">
          <p className="font-medium text-sm">{getMessage()}</p>
          <p className="text-xs text-slate-400 mt-1">Undo available for {timeLeft}s</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={performUndo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Undo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoToast;
