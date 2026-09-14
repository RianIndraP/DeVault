import { supabase } from './supabase.js';

const getUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

const getUserId = async () => {
  const user = await getUser();
  return user?.id || null;
};

export const db = {
  // Generic fetch
  async from(table) {
    const userId = await getUserId();
    if (!userId) return { data: null, error: new Error('User not authenticated') };
    return supabase.from(table).select('*').eq('user_id', userId);
  },

  // Generic insert
  async insert(table, data) {
    const userId = await getUserId();
    if (!userId) return { data: null, error: new Error('User not authenticated') };
    const record = { ...data, user_id: userId };
    const { data, error } = await supabase.from(table).insert([record]).select().single();
    return { data, error };
  },

  // Generic update
  async update(table, id, updates) {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
    return { data, error };
  },

  // Generic delete
  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  }
};

export const accountService = {
  async getAll() {
    const result = await db.from('accounts');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },

  async create(account) {
    return db.insert('accounts', account);
  },

  async update(id, updates) {
    return db.update('accounts', id, updates);
  },

  async delete(id) {
    return db.delete('accounts', id);
  },

  async updateBalance(id, newBalance) {
    return db.update('accounts', id, {
      current_balance: newBalance,
      updated_at: new Date().toISOString()
    });
  }
};

export const categoryService = {
  async getAll() {
    const result = await db.from('categories');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },

  async create(category) {
    return db.insert('categories', category);
  },

  async update(id, updates) {
    return db.update('categories', id, updates);
  },

  async delete(id) {
    return db.delete('categories', id);
  }
};

export const transactionService = {
  async getAll() {
    const result = await db.from('transactions');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },

  async getByMonth(month, year) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .order('date', { ascending: false });
    return { data, error };
  },

  async create(transaction) {
    const userId = await getUserId();
    const record = { ...transaction, user_id: userId };
    const { data, error } = await supabase.from('transactions').insert([record]).select().single();
    return { data, error };
  },

  async update(id, updates) {
    return db.update('transactions', id, updates);
  },

  async delete(id) {
    return db.delete('transactions', id);
  },

  async getItems(transactionId) {
    const { data, error } = await supabase
      .from('transaction_items')
      .select('*')
      .eq('transaction_id', transactionId);
    return { data, error };
  },

  async addItem(item) {
    const { data, error } = await supabase.from('transaction_items').insert([item]).select().single();
    return { data, error };
  }
};

export const budgetService = {
  async getAll() {
    const result = await db.from('budgets');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },

  async create(budget) {
    return db.insert('budgets', budget);
  },

  async update(id, updates) {
    return db.update('budgets', id, updates);
  },

  async delete(id) {
    return db.delete('budgets', id);
  },

  async getByMonth(month, year) {
    const result = await db.from('budgets');
    const { data, error } = await result;
    if (error) return { data: null, error };
    const filtered = (data || []).filter(b => b.month === month && b.year === year);
    return { data: filtered, error: null };
  }
};

export const goalService = {
  async getAll() {
    const result = await db.from('goals');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },

  async create(goal) {
    return db.insert('goals', goal);
  },

  async update(id, updates) {
    return db.update('goals', id, updates);
  },

  async delete(id) {
    return db.delete('goals', id);
  },

  async addContribution(goalId, amount) {
    const { data, error } = await supabase.rpc('add_goal_contribution', {
      p_goal_id: goalId,
      p_amount: amount
    });
    return { data, error };
  }
};