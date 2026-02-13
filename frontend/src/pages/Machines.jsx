import React, { useState } from 'react';
import { Gamepad2, Plus, MonitorPlay, Wifi, WifiOff, AlertTriangle, Edit, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Machines = () => {
  const { machines, addMachine, updateMachine, deleteMachine, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({ id: '', name: '', type: 'Arcade', status: 'ONLINE', pricePerPlay: 0 });

  const isAdmin = user?.role === 'manager';

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-100 text-green-700 border-green-200';
      case 'BUSY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'OFFLINE': return 'bg-red-100 text-red-700 border-red-200';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
    if (!isAdmin) return;
    setModalMode('create');
    setFormData({ id: '', name: '', type: 'Arcade', status: 'ONLINE', pricePerPlay: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (machine) => {
    setModalMode('edit');
    setFormData({ 
      id: machine.id, 
      name: machine.name, 
      type: machine.type, 
      status: machine.status,
      pricePerPlay: machine.pricePerPlay || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) return;

    if (modalMode === 'create') {
      if (machines.some(m => m.id === formData.id)) {
        alert('Machine ID already exists!');
        return;
      }
      const newMachine = {
        ...formData,
        lastPing: 'Just now',
        revenueToday: 0
      };
      addMachine(newMachine);
    } else {
      updateMachine(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Machines Management</h2>
          <p className="text-gray-500">Monitor and manage arcade machines.</p>
        </div>
        <button 
          onClick={openCreateModal}
          disabled={!isAdmin}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm transition-colors ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          <Plus size={18} />
          <span>Add Machine</span>
        </button>
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

      {/* Machines List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 text-sm">Machine ID</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Name & Type</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Price/Play</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Revenue Today</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Last Ping</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{machine.id}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 text-indigo-600">
                        <Gamepad2 size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{machine.name}</div>
                        <div className="text-xs text-gray-500">{machine.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(machine.status)}`}>
                      {getStatusIcon(machine.status)}
                      {machine.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {machine.pricePerPlay} <span className="text-xs text-gray-500 font-normal">tokens</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {machine.revenueToday} <span className="text-xs text-gray-500 font-normal">tokens</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{machine.lastPing}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(machine)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    {isAdmin && (
                    <button 
                      onClick={() => handleDelete(machine.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Machine' : 'Edit Machine'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine ID</label>
                <input 
                  type="text" 
                  required
                  readOnly={modalMode === 'edit'}
                  className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${modalMode === 'edit' ? 'bg-gray-100 text-gray-500' : ''}`}
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Street Fighter 6"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type/Category</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Arcade">Arcade</option>
                  <option value="Racing">Racing</option>
                  <option value="Sports">Sports</option>
                  <option value="Prize">Prize/Claw</option>
                  <option value="Rhythm">Rhythm/Music</option>
                  <option value="VR">VR Experience</option>
                  <option value="Kiddie">Kiddie Ride</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ONLINE">Online (Available)</option>
                  <option value="BUSY">Busy (In Use)</option>
                  <option value="OFFLINE">Offline (Power Off)</option>
                  <option value="MAINTENANCE">Maintenance (Out of Order)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Play (Tokens)</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 50"
                  value={formData.pricePerPlay}
                  onChange={(e) => setFormData({...formData, pricePerPlay: parseInt(e.target.value) || 0})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4"
              >
                {modalMode === 'create' ? 'Add Machine' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machines;
