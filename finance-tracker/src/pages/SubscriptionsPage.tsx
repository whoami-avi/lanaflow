import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, RefreshCw, Pause, Play } from 'lucide-react';
import { SUBSCRIPTION_CATEGORIES } from '../types';

export function SubscriptionsPage() {
  const { subscriptions, paymentMethods, addSubscription, updateSubscription, deleteSubscription, getPaymentMethodById } = useFinance();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    category: '',
    paymentMethodId: '',
    nextBillingDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const activeSubscriptions = subscriptions.filter(s => s.active);
  const inactiveSubscriptions = subscriptions.filter(s => !s.active);

  const totalMonthly = activeSubscriptions.reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.amount;
    if (s.billingCycle === 'yearly') return sum + s.amount / 12;
    if (s.billingCycle === 'weekly') return sum + s.amount * 4;
    return sum;
  }, 0);

  const totalYearly = totalMonthly * 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSubscription({
      name: formData.name,
      amount: parseFloat(formData.amount),
      billingCycle: formData.billingCycle,
      category: formData.category,
      paymentMethodId: formData.paymentMethodId,
      nextBillingDate: formData.nextBillingDate,
      active: true,
      notes: formData.notes || undefined,
    });
    setFormData({
      name: '',
      amount: '',
      billingCycle: 'monthly',
      category: '',
      paymentMethodId: '',
      nextBillingDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      case 'yearly': return 'Anual';
      default: return cycle;
    }
  };

  const SubscriptionCard = ({ sub }: { sub: typeof subscriptions[0] }) => {
    const paymentMethod = getPaymentMethodById(sub.paymentMethodId);
    return (
      <div className={`p-4 rounded-xl border ${sub.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${sub.active ? 'bg-purple-100' : 'bg-slate-200'}`}>
              <RefreshCw className={sub.active ? 'text-purple-600' : 'text-slate-400'} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{sub.name}</h3>
              <p className="text-sm text-slate-500">{sub.category} • {getCycleLabel(sub.billingCycle)}</p>
            </div>
          </div>
          <p className="text-xl font-bold text-indigo-600">{formatCurrency(sub.amount)}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {paymentMethod && (
              <span className="px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: paymentMethod.color }}>
                {paymentMethod.name}{paymentMethod.lastFourDigits && ` •••• ${paymentMethod.lastFourDigits}`}
              </span>
            )}
            <span className="text-slate-500">Próximo: {formatDate(sub.nextBillingDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => updateSubscription(sub.id, { active: !sub.active })} className={`p-2 rounded-lg ${sub.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
              {sub.active ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Suscripciones</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus size={20} /> Nueva Suscripción
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <p className="text-sm text-slate-500">Activas</p>
          <p className="text-3xl font-bold text-indigo-600">{activeSubscriptions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <p className="text-sm text-slate-500">Gasto Mensual</p>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <p className="text-sm text-slate-500">Gasto Anual</p>
          <p className="text-3xl font-bold text-rose-600">{formatCurrency(totalYearly)}</p>
        </div>
      </div>

      {activeSubscriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSubscriptions.map(sub => <SubscriptionCard key={sub.id} sub={sub} />)}
          </div>
        </div>
      )}

      {inactiveSubscriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-500 mb-4">Pausadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveSubscriptions.map(sub => <SubscriptionCard key={sub.id} sub={sub} />)}
          </div>
        </div>
      )}

      {subscriptions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          No tienes suscripciones registradas
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Nueva Suscripción</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Netflix, Spotify" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto *</label>
                    <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ciclo *</label>
                    <select required value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seleccionar</option>
                    {SUBSCRIPTION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago *</label>
                  <select required value={formData.paymentMethodId} onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seleccionar</option>
                    {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}{m.lastFourDigits && ` (•••• ${m.lastFourDigits})`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Próximo Cobro *</label>
                  <input type="date" required value={formData.nextBillingDate} onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} placeholder="Notas adicionales..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button>
                  <button type="submit" className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
