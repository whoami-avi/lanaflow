export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit' | 'debit' | 'cash' | 'digital';
  lastFourDigits?: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  paymentMethodId?: string;
  date: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  category: string;
  paymentMethodId: string;
  nextBillingDate: string;
  active: boolean;
  notes?: string;
}

export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Ropa',
  'Hogar',
  'Servicios',
  'Suscripciones',
  'Otros'
];

export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Regalos',
  'Otros'
];

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Software',
  'Gaming',
  'Música',
  'Noticias',
  'Fitness',
  'Almacenamiento',
  'Otros'
];
