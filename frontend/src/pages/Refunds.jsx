import React, { useState } from 'react';
import { RefreshCcw, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Refunds = () => {
  const { inventory, refundCard } = useApp();
  const [formData, setFormData] = useState({
    cardId: '',
    reason: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation: Check if card exists
    const card = inventory.find(c => c.id === formData.cardId);

    if (!card) {
      setError(`Card ID '${formData.cardId}' not found in system.`);
      return;
    }

    // Validation: Check status
    if (card.status !== 'ACTIVE') {
      setError(`Card '${formData.cardId}' is ${card.status}. Cannot process refund.`);
      return;
    }

    // Process Refund via AppContext
    const result = await refundCard(formData.cardId);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({ cardId: '', reason: '' });
    } else {
      setError('Failed to process refund. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Process Refund</h2>
        <p className="text-gray-500">Issue tokens back to a user's card manually.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center space-x-2 animate-fade-in">
          <Check size={20} />
          <span>Refund processed successfully! Tokens added to card.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card ID</label>
          <input 
            type="text" 
            required
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Scan or enter card ID (e.g. CARD-8832)"
            value={formData.cardId}
            onChange={(e) => {
              setFormData({...formData, cardId: e.target.value});
              setError(''); // Clear error on typing
            }}
          />
          {error && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle size={14} className="mr-1"/> {error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Refund</label>
          <textarea 
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none"
            placeholder="e.g. Machine malfunction, accidental double tap..."
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center space-x-2"
          >
            <RefreshCcw size={20} />
            <span>Process Refund</span>
          </button>
        </div>
      </form>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start space-x-3">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-semibold text-amber-800">Important Note</h4>
          <p className="text-sm text-amber-700 mt-1">
            All refunds are logged and subject to audit. Refunds over 500 tokens require Manager approval code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Refunds;
