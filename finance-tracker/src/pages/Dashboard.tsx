import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, Wallet, RefreshCw, ArrowRight, Bell, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];
const REMINDER_DAYS = 3;

export function Dashboard() {
  const { transactions, subscriptions, getPaymentMethodById } = useFinance();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const activeSubscriptions = subscriptions.filter(s => s.active);
  const monthlySubscriptionCost = activeSubscriptions.reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.amount;
    if (s.billingCycle === 'yearly') return sum + s.amount / 12;
    if (s.billingCycle === 'weekly') return sum + s.amount * 4;
    return sum;
  }, 0);

  // Suscripciones próximas a vencer (en los próximos 3 días)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingSubscriptions = activeSubscriptions.filter(s => {
    const billingDate = new Date(s.nextBillingDate);
    billingDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= REMINDER_DAYS && !dismissedAlerts.includes(s.id);
  });

  const getDaysUntil = (dateStr: string) => {
    const billingDate = new Date(dateStr);
    billingDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `En ${diffDays} días`;
  };

  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const maxCategoryValue = Math.max(...categoryData.map(c => c.value), 1);
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Alertas de suscripciones próximas */}
      {upcomingSubscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="text-amber-600" size={20} />
            <h2 className="font-semibold text-amber-800">Suscripciones por cobrar</h2>
          </div>
          <div className="space-y-2">
            {upcomingSubscriptions.map(sub => {
              const paymentMethod = getPaymentMethodById(sub.paymentMethodId);
              return (
                <div key={sub.id} className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" size={18} />
                    <div>
                      <p className="font-medium text-slate-800">{sub.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-amber-600">{getDaysUntil(sub.nextBillingDate)}</span>
                        {paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: paymentMethod.color }}>
                              {paymentMethod.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-700">{formatCurrency(sub.amount)}</span>
                    <button
                      onClick={() => setDismissedAlerts(prev => [...prev, sub.id])}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      title="Descartar alerta"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><TrendingUp className="text-green-600" size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Gastos del Mes</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full"><TrendingDown className="text-red-600" size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full"><Wallet className="text-indigo-600" size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Suscripciones/Mes</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(monthlySubscriptionCost)}</p>
              <p className="text-xs text-slate-400">{activeSubscriptions.length} activas</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full"><RefreshCw className="text-purple-600" size={24} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Categoría</h2>
          {categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((cat, index) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="font-medium text-slate-800">{formatCurrency(cat.value)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(cat.value / maxCategoryValue) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No hay gastos este mes</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Transacciones Recientes</h2>
            <Link to="/transactions" className="text-indigo-600 text-sm flex items-center gap-1 hover:underline">Ver todas <ArrowRight size={16} /></Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(transaction => {
                const paymentMethod = transaction.paymentMethodId ? getPaymentMethodById(transaction.paymentMethodId) : null;
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'income' ? <TrendingUp className="text-green-600" size={16} /> : <TrendingDown className="text-red-600" size={16} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{transaction.category}</span>
                          {paymentMethod && (<><span>•</span><span className="px-1.5 py-0.5 rounded text-white text-[10px]" style={{ backgroundColor: paymentMethod.color }}>{paymentMethod.name}</span></>)}
                        </div>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No hay transacciones</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Suscripciones Activas</h2>
          <Link to="/subscriptions" className="text-indigo-600 text-sm flex items-center gap-1 hover:underline">Gestionar <ArrowRight size={16} /></Link>
        </div>
        {activeSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubscriptions.slice(0, 6).map(sub => {
              const paymentMethod = getPaymentMethodById(sub.paymentMethodId);
              return (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-800">{sub.name}</h3>
                    <span className="text-sm font-semibold text-indigo-600">{formatCurrency(sub.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{sub.billingCycle === 'monthly' ? 'Mensual' : sub.billingCycle === 'yearly' ? 'Anual' : 'Semanal'}</span>
                    {paymentMethod && (<><span>•</span><span className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: paymentMethod.color }}>{paymentMethod.name}</span></>)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-slate-400">No tienes suscripciones activas</div>
        )}
      </div>
    </div>
  );
}
