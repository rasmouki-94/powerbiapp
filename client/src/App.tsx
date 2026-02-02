import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, MessageSquare, Zap, BarChart3, Download } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import ProspectDetail from './pages/ProspectDetail';
import Avatars from './pages/Avatars';
import Templates from './pages/Templates';
import ActionsDuJour from './pages/ActionsDuJour';
import Statistiques from './pages/Statistiques';

const navItems = [
  { to: '/', icon: Zap, label: 'Actions du jour' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Pipeline' },
  { to: '/prospects', icon: Users, label: 'Prospects' },
  { to: '/avatars', icon: UserCircle, label: 'Avatars' },
  { to: '/templates', icon: MessageSquare, label: 'Templates' },
  { to: '/stats', icon: BarChart3, label: 'Statistiques' },
];

export default function App() {
  return (
    <div className="min-h-screen flex">
      <nav className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold">Prospection LinkedIn</h1>
        </div>
        <div className="flex-1 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700">
          <a
            href="/api/prospects/export/csv"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <Download size={16} /> Export CSV
          </a>
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<ActionsDuJour />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/prospects/:id" element={<ProspectDetail />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/stats" element={<Statistiques />} />
        </Routes>
      </main>
    </div>
  );
}
