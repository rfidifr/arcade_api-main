import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CreditCard, Plus, Ban, CheckCircle, X, Trash2, Edit, Ticket, Phone, Undo2, Clock, Layers, History, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CardHistoryModal from '../components/CardHistoryModal';
import ReplaceCardModal from '../components/ReplaceCardModal';

const TokenStorage = () => {
  const { 
    inventory, addCard, updateCard, deleteCard, blockCard, 
    undoData, performUndo, user, logs,
    bulkDeleteCards, bulkBlockCards, bulkRechargeCards 
  } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'preview'
  const [formData, setFormData] = useState({ id: '', balance: '', tickets: '', issuedTo: '', phoneNumber: '' });
  
  const [selectedCards, setSelectedCards] = useState([]);
  const [historyCard, setHistoryCard] = useState(null);
  const [replaceCardData, setReplaceCardData] = useState(null);

  const location = useLocation();

  const isAdmin = user?.role === 'manager';

  // Selection Logic
  const toggleSelect = (id) => {
    setSelectedCards(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCards.length === inventory.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(inventory.map(c => c.id));
    }
  };

  const handleBulkAction = (action) => {
    if (!selectedCards.length) return;
    
    if (action === 'delete') {
      if (window.confirm(`Delete ${selectedCards.length} cards?`)) {
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
      if (amount && !isNaN(amount)) {
        bulkRechargeCards(selectedCards, parseInt(amount));
        setSelectedCards([]);
      }
    }
  };

  // Keyboard Shortcuts (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const toggleStatus = (id) => {
    const card = inventory.find(c => c.id === id);
    if (card) {
      if (card.status === 'ACTIVE') {
         blockCard(id);
      } else {
         updateCard({ ...card, status: 'ACTIVE' });
      }
    }
  };

  const handleDelete = (id) => {
    // Removed "cannot be undone" warning as we now have Undo
    if (window.confirm(`Are you sure you want to delete card ${id}?`)) {
      deleteCard(id);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ id: '', balance: '', tickets: '0', issuedTo: '', phoneNumber: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setModalMode('edit');
    setFormData({ 
      id: card.id, 
      balance: card.balance, 
      tickets: card.tickets || 0, 
      issuedTo: card.issuedTo,
      phoneNumber: card.phoneNumber || ''
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openModal) {
      setModalMode('create');
      setFormData({ id: '', balance: '', tickets: '0', issuedTo: '', phoneNumber: '' });
      setIsModalOpen(true);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || formData.balance === '') return;

    // Phone Number Validation (10 digits)
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    if (modalMode === 'create') {
      // Check duplicate
      if (inventory.some(c => c.id === formData.id)) {
        alert('Card ID already exists!');
        return;
      }
      // Show Preview
      setModalMode('preview');
      return;
    } 
    
    // Update Logic (Edit Mode)
    const card = inventory.find(c => c.id === formData.id);
    if (card) {
      updateCard({ 
        ...card, 
        balance: parseInt(formData.balance), 
        tickets: parseInt(formData.tickets || 0),
        issuedTo: formData.issuedTo,
        phoneNumber: formData.phoneNumber
      });
      setIsModalOpen(false);
    }
  };

  const handleConfirmCreate = () => {
    const cardToAdd = {
      id: formData.id,
      balance: parseInt(formData.balance),
      tickets: parseInt(formData.tickets || 0),
      status: 'ACTIVE',
      lastUsed: 'Just now',
      issuedTo: formData.issuedTo || 'Guest',
      phoneNumber: formData.phoneNumber
    };
    addCard(cardToAdd);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Token Storage & Card Management</h2>
          <p className="text-gray-500">Manage card inventory and balances.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Issue New Card</span>
        </button>
      </div>

      {/* Undo Toast */}
      {undoData && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className="bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-4 border border-slate-700">
            <div>
              <p className="font-bold text-sm">Action Performed</p>
              <p className="text-xs text-slate-400">You can undo this within 20s</p>
            </div>
            <button 
              onClick={performUndo}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
            >
              <Undo2 size={16} />
              <span>Undo</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Cards Issued</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{inventory.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Active Now</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            {inventory.filter(c => c.status === 'ACTIVE').length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Cards in Stock</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">155</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Bulk Actions Header */}
        {selectedCards.length > 0 ? (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center animate-fade-in">
            <div className="flex items-center space-x-4">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedCards.length} Selected
              </span>
              <button onClick={() => setSelectedCards([])} className="text-sm text-indigo-600 hover:text-indigo-800 underline">
                Clear Selection
              </button>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleBulkAction('recharge')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
              >
                <Plus size={16} /> <span>Bulk Recharge</span>
              </button>
              <button 
                onClick={() => handleBulkAction('block')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 text-sm font-medium transition-colors"
              >
                <Ban size={16} /> <span>Block All</span>
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
              >
                <Trash2 size={16} /> <span>Delete All</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Card Inventory</h3>
          </div>
        )}

        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedCards.length === inventory.length && inventory.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Card ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Holder / Note</th>
              {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Last Used</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.map((card) => (
              <tr 
                key={card.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  card.balance < 50 && card.status === 'ACTIVE' ? 'bg-red-50/60' : ''
                } ${selectedCards.includes(card.id) ? 'bg-indigo-50/40' : ''}`}
              >
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedCards.includes(card.id)}
                    onChange={() => toggleSelect(card.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded text-white ${
                      card.balance < 50 ? 'bg-red-500' : 'bg-slate-500'
                    }`}>
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <span className="font-mono text-sm font-medium text-gray-900 block">{card.id}</span>
                      {card.balance < 50 && card.status === 'ACTIVE' && (
                        <span className="text-[10px] text-red-600 font-bold flex items-center">
                          <AlertTriangle size={10} className="mr-1" /> Low Balance
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{card.issuedTo}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {card.phoneNumber ? (
                      <span className="flex items-center text-gray-500">
                        <Phone size={12} className="mr-1" />
                        {card.phoneNumber}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs italic">N/A</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className={`text-sm font-bold ${card.balance < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                    {card.balance} Tokens
                  </div>
                  <div className="text-xs text-amber-600 flex items-center mt-1">
                    <Ticket size={12} className="mr-1" />
                    {card.tickets || 0} Tickets
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{card.lastUsed}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    card.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {card.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-1">
                    <button 
                      onClick={() => setHistoryCard(card)}
                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View History"
                    >
                      <History size={18} />
                    </button>
                    <button 
                      onClick={() => setReplaceCardData(card)}
                      className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Lost Card Replacement"
                    >
                      <ShieldCheck size={18} />
                    </button>
                    {/* Only Admin can block/unblock */}
                    {isAdmin && (
                      <button 
                        onClick={() => toggleStatus(card.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          card.status === 'ACTIVE'
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={card.status === 'ACTIVE' ? "Block Card" : "Activate Card"}
                      >
                        {card.status === 'ACTIVE' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                    )}
                    <button 
                      onClick={() => openEditModal(card)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Card"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(card.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* History Modal */}
      {historyCard && (
        <CardHistoryModal 
          card={historyCard} 
          logs={logs}
          onClose={() => setHistoryCard(null)} 
        />
      )}

      {/* Replace Card Modal */}
      {replaceCardData && (
        <ReplaceCardModal 
          oldCard={replaceCardData} 
          onClose={() => setReplaceCardData(null)} 
        />
      )}

      {/* Create / Edit / Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Issue New Card' : modalMode === 'edit' ? 'Edit Card Details' : 'Confirm Details'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            {modalMode === 'preview' ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Card ID</span>
                    <span className="font-mono font-bold text-gray-900">{formData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Initial Balance</span>
                    <span className="font-bold text-green-600">{formData.balance} Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Tickets</span>
                    <span className="font-bold text-amber-600">{formData.tickets || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Issued To</span>
                    <span className="font-medium text-gray-900">{formData.issuedTo || 'Guest'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Phone</span>
                    <span className="font-medium text-gray-900">{formData.phoneNumber || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setModalMode('create')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleConfirmCreate}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md transition-colors"
                  >
                    Confirm Issue
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card ID (RFID)</label>
                  <input 
                    type="text" 
                    required
                    disabled={modalMode === 'edit'}
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Scan card or enter ID..."
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.balance}
                      onChange={(e) => setFormData({...formData, balance: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tickets</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.tickets}
                      onChange={(e) => setFormData({...formData, tickets: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                  <input 
                    type="text" 
                    value={formData.issuedTo}
                    onChange={(e) => setFormData({...formData, issuedTo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Guest Name / Note"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10-digit number"
                    maxLength="10"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold shadow-md transition-colors"
                  >
                    {modalMode === 'create' ? 'Review Details' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyCard && (
        <CardHistoryModal 
          card={historyCard} 
          logs={logs} 
          onClose={() => setHistoryCard(null)} 
        />
      )}
    </div>
  );
};

export default TokenStorage;
