import React, { useState, useEffect } from 'react';
import { RefreshCcw, Search, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ManagerRefund = () => {
  const { inventory: cards, processRefund } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Reset selection when search changes
  useEffect(() => {
    if (!searchTerm) {
      setSelectedCard(null);
      return;
    }
    const found = cards.find(c => c.id.toLowerCase() === searchTerm.toLowerCase());
    if (found) {
      setSelectedCard(found);
      setError('');
    } else {
      setSelectedCard(null);
    }
  }, [searchTerm, cards]);

  const handleRefund = (e) => {
    e.preventDefault();
    if (!selectedCard) {
      setError('Please select a valid card first');
      return;
    }

    const refundAmount = parseInt(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    // Process Refund via AppContext (Adds tokens & supports Undo)
    processRefund(selectedCard.id, refundAmount);
    
    // Log is handled in AppContext, but we can log specific reason here if we extend processRefund or just console
    console.log(`Refund processed: ${refundAmount} tokens to ${selectedCard.id}. Reason: ${reason}`);

    setSuccess(true);
    setAmount('');
    setReason('');
    
    // Auto-hide success message
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Process Refund</h2>
        <p className="text-gray-500">Issue tokens back to a customer's card (e.g., for failed games).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Find Card</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter Card ID (e.g. CARD-1001)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              />
            </div>
            
            {searchTerm && !selectedCard && (
               <p className="text-red-500 text-sm mt-2">Card not found</p>
            )}

            {selectedCard && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-indigo-600 font-bold">CARD FOUND</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    selectedCard.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedCard.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedCard.id}</div>
                <div className="mt-2 text-sm text-gray-600">
                  Current Balance: <span className="font-bold text-gray-900">{selectedCard.balance} Tokens</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start space-x-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-amber-800">Note</h4>
              <p className="text-sm text-amber-700 mt-1">
                This action will ADD tokens to the card. Use this for compensations or error corrections.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Refund Details</h3>
          
          {success ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center space-x-2 mb-4 animate-pulse">
              <Check size={20} />
              <span>Refund processed successfully! Tokens added.</span>
            </div>
          ) : null}

          <form onSubmit={handleRefund} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Refund (Tokens)</label>
              <input 
                type="number" 
                required
                min="1"
                disabled={!selectedCard}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea 
                required
                disabled={!selectedCard}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24 disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="Why is this refund being processed?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button 
              type="submit" 
              disabled={!selectedCard || success}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors ${
                !selectedCard || success
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <RefreshCcw size={20} />
              <span>Process Refund</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerRefund;
