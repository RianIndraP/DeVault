import { supabase } from './supabase.js';

const getUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

const getUserId = async () => {
  const user = await getUser();
  return user?.id || null;
};

const ensureProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
    if (!existing) {
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: user.id,
        user_id: user.id,
        display_name: user.email || 'User'
      });
      if (profileErr) console.warn('[ensureProfile] Could not create profile:', profileErr.message);
    } else if (existing.id !== user.id) {
      const { error: updErr } = await supabase.from('profiles').update({
        id: user.id,
        display_name: user.email || 'User'
      }).eq('user_id', user.id);
      if (updErr) console.warn('[ensureProfile] Could not fix profile id:', updErr.message);
    }
  } catch (e) {
    console.warn('[ensureProfile] Error:', e.message);
  }
};

export const db = {
  async from(table) {
    const userId = await getUserId();
    if (!userId) return { data: null, error: new Error('User not authenticated') };
    await ensureProfile();
    return supabase.from(table).select('*').eq('user_id', userId);
  },

  async insert(table, recordData) {
    const userId = await getUserId();
    if (!userId) return { data: null, error: new Error('User not authenticated') };
    await ensureProfile();
    const record = { ...recordData, user_id: userId };
    const { data, error } = await supabase.from(table).insert([record]).select().single();
    return { data, error };
  },

  async update(table, id, updates) {
    const userId = await getUserId();
    if (!userId) return { data: null, error: new Error('User not authenticated') };
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).eq('user_id', userId).select().single();
    return { data, error };
  },

  async delete(table, id) {
    const userId = await getUserId();
    if (!userId) return { data: null, error: new Error('User not authenticated') };
    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
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
  async create(account) { return db.insert('accounts', account); },
  async update(id, updates) { return db.update('accounts', id, updates); },
  async delete(id) { return db.delete('accounts', id); },
  async updateBalance(id, newBalance) {
    return db.update('accounts', id, { current_balance: newBalance, updated_at: new Date().toISOString() });
  }
};

export const categoryService = {
  async getAll() {
    const result = await db.from('categories');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },
  async create(category) { return db.insert('categories', category); },
  async update(id, updates) { return db.update('categories', id, updates); },
  async delete(id) { return db.delete('categories', id); }
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
      .from('transactions').select('*').eq('user_id', userId)
      .eq('month', month).eq('year', year)
      .order('date', { ascending: false });
    return { data, error };
  },
  async create(transaction) {
    const userId = await getUserId();
    const record = { ...transaction, user_id: userId };
    const { data, error } = await supabase.from('transactions').insert([record]).select().single();
    return { data, error };
  },
  async update(id, updates) { return db.update('transactions', id, updates); },
  async delete(id) { return db.delete('transactions', id); },
  async getItems(transactionId) {
    const { data, error } = await supabase.from('transaction_items').select('*').eq('transaction_id', transactionId);
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
  async create(budget) { return db.insert('budgets', budget); },
  async update(id, updates) { return db.update('budgets', id, updates); },
  async delete(id) { return db.delete('budgets', id); }
};

export const goalService = {
  async getAll() {
    const result = await db.from('goals');
    const { data, error } = await result;
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },
  async create(goal) { return db.insert('goals', goal); },
  async update(id, updates) { return db.update('goals', id, updates); },
  async delete(id) { return db.delete('goals', id); }
};
