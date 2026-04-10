import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingForm } from './booking-form'
import { PLANS } from '@/lib/types'
import { getLiveRate, usdToInr } from '@/lib/currency'

export default async function BookPage({
  params,
}: {
  params: Promise<{ slotId: string }>
}) {
  const { slotId } = await params
  const plan = PLANS.find((p) => p.id === slotId)

  if (!plan) notFound()

  const rate = await getLiveRate()
  const amountInr = usdToInr(plan.amountUsd, rate)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
          <span className="text-sm text-muted-foreground">Complete Your Booking</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Complete Your Booking</h1>
          <p className="text-muted-foreground text-sm">
            Enter your details and pay securely to confirm your session.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <BookingForm plan={plan} amountInr={amountInr} rate={rate} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
