import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { bookingId } = await searchParams

  if (!bookingId) {
    notFound()
  }

  const supabase = createAdminClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, slots(title, date, start_time, end_time, price)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    notFound()
  }

  const b = booking as Booking

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success badge */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-green-100 mb-4">
            <svg
              className="size-7 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your session has been successfully booked.
          </p>
        </div>

        {/* Booking details */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Keep this for your records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground">Session</span>
              <span className="font-medium">{b.slots?.title}</span>

              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {b.slots?.date ? formatDate(b.slots.date) : '—'}
              </span>

              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {b.slots?.start_time && b.slots?.end_time
                  ? `${formatTime(b.slots.start_time)} – ${formatTime(b.slots.end_time)}`
                  : '—'}
              </span>

              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">${b.slots?.price ?? '—'}</span>

              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{b.client_name}</span>

              <span className="text-muted-foreground">Email</span>
              <span className="font-medium break-all">{b.client_email}</span>

              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 font-medium text-green-600">
                <span className="size-1.5 rounded-full bg-green-500 inline-block" />
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>

              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-xs break-all">{b.payment_id}</span>
            </div>
          </CardContent>
        </Card>

        <Link href="/" className="block">
          <Button variant="outline" className="w-full">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
