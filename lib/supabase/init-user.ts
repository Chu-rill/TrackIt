import { SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: '🍔' },
  { name: 'Transportation', type: 'expense', icon: '🚗' },
  { name: 'Shopping', type: 'expense', icon: '🛍️' },
  { name: 'Entertainment', type: 'expense', icon: '🎬' },
  { name: 'Bills & Utilities', type: 'expense', icon: '💡' },
  { name: 'Healthcare', type: 'expense', icon: '🏥' },
  { name: 'Other', type: 'expense', icon: '📦' },
  // Income categories
  { name: 'Salary', type: 'income', icon: '💼' },
  { name: 'Freelance', type: 'income', icon: '💻' },
  { name: 'Investment', type: 'income', icon: '📈' },
  { name: 'Gift', type: 'income', icon: '🎁' },
  { name: 'Other', type: 'income', icon: '💰' },
]

export async function initializeUserCategories(supabase: SupabaseClient, userId: string) {
  // Check if user already has categories
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  // If user already has categories, don't create defaults
  if (existingCategories && existingCategories.length > 0) {
    return
  }

  // Create default categories
  const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
    user_id: userId,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
  }))

  await supabase.from('categories').insert(categoriesToInsert)
}
