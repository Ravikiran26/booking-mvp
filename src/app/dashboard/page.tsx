import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogoutButton } from './logout-button'
import type { Booking } from '@/lib/types'

export const dynamic = 'force-dynamic'

function formatTime(time: string) {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m} ${suffix}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

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

  if (!user) {
    redirect('/dashboard/login')
  }

  const adminClient = createAdminClient()
  const { data: bookings, error } = await adminClient
    .from('bookings')
    .select('*, slots(title, date, start_time, end_time, price)')
    .order('created_at', { ascending: false })

  const { data: slotStats } = await adminClient
    .from('slots')
    .select('is_booked')

  const totalSlots = slotStats?.length ?? 0
  const bookedSlots = slotStats?.filter((s) => s.is_booked).length ?? 0
  const totalRevenue = (bookings as Booking[])?.reduce(
    (sum, b) => sum + (b.slots?.price ?? 0),
    0
  ) ?? 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">View Site</Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{bookings?.length ?? 0}</div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Slots Booked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {bookedSlots}
                <span className="text-base font-normal text-muted-foreground"> / {totalSlots}</span>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">${totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Bookings</h2>

          {error ? (
            <p className="text-muted-foreground text-sm">Failed to load bookings.</p>
          ) : !bookings || bookings.length === 0 ? (
            <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground">
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm mt-1">Bookings will appear here once clients start booking sessions.</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Session</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Booked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(bookings as Booking[]).map((booking) => (
                      <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{booking.client_name}</div>
                          <div className="text-muted-foreground text-xs">{booking.client_email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {booking.slots?.title ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {booking.slots?.date ? (
                            <>
                              <div>{formatDate(booking.slots.date)}</div>
                              <div className="text-xs">
                                {booking.slots.start_time && booking.slots.end_time
                                  ? `${formatTime(booking.slots.start_time)} – ${formatTime(booking.slots.end_time)}`
                                  : ''}
                              </div>
                            </>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ${booking.slots?.price ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              booking.status === 'confirmed'
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDateTime(booking.created_at)}
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
