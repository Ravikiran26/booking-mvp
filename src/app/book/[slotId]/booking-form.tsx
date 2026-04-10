'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Slot } from '@/lib/types'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

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

export function BookingForm({ slot }: { slot: Slot }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, amount: slot.price }),
      })

      if (!orderRes.ok) {
        throw new Error('Failed to create payment order')
      }

      const { orderId, amount, currency } = await orderRes.json()

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: 'BookingMVP',
        description: slot.title,
        order_id: orderId,
        prefill: { name, email },
        theme: { color: '#000000' },
        handler: async (response: RazorpayResponse) => {
          try {
            // Step 3: Verify payment on server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                slotId: slot.id,
                clientName: name,
                clientEmail: email,
              }),
            })

            const data = await verifyRes.json()

            if (!verifyRes.ok || !data.success) {
              setError('Payment verification failed. Please contact support.')
              setLoading(false)
              return
            }

            // Step 4: Redirect to success
            router.push(`/success?bookingId=${data.bookingId}`)
          } catch {
            setError('Something went wrong after payment. Please contact support.')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
        {/* Slot summary */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
          <div className="font-medium text-base">{slot.title}</div>
          <div className="text-muted-foreground">{formatDate(slot.date)}</div>
          <div className="text-muted-foreground">
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </div>
          <div className="pt-1 font-semibold text-lg">${slot.price} / hr</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing…' : `Pay $${slot.price} via Razorpay`}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Payments are secured by Razorpay. You will receive a confirmation email after booking.
        </p>
      </div>
  )
}
