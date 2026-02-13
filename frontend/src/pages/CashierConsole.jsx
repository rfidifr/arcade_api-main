import React, { useState } from 'react';
import { Search, CreditCard, Ticket, Plus, ShoppingBag, Gift, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CashierConsole = () => {
  const { inventory, updateCard } = useApp();
  const [searchId, setSearchId] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mode, setMode] = useState('RECHARGE'); // RECHARGE or REDEEM

  // Recharge Options
  const RECHARGE_PACKS = [
    { price: 100, credits: 100, bonus: 0 },
    { price: 200, credits: 200, bonus: 20 },
    { price: 500, credits: 500, bonus: 100 },
    { price: 1000, credits: 1000, bonus: 300 },
  ];

  // Mock Prizes
  const PRIZES = [
    { id: 1, name: 'Candy Bar', cost: 50 },
    { id: 2, name: 'Key Chain', cost: 150 },
    { id: 3, name: 'Plush Toy', cost: 500 },
    { id: 4, name: 'Headphones', cost: 2500 },
    { id: 5, name: 'Console', cost: 50000 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const card = inventory.find(c => c.id.toLowerCase() === searchId.toLowerCase());
    if (card) {
      setActiveCard(card);
    } else {
      setActiveCard(null);
      setError('Card not found in system.');
    }
  };

  const handleRecharge = (pack) => {
    if (!activeCard) return;
    const totalCredits = pack.credits + pack.bonus;
    const updatedCard = {
      ...activeCard,
      balance: activeCard.balance + totalCredits,
      lastUsed: 'Just now'
    };
    updateCard(updatedCard);
    setActiveCard(updatedCard);
    setSuccessMsg(`Successfully added ${totalCredits} credits!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRedeem = (prize) => {
    if (!activeCard) return;
    if (activeCard.tickets < prize.cost) {
      setError(`Insufficient tickets for ${prize.name}`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    const updatedCard = {
      ...activeCard,
      tickets: activeCard.tickets - prize.cost,
      lastUsed: 'Just now'
    };
    updateCard(updatedCard);
    setActiveCard(updatedCard);
    setSuccessMsg(`Redeemed ${prize.name}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cashier Console (POS)</h2>
          <p className="text-gray-500">Fast recharge and prize redemption.</p>
        </div>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setMode('RECHARGE')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'RECHARGE' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Recharge
          </button>
          <button 
            onClick={() => setMode('REDEEM')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'REDEEM' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Redeem Prizes
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
              placeholder="Scan or Enter Card ID (e.g. CARD-8832)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Load Card
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {activeCard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Card Info */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Active Card</p>
              <h3 className="text-2xl font-mono font-bold mb-6">{activeCard.id}</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase">Current Balance</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold">{activeCard.balance}</span>
                    <span className="text-sm">tokens</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase">Tickets Won</p>
                  <div className="flex items-baseline space-x-1 text-amber-400">
                    <span className="text-3xl font-bold">{activeCard.tickets || 0}</span>
                    <span className="text-sm">tickets</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">Issued to: {activeCard.issuedTo}</p>
                <p className="text-xs text-slate-400">Status: {activeCard.status}</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2 animate-fade-in">
                <Check size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'RECHARGE' ? (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Plus className="mr-2 text-blue-600" size={20} />
                  Quick Recharge
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {RECHARGE_PACKS.map((pack, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleRecharge(pack)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 text-lg">₹{pack.price}</span>
                        {pack.bonus > 0 && (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            +{pack.bonus} FREE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 group-hover:text-blue-600">
                        Get {pack.credits + pack.bonus} Tokens
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Gift className="mr-2 text-amber-600" size={20} />
                  Redeem Prizes
                </h3>
                <div className="space-y-3">
                  {PRIZES.map((prize) => (
                    <div 
                      key={prize.id}
                      className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{prize.name}</p>
                          <p className="text-xs text-gray-500">{prize.cost} Tickets</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRedeem(prize)}
                        disabled={activeCard.tickets < prize.cost}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          activeCard.tickets >= prize.cost 
                            ? 'bg-slate-900 text-white hover:bg-slate-800' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierConsole;
