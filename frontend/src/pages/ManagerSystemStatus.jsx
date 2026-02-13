import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Database, 
  Wifi, 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Power,
  Shield,
  Zap
} from 'lucide-react';

const StatusCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} text-white`}>
      <Icon size={24} />
    </div>
  </div>
);

const ServiceRow = ({ name, status, uptime, latency }) => {
  const getStatusColor = (s) => {
    if (s === 'Operational') return 'text-green-600 bg-green-50 border-green-200';
    if (s === 'Degraded') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-2 h-2 rounded-full ${status === 'Operational' ? 'bg-green-500' : status === 'Degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        <span className="font-semibold text-gray-700">{name}</span>
      </div>
      <div className="flex items-center space-x-8">
        <div className="text-sm text-gray-500 hidden md:block">
          <span className="font-medium text-gray-900">{uptime}</span> uptime
        </div>
        <div className="text-sm text-gray-500 w-24 text-right hidden sm:block">
          {latency} ms
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

const ManagerSystemStatus = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Diagnostics</h2>
          <p className="text-gray-500">Real-time monitoring of server and hardware status.</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          <button 
            onClick={handleRefresh}
            className={`p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Status"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          title="System Health" 
          value="98.5%" 
          subtext="All systems operational" 
          icon={Activity} 
          color="bg-green-500" 
        />
        <StatusCard 
          title="Server Uptime" 
          value="14d 2h" 
          subtext="Since last patch" 
          icon={Clock} 
          color="bg-blue-500" 
        />
        <StatusCard 
          title="Active Sessions" 
          value="24" 
          subtext="Manager & Operators" 
          icon={Zap} 
          color="bg-indigo-500" 
        />
        <StatusCard 
          title="Security Alerts" 
          value="0" 
          subtext="No threats detected" 
          icon={Shield} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Services Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <Server className="mr-2 text-indigo-600" size={20} />
              Core Services Status
            </h3>
            <div className="space-y-4">
              <ServiceRow name="Database Cluster" status="Operational" uptime="99.99%" latency="12" />
              <ServiceRow name="Authentication API" status="Operational" uptime="99.95%" latency="45" />
              <ServiceRow name="Payment Gateway" status="Operational" uptime="99.90%" latency="120" />
              <ServiceRow name="RFID Reader Network" status="Degraded" uptime="98.50%" latency="250" />
              <ServiceRow name="Logging Service" status="Operational" uptime="100%" latency="8" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-amber-600" size={20} />
              Recent System Events
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">High Latency Detected - RFID Reader #4</p>
                  <p className="text-xs text-red-600 mt-1">10:45 AM - Response time &gt; 500ms</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <RefreshCw size={18} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Automated Backup Completed</p>
                  <p className="text-xs text-blue-600 mt-1">04:00 AM - Database backup size: 1.2GB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Resources & Controls */}
        <div className="space-y-6">
          {/* Server Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <Cpu className="mr-2 text-indigo-600" size={20} />
              Resource Usage
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">CPU Usage (4 Cores)</span>
                  <span className="font-bold text-gray-900">42%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Memory (16GB)</span>
                  <span className="font-bold text-gray-900">68%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">SSD Storage</span>
                  <span className="font-bold text-gray-900">24%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Power className="mr-2 text-indigo-600" size={20} />
              System Controls
            </h3>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors flex items-center justify-center">
                <RefreshCw size={16} className="mr-2" /> Restart Services
              </button>
              <button className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors flex items-center justify-center">
                <Database size={16} className="mr-2" /> Backup Now
              </button>
              <button className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg border border-red-200 transition-colors flex items-center justify-center">
                <AlertTriangle size={16} className="mr-2" /> Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSystemStatus;
