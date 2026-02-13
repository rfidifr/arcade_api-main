import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Users, AlertTriangle, Activity } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../context/AppContext';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className={`text-xs mt-2 ${subtext && subtext.includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
          {subtext}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const { transactions, inventory, machines } = useApp();

  // Dynamic calculations
  const totalTransactions = transactions.length;
  const activeCards = inventory.filter(c => c.status === 'ACTIVE').length;
  const activePlayers = new Set(transactions.filter(t => {
    const tDate = new Date(t.timestamp);
    const now = new Date();
    return tDate > new Date(now.getTime() - 30 * 60 * 1000); // last 30 mins
  }).map(t => t.card_id)).size;
  
  const offlineMachines = machines.filter(m => m.status === 'OFFLINE').length;

  const chartData = transactions.slice(0, 7).reverse().map(t => ({
    name: t.time || new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    revenue: t.amount || 0
  }));

  const displayChartData = chartData.length > 0 ? chartData : [{ name: 'No Data', revenue: 0 }];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Transactions" 
          value={totalTransactions.toLocaleString()} 
          subtext="Total logs recorded" 
          icon={Activity} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Active Cards" 
          value={activeCards.toLocaleString()} 
          subtext="Registered & Active" 
          icon={CreditCard} 
          color="bg-purple-600" 
        />
        <StatCard 
          title="Active Players" 
          value={activePlayers.toLocaleString()} 
          subtext="Estimated last 30m" 
          icon={Users} 
          color="bg-green-600" 
        />
        <StatCard 
          title="System Alerts" 
          value={offlineMachines} 
          subtext={offlineMachines > 0 ? `${offlineMachines} machines offline` : "All systems normal"} 
          icon={AlertTriangle} 
          color={offlineMachines > 0 ? "bg-amber-500" : "bg-gray-400"} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Live Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / System Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-sm font-medium text-gray-700">FastAPI Backend</span>
              <span className="text-xs font-bold text-green-700 px-2 py-1 bg-green-200 rounded">Operational</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-sm font-medium text-gray-700">Database (Supabase)</span>
              <span className="text-xs font-bold text-green-700 px-2 py-1 bg-green-200 rounded">Operational</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-sm font-medium text-gray-700">RFID Readers</span>
              <span className="text-xs font-bold text-amber-700 px-2 py-1 bg-amber-200 rounded">Degraded (1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-sm font-medium text-gray-700">Web UI</span>
              <span className="text-xs font-bold text-green-700 px-2 py-1 bg-green-200 rounded">Operational</span>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/operator/storage', { state: { openModal: true } })}
                className="p-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
              >
                New Card
              </button>
              <button 
                onClick={() => navigate('/operator/refunds')}
                className="p-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
