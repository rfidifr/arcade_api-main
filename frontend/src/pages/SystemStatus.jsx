import React from 'react';
import { Server, Database, Wifi, ShieldCheck, Cpu } from 'lucide-react';

const StatusItem = ({ icon: Icon, label, status, detail }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${
        status === 'Operational' ? 'bg-green-100 text-green-600' :
        status === 'Degraded' ? 'bg-amber-100 text-amber-600' :
        'bg-red-100 text-red-600'
      }`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{label}</h4>
        <p className="text-xs text-gray-500">{detail}</p>
      </div>
    </div>
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
      status === 'Operational' ? 'bg-green-100 text-green-700' :
      status === 'Degraded' ? 'bg-amber-100 text-amber-700' :
      'bg-red-100 text-red-700'
    }`}>
      {status}
    </span>
  </div>
);

const SystemStatus = () => {
  const handleAction = (action) => {
    alert(`${action} initiated successfully!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Status</h2>
        <p className="text-gray-500">Real-time health monitoring of all components.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusItem 
          icon={Server} 
          label="Backend API" 
          status="Operational" 
          detail="v2.4.0 • Uptime: 14d 2h" 
        />
        <StatusItem 
          icon={Database} 
          label="Main Database" 
          status="Operational" 
          detail="PostgreSQL • Latency: 12ms" 
        />
        <StatusItem 
          icon={Wifi} 
          label="RFID Reader Network" 
          status="Degraded" 
          detail="1 Device Offline (Zone B)" 
        />
        <StatusItem 
          icon={ShieldCheck} 
          label="Auth Service" 
          status="Operational" 
          detail="Secure Connection • SSL Valid" 
        />
        <StatusItem 
          icon={Cpu} 
          label="Server Load" 
          status="Operational" 
          detail="CPU: 12% • Memory: 45%" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <h3 className="font-bold text-gray-800 mb-4">Maintenance Actions</h3>
        <div className="flex space-x-4">
          <button 
            onClick={() => handleAction('Restart API Server')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Restart API Server
          </button>
          <button 
            onClick={() => handleAction('Clear Cache')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Clear Cache
          </button>
          <button 
            onClick={() => handleAction('Emergency Stop')}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
          >
            Emergency Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
