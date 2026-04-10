import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogoutButton } from './logout-button'
import type { Payment } from '@/lib/types'

export const dynamic = 'force-dynamic'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/dashboard/login')

  const adminClient = createAdminClient()
  const { data: payments, error } = await adminClient
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  const totalRevenue = (payments as Payment[])?.reduce((sum, p) => sum + p.amount_usd, 0) ?? 0
  const totalInr = (payments as Payment[])?.reduce((sum, p) => sum + p.amount_inr, 0) ?? 0
  const confirmed = (payments as Payment[])?.filter((p) => p.status === 'confirmed').length ?? 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="sm">View Site</Button></Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{payments?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">{confirmed} confirmed</div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">${totalRevenue}</div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (INR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">₹{totalInr.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payments table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Payments</h2>

          {error ? (
            <p className="text-muted-foreground text-sm">Failed to load payments.</p>
          ) : !payments || payments.length === 0 ? (
            <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground">
              <p className="font-medium">No payments yet</p>
              <p className="text-sm mt-1">Payments will appear here once customers complete checkout.</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment ID</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(payments as Payment[]).map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.client_name}</div>
                          <div className="text-muted-foreground text-xs">{p.client_email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{p.plan_name}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">${p.amount_usd}</div>
                          <div className="text-xs text-muted-foreground">₹{p.amount_inr.toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            p.status === 'confirmed'
                              ? 'bg-green-50 text-green-700 ring-green-600/20'
                              : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                          }`}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {p.payment_id}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDateTime(p.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
