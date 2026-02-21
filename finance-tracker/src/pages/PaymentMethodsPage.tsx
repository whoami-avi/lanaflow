import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';

const CARD_COLORS = [
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Morado', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Amarillo', value: '#eab308' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Slate', value: '#64748b' },
];

const PAYMENT_TYPES = [
  { value: 'credit', label: 'Tarjeta de Crédito', icon: CreditCard },
  { value: 'debit', label: 'Tarjeta de Débito', icon: Building2 },
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'digital', label: 'Billetera Digital', icon: Smartphone },
];

export function PaymentMethodsPage() {
  const { paymentMethods, transactions, subscriptions, addPaymentMethod, deletePaymentMethod } = useFinance();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'credit' as 'credit' | 'debit' | 'cash' | 'digital',
    lastFourDigits: '',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPaymentMethod({
      name: formData.name,
      type: formData.type,
      lastFourDigits: formData.lastFourDigits || undefined,
      color: formData.color,
    });
    setFormData({
      name: '',
      type: 'credit',
      lastFourDigits: '',
      color: '#3b82f6',
    });
    setShowModal(false);
  };

  const getUsageStats = (methodId: string) => {
    const transactionCount = transactions.filter(t => t.paymentMethodId === methodId).length;
    const subscriptionCount = subscriptions.filter(s => s.paymentMethodId === methodId).length;
    const totalSpent = transactions
      .filter(t => t.paymentMethodId === methodId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { transactionCount, subscriptionCount, totalSpent };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = PAYMENT_TYPES.find(t => t.value === type);
    return typeInfo?.icon || CreditCard;
  };

  const getTypeLabel = (type: string) => {
    const typeInfo = PAYMENT_TYPES.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Métodos de Pago</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus size={20} /> Agregar Método
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map(method => {
          const stats = getUsageStats(method.id);
          const Icon = getTypeIcon(method.type);
          return (
            <div key={method.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-2" style={{ backgroundColor: method.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${method.color}20` }}>
                      <Icon size={24} style={{ color: method.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{method.name}</h3>
                      <p className="text-sm text-slate-500">{getTypeLabel(method.type)}</p>
                      {method.lastFourDigits && (
                        <p className="text-sm text-slate-400 font-mono">•••• {method.lastFourDigits}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    disabled={stats.transactionCount > 0 || stats.subscriptionCount > 0}
                    title={stats.transactionCount > 0 || stats.subscriptionCount > 0 ? 'No se puede eliminar: tiene transacciones o suscripciones asociadas' : 'Eliminar'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.transactionCount}</p>
                    <p className="text-xs text-slate-500">Transacciones</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.subscriptionCount}</p>
                    <p className="text-xs text-slate-500">Suscripciones</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">{formatCurrency(stats.totalSpent)}</p>
                    <p className="text-xs text-slate-500">Gastado</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {paymentMethods.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          No tienes métodos de pago registrados
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Nuevo Método de Pago</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: BBVA, PayPal, Efectivo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {PAYMENT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
                {(formData.type === 'credit' || formData.type === 'debit') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Últimos 4 dígitos</label>
                    <input type="text" maxLength={4} pattern="\d{4}" value={formData.lastFourDigits} onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value.replace(/\D/g, '') })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="1234" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {CARD_COLORS.map(color => (
                      <button key={color.value} type="button" onClick={() => setFormData({ ...formData, color: color.value })} className={`w-8 h-8 rounded-full transition-transform ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`} style={{ backgroundColor: color.value }} title={color.name} />
                    ))}
                  </div>
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
