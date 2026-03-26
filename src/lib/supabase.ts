import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgmnurmrzfazggjilcbx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mXJ-fd8lnYzvx5GTWLUmpQ_auv3xDsV'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getAccounts() {
  const { data, error } = await supabase.from('sp_accounts').select('*').order('created_at')
  if (error) console.error('Error fetching accounts:', error)
  return data || []
}

export async function getPendingContent(accountId: string) {
  const { data, error } = await supabase
    .from('sp_content')
    .select('*')
    .eq('account_id', accountId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) console.error('Error fetching content:', error)
  return data || []
}

export async function updateContentStatus(id: string, status: string) {
  const { error } = await supabase.from('sp_content').update({ status }).eq('id', id)
  if (error) console.error('Error updating status:', error)
}

export async function getContentCounts() {
  const { data, error } = await supabase.from('sp_content').select('account_id').eq('status', 'pending')
  if (error) return {}
  const counts: Record<string, number> = {}
  data?.forEach(item => { counts[item.account_id] = (counts[item.account_id] || 0) + 1 })
  return counts
}
