import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Payment } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>
}) {
  const { paymentId } = await searchParams

  if (!paymentId) notFound()

  const supabase = createAdminClient()
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (error || !payment) notFound()

  const p = payment as Payment

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-green-100 mb-4">
            <svg className="size-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Payment Confirmed!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your session has been successfully booked.
          </p>
        </div>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Keep this for your records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{p.plan_name}</span>

              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{p.client_name}</span>

              <span className="text-muted-foreground">Email</span>
              <span className="font-medium break-all">{p.client_email}</span>

              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ${p.amount_usd}{' '}
                <span className="text-muted-foreground font-normal">
                  (₹{p.amount_inr.toLocaleString('en-IN')})
                </span>
              </span>

              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-medium text-green-600">
                <span className="size-1.5 rounded-full bg-green-500 inline-block" />
                Confirmed
              </span>

              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-xs break-all">{p.payment_id}</span>
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
