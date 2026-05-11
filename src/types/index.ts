// FinançasPro — Type Definitions

export type AccountType = 'checking' | 'savings' | 'wallet' | 'investment';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other';
export type GoalStatus = 'active' | 'completed' | 'cancelled';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  currency: string;
  theme: ThemeMode;
  onboarding_completed: boolean;
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  bank: string | null;
  initial_balance: number;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  current_balance?: number;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parent_id: string | null;
  is_default: boolean;
  created_at: string;
  // Relations
  subcategories?: Category[];
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  card_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  tags: string[];
  is_recurring: boolean;
  recurrence_type: RecurrenceType | null;
  recurrence_end: string | null;
  installment_number: number | null;
  installment_total: number | null;
  installment_group_id: string | null;
  attachment_url: string | null;
  transfer_to_account_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations (joined)
  account?: Account;
  category?: Category;
  credit_card?: CreditCard;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  brand: CardBrand | null;
  bank?: string | null;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  used_amount?: number;
  available_limit?: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  // Computed
  spent?: number;
  percentage?: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  // Computed
  percentage?: number;
  monthly_needed?: number;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

// Form types
export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  account_id: string;
  category_id: string;
  card_id?: string;
  tags: string[];
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_end?: string;
  installment_total?: number;
  transfer_to_account_id?: string;
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  bank: string;
  initial_balance: number;
  color: string;
  icon: string;
}

export interface CreditCardFormData {
  name: string;
  brand: CardBrand;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
}

export interface BudgetFormData {
  category_id: string;
  amount: number;
  month: number;
  year: number;
}

export interface GoalFormData {
  name: string;
  target_amount: number;
  deadline: string;
  icon: string;
  color: string;
}

// Dashboard summary
export interface DashboardSummary {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthSavings: number;
  incomeChange: number;
  expenseChange: number;
}

export interface CategorySpending {
  name: string;
  value: number;
  color: string;
  icon: string;
  percentage: number;
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expense: number;
}
