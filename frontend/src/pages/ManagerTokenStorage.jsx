import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, CreditCard, X, Trash2, RefreshCcw, Ban, CheckCircle, Database, AlertTriangle, History, ShieldCheck } from 'lucide-react';
import CardHistoryModal from '../components/CardHistoryModal';
import ReplaceCardModal from '../components/ReplaceCardModal';

const ManagerTokenStorage = () => {
  const { inventory, updateCard, addCard, deleteCard, bulkDeleteCards, bulkBlockCards, bulkRechargeCards, logs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [modalType, setModalType] = useState(null); // 'add', 'refund', 'create', 'preview'
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [newCardId, setNewCardId] = useState('');
  const [error, setError] = useState('');

  // Bulk Selection State
  const [selectedCards, setSelectedCards] = useState([]);

  // History Modal State
  const [historyCard, setHistoryCard] = useState(null);

  // Replace Card Modal State
  const [replaceCardData, setReplaceCardData] = useState(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        setHistoryCard(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredInventory = inventory.filter(card => 
    card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (type, card = null) => {
    setModalType(type);
    setSelectedCard(card);
    setAmount('');
    setNewCardId('');
    setError('');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCard(null);
    setAmount('');
    setNewCardId('');
    setError('');
  };

  // --- Bulk Actions ---
  const toggleSelect = (id) => {
    setSelectedCards(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCards.length === filteredInventory.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredInventory.map(c => c.id));
    }
  };

  const handleBulkAction = (action) => {
    if (!selectedCards.length) return;
    
    if (action === 'delete') {
      if (window.confirm(`Delete ${selectedCards.length} cards? This cannot be undone.`)) {
        bulkDeleteCards(selectedCards);
        setSelectedCards([]);
      }
    } else if (action === 'block') {
      if (window.confirm(`Block ${selectedCards.length} cards?`)) {
        bulkBlockCards(selectedCards);
        setSelectedCards([]);
      }
    } else if (action === 'recharge') {
      const amount = prompt("Enter amount to recharge for all selected cards:");
      if (amount && !isNaN(amount) && Number(amount) > 0) {
        bulkRechargeCards(selectedCards, parseInt(amount));
        setSelectedCards([]);
      } else if (amount) {
        alert("Invalid amount entered.");
      }
    }
  };

  // --- Single Actions ---

  const handleAddTokens = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    const newBalance = selectedCard.balance + parseInt(amount);
    const result = await updateCard({ ...selectedCard, balance: newBalance });
    
    if (result && result.success) {
      closeModal();
    } else {
      setError(result?.message || 'Failed to add tokens. Please check your connection or permissions.');
    }
  };

  const handleRefund = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    const val = parseInt(amount);
    if (val > selectedCard.balance) {
      setError('Insufficient balance for refund');
      return;
    }
    
    // We'll use the refundCard function from context instead of updateCard for full refund
    // If it's a partial refund, we currently use updateCard logic in context
    const result = await updateCard({ ...selectedCard, balance: selectedCard.balance - val });
    
    if (result && result.success) {
      closeModal();
    } else {
      setError(result?.message || 'Failed to process refund.');
    }
  };

  const handleCreateCard = () => {
    if (!newCardId.trim()) {
      setError('Card ID is required');
      return;
    }
    if (inventory.some(c => c.id === newCardId)) {
      setError('Card ID already exists');
      return;
    }
    
    const newCard = {
      id: newCardId,
      balance: amount ? parseInt(amount) : 0,
      tickets: 0,
      status: 'ACTIVE',
      lastUsed: 'Never',
      issuedTo: 'New Guest'
    };
    
    addCard(newCard);
    closeModal();
  };

  const toggleStatus = (card) => {
    const newStatus = card.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    updateCard({ ...card, status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete card ${id}? This action cannot be undone.`)) {
      deleteCard(id);
    }
  };

  const totalCards = inventory.length;
  const activeCards = inventory.filter(c => c.status === 'ACTIVE').length;
  const blockedCards = inventory.filter(c => c.status === 'BLOCKED').length;
  const totalBalance = inventory.reduce((sum, c) => sum + c.balance, 0);

  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={20} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Card Inventory</h2>
          <p className="text-gray-500">Manage all RFID cards and balances.</p>
        </div>
        <button 
          onClick={() => openModal('create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors font-bold shadow-md"
        >
          <Plus size={20} />
          <span>Register New Card</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Cards" 
          value={totalCards} 
          color="bg-blue-500" 
          icon={CreditCard} 
        />
        <StatCard 
          title="Active Cards" 
          value={activeCards} 
          color="bg-green-500" 
          icon={CheckCircle} 
        />
        <StatCard 
          title="Blocked Cards" 
          value={blockedCards} 
          color="bg-red-500" 
          icon={Ban} 
        />
        <StatCard 
          title="Total Balance" 
          value={totalBalance.toLocaleString()} 
          color="bg-purple-500" 
          icon={Database} 
        />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Search by Card ID or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table Container */}
      <div className="bg-black text-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Bulk Actions Header */}
        {selectedCards.length > 0 ? (
          <div className="p-4 bg-indigo-900/50 border-b border-indigo-800 flex justify-between items-center animate-fade-in">
            <div className="flex items-center space-x-4">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedCards.length} Selected
              </span>
              <button onClick={() => setSelectedCards([])} className="text-sm text-indigo-300 hover:text-white underline">
                Clear Selection
              </button>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleBulkAction('recharge')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-800 border border-indigo-700 text-indigo-300 rounded-lg hover:bg-indigo-900 text-sm font-medium transition-colors"
              >
                <Plus size={16} /> <span>Bulk Recharge</span>
              </button>
              <button 
                onClick={() => handleBulkAction('block')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-800 border border-amber-700 text-amber-300 rounded-lg hover:bg-amber-900 text-sm font-medium transition-colors"
              >
                <Ban size={16} /> <span>Block All</span>
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-800 border border-red-700 text-red-300 rounded-lg hover:bg-red-900 text-sm font-medium transition-colors"
              >
                <Trash2 size={16} /> <span>Delete All</span>
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto p-6 pt-2">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedCards.length === filteredInventory.length && filteredInventory.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="pb-4 font-bold text-lg">CARD ID</th>
                <th className="pb-4 font-bold text-lg">ISSUED TO</th>
                <th className="pb-4 font-bold text-lg">PHONE</th>
                <th className="pb-4 font-bold text-lg">BALANCE</th>
                <th className="pb-4 font-bold text-lg">LAST USED</th>
                <th className="pb-4 font-bold text-lg">STATUS</th>
                <th className="pb-4 font-bold text-lg text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredInventory.map((card) => (
                <tr 
                  key={card.id} 
                  className={`group hover:bg-gray-900 transition-colors ${
                    card.balance < 50 && card.status === 'ACTIVE' ? 'bg-red-900/20' : ''
                  } ${selectedCards.includes(card.id) ? 'bg-indigo-900/20' : ''}`}
                >
                  <td className="py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedCards.includes(card.id)}
                      onChange={() => toggleSelect(card.id)}
                      className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 text-lg font-mono">
                    {card.id}
                    {card.balance < 50 && card.status === 'ACTIVE' && (
                      <div className="flex items-center text-xs text-red-400 font-bold mt-1">
                        <AlertTriangle size={12} className="mr-1" /> Low Balance
                      </div>
                    )}
                  </td>
                  <td className="py-4 text-lg text-gray-300">{card.issuedTo || 'Guest'}</td>
                  <td className="py-4 text-lg text-gray-300">{card.phoneNumber || 'N/A'}</td>
                  <td className={`py-4 text-lg ${card.balance < 50 && card.status === 'ACTIVE' ? 'text-red-400 font-bold' : ''}`}>
                    {card.balance} <span className="text-sm text-gray-400">Tokens</span>
                  </td>
                  <td className="py-4 text-lg text-gray-300 text-sm">{card.lastUsed || 'Never'}</td>
                  <td className="py-4">
                    <button 
                      onClick={() => toggleStatus(card)}
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 transition-colors ${
                        card.status === 'ACTIVE' 
                          ? 'bg-green-900/50 text-green-400 hover:bg-green-900' 
                          : 'bg-red-900/50 text-red-400 hover:bg-red-900'
                      }`}
                      title="Click to Toggle Status"
                    >
                      {card.status === 'ACTIVE' ? <CheckCircle size={12} /> : <Ban size={12} />}
                      <span>{card.status}</span>
                    </button>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => setHistoryCard(card)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                        title="View History"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => setReplaceCardData(card)}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg transition-colors"
                        title="Lost Card Replacement"
                      >
                        <ShieldCheck size={18} />
                      </button>
                      <button 
                        onClick={() => openModal('add', card)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        title="Add Tokens"
                      >
                        <Plus size={18} />
                      </button>
                      <button 
                        onClick={() => openModal('refund', card)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
                        title="Refund / Deduct"
                      >
                        <RefreshCcw size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No cards found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Replace Card Modal */}
      {replaceCardData && (
        <ReplaceCardModal 
          oldCard={replaceCardData} 
          onClose={() => setReplaceCardData(null)} 
        />
      )}

      {/* History Modal */}
      {historyCard && (
        <CardHistoryModal 
          card={historyCard} 
          logs={logs}
          onClose={() => setHistoryCard(null)} 
        />
      )}

      {/* Add Tokens Modal */}
      {modalType === 'add' && selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Tokens</h3>
                <p className="text-sm text-gray-500">Card: {selectedCard.id}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-gray-600 font-medium">Current Balance</span>
                <span className="text-2xl font-bold text-blue-700">{selectedCard.balance}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                  placeholder="0"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <button 
                onClick={handleAddTokens}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                <Plus size={20} /> <span>Confirm Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {modalType === 'refund' && selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Refund / Deduct</h3>
                <p className="text-sm text-gray-500">Card: {selectedCard.id}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <span className="text-gray-600 font-medium">Current Balance</span>
                <span className="text-2xl font-bold text-yellow-700">{selectedCard.balance}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Refund</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-lg"
                  placeholder="0"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <button 
                onClick={handleRefund}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                <RefreshCcw size={20} /> <span>Confirm Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Register New Card</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card ID</label>
                <input 
                  type="text" 
                  value={newCardId}
                  onChange={(e) => setNewCardId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="e.g. CARD-1234"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance (Optional)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <button 
                onClick={handleCreateCard}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                <Plus size={20} /> <span>Register Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerTokenStorage;