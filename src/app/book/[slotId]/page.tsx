import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingForm } from './booking-form'
import type { Slot } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function BookPage({
  params,
}: {
  params: Promise<{ slotId: string }>
}) {
  const { slotId } = await params
  const supabase = createAdminClient()

  const { data: slot, error } = await supabase
    .from('slots')
    .select('*')
    .eq('id', slotId)
    .single()

  if (error || !slot) {
    notFound()
  }

  if ((slot as Slot).is_booked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Slot Unavailable</CardTitle>
            <CardDescription>This slot has already been booked.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">View Other Slots</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              ← Back
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">Book a Session</span>
        </div>
      </header>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Complete Your Booking</h1>
          <p className="text-muted-foreground text-sm">
            Enter your details and pay securely to confirm your session.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <BookingForm slot={slot as Slot} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
