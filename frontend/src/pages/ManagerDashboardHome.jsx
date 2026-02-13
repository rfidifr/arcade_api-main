import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CreditCard, 
  Gamepad2, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCcw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const ManagerDashboardHome = () => {
  const { inventory, machines, transactions } = useApp();
  const navigate = useNavigate();

  // Calculate Stats
  const totalCards = inventory.length;
  const activeMachines = machines.filter(m => m.status === 'ONLINE').length;
  const totalMachines = machines.length;
  const totalRevenue = transactions
    .filter(t => t.type === 'DEBIT' || t.type === 'PUNCH')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  // Dynamic Data for Chart (last 7 transactions or grouped by hour)
  const revenueData = transactions.slice(0, 7).reverse().map(t => ({
    name: t.time || new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: t.amount || 0
  }));

  // Fallback if no data
  const displayRevenueData = revenueData.length > 0 ? revenueData : [
    { name: 'No Data', value: 0 }
  ];

  const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        <div className="flex items-center mt-2 space-x-2">
          {trend === 'up' ? (
            <span className="text-green-500 text-xs font-bold flex items-center bg-green-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} className="mr-1" /> +12%
            </span>
          ) : (
            <span className="text-red-500 text-xs font-bold flex items-center bg-red-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight size={12} className="mr-1" /> -2%
            </span>
          )}
          <span className="text-gray-400 text-xs">{subtext}</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, Manager. Here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/manager/storage')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            <span>New Card</span>
          </button>
          <button 
            onClick={() => navigate('/manager/refunds')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium"
          >
            <RefreshCcw size={18} />
            <span>Refunds</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          subtext="vs yesterday"
          icon={DollarSign} 
          color="bg-green-500" 
          trend="up"
        />
        <StatCard 
          title="Active Machines" 
          value={`${activeMachines} / ${totalMachines}`} 
          subtext="Online now"
          icon={Gamepad2} 
          color="bg-blue-500" 
          trend="up"
        />
        <StatCard 
          title="Total Cards" 
          value={totalCards} 
          subtext="Registered users"
          icon={CreditCard} 
          color="bg-purple-500" 
          trend="up"
        />
        <StatCard 
          title="System Health" 
          value="98%" 
          subtext="Optimal performance"
          icon={Activity} 
          color="bg-orange-500" 
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp className="mr-2 text-indigo-600" size={20} />
              Revenue Trends
            </h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayRevenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} prefix="$" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">New card registered</p>
                  <p className="text-xs text-gray-500">ID: CARD-883{i} • Just now</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardHome;
