import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, CreditCard, RefreshCw, X, Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transacciones' },
  { to: '/subscriptions', icon: RefreshCw, label: 'Suscripciones' },
  { to: '/payment-methods', icon: CreditCard, label: 'Métodos de Pago' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform lg:transform-none flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">
              LANAFLOW
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider">by TECHOME</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="p-2 bg-slate-700 rounded-full">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Conectado como</p>
              <p className="text-sm text-white truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
