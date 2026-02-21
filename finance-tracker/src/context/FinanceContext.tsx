import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, Subscription, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  subscriptions: Subscription[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  getPaymentMethodById: (id: string) => PaymentMethod | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setSubscriptions([]);
      setPaymentMethods([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [transRes, subsRes, payRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payment_methods').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      ]);

      if (transRes.data) {
        setTransactions(transRes.data.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          description: t.description,
          category: t.category,
          paymentMethodId: t.payment_method_id,
          date: t.date,
          notes: t.notes,
        })));
      }

      if (subsRes.data) {
        setSubscriptions(subsRes.data.map(s => ({
          id: s.id,
          name: s.name,
          amount: Number(s.amount),
          billingCycle: s.billing_cycle,
          category: s.category,
          paymentMethodId: s.payment_method_id,
          nextBillingDate: s.next_billing_date,
          active: s.active,
          notes: s.notes,
        })));
      }

      if (payRes.data) {
        setPaymentMethods(payRes.data.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          lastFourDigits: p.last_four_digits,
          color: p.color,
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      payment_method_id: transaction.paymentMethodId || null,
      date: transaction.date,
      notes: transaction.notes || null,
    }).select().single();

    if (!error && data) {
      setTransactions(prev => [{
        id: data.id,
        type: data.type,
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        paymentMethodId: data.payment_method_id,
        date: data.date,
        notes: data.notes,
      }, ...prev]);
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      name: subscription.name,
      amount: subscription.amount,
      billing_cycle: subscription.billingCycle,
      category: subscription.category,
      payment_method_id: subscription.paymentMethodId || null,
      next_billing_date: subscription.nextBillingDate,
      active: subscription.active,
      notes: subscription.notes || null,
    }).select().single();

    if (!error && data) {
      setSubscriptions(prev => [{
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        billingCycle: data.billing_cycle,
        category: data.category,
        paymentMethodId: data.payment_method_id,
        nextBillingDate: data.next_billing_date,
        active: data.active,
        notes: data.notes,
      }, ...prev]);
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.paymentMethodId !== undefined) dbUpdates.payment_method_id = updates.paymentMethodId;
    if (updates.nextBillingDate !== undefined) dbUpdates.next_billing_date = updates.nextBillingDate;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from('subscriptions').update(dbUpdates).eq('id', id);
    if (!error) {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (!error) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('payment_methods').insert({
      user_id: user.id,
      name: method.name,
      type: method.type,
      last_four_digits: method.lastFourDigits || null,
      color: method.color,
    }).select().single();

    if (!error && data) {
      setPaymentMethods(prev => [...prev, {
        id: data.id,
        name: data.name,
        type: data.type,
        lastFourDigits: data.last_four_digits,
        color: data.color,
      }]);
    }
  };

  const deletePaymentMethod = async (id: string) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (!error) {
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    }
  };

  const getPaymentMethodById = (id: string) => {
    return paymentMethods.find(m => m.id === id);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        subscriptions,
        paymentMethods,
        loading,
        addTransaction,
        deleteTransaction,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        addPaymentMethod,
        deletePaymentMethod,
        getPaymentMethodById,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
