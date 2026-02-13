import React, { useState, useEffect } from 'react';
import { X, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ReplaceCardModal = ({ oldCard, onClose }) => {
  const { replaceCard, inventory } = useApp();
  const [newCardId, setNewCardId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newCardId.trim()) {
      setError('Please enter the New Card ID');
      return;
    }

    if (newCardId === oldCard.id) {
        setError('New Card ID must be different from Old Card ID');
        return;
    }

    const result = replaceCard(oldCard.id, newCardId);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  if (!oldCard) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <ShieldCheck className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold">Lost Card Replacement</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {success ? (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Replacement Successful!</h3>
                <p className="text-gray-600">
                    Balance transferred and old card blocked.
                </p>
            </div>
        ) : (
            <div className="p-6 space-y-6">
            {/* Old Card Info */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Old Card (Lost)</p>
                    <p className="text-xl font-mono font-bold text-gray-900">{oldCard.id}</p>
                    <p className="text-sm text-gray-600">{oldCard.issuedTo}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase">Balance to Transfer</p>
                    <p className="text-2xl font-bold text-green-600">{oldCard.balance}</p>
                </div>
            </div>

            <div className="flex justify-center text-gray-400">
                <ArrowRight size={24} className="animate-pulse" />
            </div>

            {/* New Card Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Card ID</label>
                <input 
                    type="text" 
                    value={newCardId}
                    onChange={(e) => setNewCardId(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg font-mono"
                    placeholder="Scan New Card..."
                    autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                    Enter the ID of the new blank card to assign.
                </p>
                </div>

                {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
                )}

                <div className="pt-2">
                <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center space-x-2"
                >
                    <span>Transfer Balance & Replace</span>
                </button>
                </div>
            </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReplaceCardModal;
