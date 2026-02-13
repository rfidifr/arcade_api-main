import React, { useState } from 'react';
import { Gamepad2, Plus, MonitorPlay, Wifi, WifiOff, AlertTriangle, Edit, Trash2, X, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ManagerMachines = () => {
  const { machines, addMachine, updateMachine, deleteMachine } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({ id: '', name: '', type: 'Arcade', status: 'ONLINE' });
  const [error, setError] = useState('');

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-900/50 text-green-400 border-green-900';
      case 'BUSY': return 'bg-blue-900/50 text-blue-400 border-blue-900';
      case 'OFFLINE': return 'bg-red-900/50 text-red-400 border-red-900';
      case 'MAINTENANCE': return 'bg-amber-900/50 text-amber-400 border-amber-900';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE': return <Wifi size={14} className="mr-1" />;
      case 'BUSY': return <MonitorPlay size={14} className="mr-1" />;
      case 'OFFLINE': return <WifiOff size={14} className="mr-1" />;
      case 'MAINTENANCE': return <AlertTriangle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to remove machine ${id}?`)) {
      deleteMachine(id);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ id: '', name: '', type: 'Arcade', status: 'ONLINE' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (machine) => {
    setModalMode('edit');
    setFormData({ 
      id: machine.id, 
      name: machine.name, 
      type: machine.type, 
      status: machine.status 
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      setError('Please fill all required fields');
      return;
    }

    if (modalMode === 'create') {
      if (machines.some(m => m.id === formData.id)) {
        setError('Machine ID already exists!');
        return;
      }
      const newMachine = {
        ...formData,
        lastPing: 'Just now',
        revenueToday: 0
      };
      addMachine(newMachine);
    } else {
      // Preserve existing data like revenue and lastPing
      const existing = machines.find(m => m.id === formData.id);
      updateMachine({ ...existing, ...formData });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Machines Management</h2>
          <p className="text-gray-500">Monitor and configure arcade machines.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors font-bold shadow-md"
        >
          <Plus size={20} />
          <span>Add Machine</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Search machines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium uppercase">Total Machines</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{machines.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium uppercase">Online</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">
            {machines.filter(m => m.status === 'ONLINE' || m.status === 'BUSY').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium uppercase">Offline</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">
            {machines.filter(m => m.status === 'OFFLINE').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium uppercase">Maintenance</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {machines.filter(m => m.status === 'MAINTENANCE').length}
          </h3>
        </div>
      </div>

      {/* Machines List (Dark Theme) */}
      <div className="bg-black text-white rounded-xl p-6 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="pb-4 font-bold text-lg">ID</th>
                <th className="pb-4 font-bold text-lg">NAME & TYPE</th>
                <th className="pb-4 font-bold text-lg">STATUS</th>
                <th className="pb-4 font-bold text-lg">REVENUE</th>
                <th className="pb-4 font-bold text-lg">LAST PING</th>
                <th className="pb-4 font-bold text-lg text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredMachines.map((machine) => (
                <tr key={machine.id} className="group hover:bg-gray-900 transition-colors">
                  <td className="py-4 text-lg font-mono">{machine.id}</td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mr-3 text-indigo-400">
                        <Gamepad2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{machine.name}</div>
                        <div className="text-xs text-gray-400">{machine.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(machine.status)}`}>
                      {getStatusIcon(machine.status)}
                      {machine.status}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-white">
                    {machine.revenueToday} <span className="text-xs text-gray-500 font-normal">tokens</span>
                  </td>
                  <td className="py-4 text-sm text-gray-400">{machine.lastPing}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(machine)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(machine.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMachines.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No machines found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Machine' : 'Edit Machine'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine ID</label>
                <input 
                  type="text" 
                  required
                  disabled={modalMode === 'edit'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${
                    modalMode === 'edit' ? 'bg-gray-100 text-gray-500' : ''
                  }`}
                  placeholder="e.g. M-001"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Street Fighter 6"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Arcade">Arcade</option>
                    <option value="Racing">Racing</option>
                    <option value="Sports">Sports</option>
                    <option value="Prize">Prize</option>
                    <option value="Rhythm">Rhythm</option>
                    <option value="VR">VR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="BUSY">Busy</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                {modalMode === 'create' ? <Plus size={20} /> : <Edit size={20} />}
                <span>{modalMode === 'create' ? 'Add Machine' : 'Save Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerMachines;
