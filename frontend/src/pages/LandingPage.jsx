import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Users, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar Placeholder */}
      <nav className="relative z-10 w-full px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ArcadeOS</span>
        </div>
        <div className="text-slate-400 text-sm font-medium">v2.0.0</div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="max-w-5xl w-full">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">Secure Access Portal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Arcade <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Management System</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Streamline your entertainment venue operations with our centralized control center. Select your access level to proceed.
            </p>
          </div>
          
          {/* Role Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Manager Card */}
            <button 
              onClick={() => navigate('/login?role=manager')}
              className="group relative bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-indigo-500 rounded-2xl p-8 transition-all duration-300 text-left backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <UserCog size={32} className="text-indigo-400 group-hover:text-white" />
                </div>
                <ArrowRight className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" size={24} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Manager Portal</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Full administrative control. Manage inventory, monitor revenue logs, configure system settings, and oversee staff performance.
                </p>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Admin Privileges Required</span>
                </div>
              </div>
            </button>

            {/* Operator Card */}
            <button 
              onClick={() => navigate('/login?role=operator')}
              className="group relative bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-cyan-500 rounded-2xl p-8 transition-all duration-300 text-left backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                  <Users size={32} className="text-cyan-400 group-hover:text-white" />
                </div>
                <ArrowRight className="text-slate-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" size={24} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">Operator Console</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Daily operations interface. Handle card top-ups, manage customer refunds, view machine status, and process transactions.
                </p>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <Gamepad2 size={14} className="text-cyan-500" />
                  <span>Standard Access</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} ArcadeOS Inc. All rights reserved. • <span className="hover:text-slate-400 cursor-pointer transition-colors">System Status: Operational</span>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
