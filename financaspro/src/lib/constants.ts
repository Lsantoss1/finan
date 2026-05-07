import { type CategoryType } from '@/types';

export const APP_NAME = 'FinançasPro';
export const DEFAULT_CURRENCY = 'BRL';

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Conta Corrente', icon: 'building-2' },
  { value: 'savings', label: 'Poupança', icon: 'piggy-bank' },
  { value: 'wallet', label: 'Carteira', icon: 'wallet' },
  { value: 'investment', label: 'Investimento', icon: 'trending-up' },
] as const;

export const CARD_BRANDS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'other', label: 'Outra' },
] as const;

export const BANKS = [
  'Nubank', 'Inter', 'Itaú', 'Bradesco', 'Banco do Brasil',
  'Santander', 'Caixa', 'C6 Bank', 'BTG Pactual', 'Sicredi',
  'Sicoob', 'PagBank', 'Neon', 'Next', 'Original', 'Outro',
];

export interface DefaultCategory {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Despesas
  { name: 'Alimentação', type: 'expense', icon: 'utensils', color: '#FF6B6B' },
  { name: 'Moradia', type: 'expense', icon: 'home', color: '#4ECDC4' },
  { name: 'Transporte', type: 'expense', icon: 'car', color: '#45B7D1' },
  { name: 'Saúde', type: 'expense', icon: 'heart-pulse', color: '#96CEB4' },
  { name: 'Educação', type: 'expense', icon: 'graduation-cap', color: '#FFEAA7' },
  { name: 'Lazer', type: 'expense', icon: 'gamepad-2', color: '#DDA0DD' },
  { name: 'Vestuário', type: 'expense', icon: 'shirt', color: '#F0E68C' },
  { name: 'Compras', type: 'expense', icon: 'shopping-bag', color: '#FFB347' },
  { name: 'Contas & Serviços', type: 'expense', icon: 'receipt', color: '#87CEEB' },
  { name: 'Tecnologia', type: 'expense', icon: 'smartphone', color: '#B0C4DE' },
  { name: 'Presentes', type: 'expense', icon: 'gift', color: '#FFB6C1' },
  { name: 'Pets', type: 'expense', icon: 'paw-print', color: '#DEB887' },
  { name: 'Outros (Despesa)', type: 'expense', icon: 'circle-dot', color: '#C0C0C0' },
  // Receitas
  { name: 'Salário', type: 'income', icon: 'briefcase', color: '#22C55E' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#10B981' },
  { name: 'Investimentos', type: 'income', icon: 'trending-up', color: '#059669' },
  { name: 'Vendas', type: 'income', icon: 'store', color: '#34D399' },
  { name: 'Presente Recebido', type: 'income', icon: 'gift', color: '#6EE7B7' },
  { name: 'Outros (Receita)', type: 'income', icon: 'circle-dot', color: '#A7F3D0' },
];

export const COLOR_PALETTE = [
  '#6C3CE0', '#4A1DB0', '#FFB800', '#22C55E', '#EF4444',
  '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#F0E68C', '#FFB347', '#87CEEB', '#B0C4DE',
];

export const ICON_OPTIONS = [
  'wallet', 'piggy-bank', 'building-2', 'trending-up', 'banknote',
  'credit-card', 'coins', 'landmark', 'briefcase', 'shopping-bag',
  'home', 'car', 'utensils', 'heart-pulse', 'graduation-cap',
  'gamepad-2', 'shirt', 'gift', 'smartphone', 'receipt',
  'plane', 'palm-tree', 'sparkles', 'target', 'flag',
  'star', 'trophy', 'gem', 'crown', 'zap',
];

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];
