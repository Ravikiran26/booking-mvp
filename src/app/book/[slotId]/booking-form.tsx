'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Plan } from '@/lib/types'

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

async function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== 'undefined') {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

export function BookingForm({ plan, amountInr, rate }: { plan: Plan; amountInr: number; rate: number }) {
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
      await loadRazorpay()

      // Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          amountUsd: plan.amountUsd,
          amountInr,
        }),
      })

      if (!orderRes.ok) throw new Error('Failed to create payment order')

      const { orderId, amount, currency } = await orderRes.json()

      // Open Razorpay
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: 'BookingMVP',
        description: plan.name,
        order_id: orderId,
        prefill: { name, email },
        theme: { color: '#000000' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                planName: plan.name,
                amountUsd: plan.amountUsd,
                amountInr,
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

            router.push(`/success?paymentId=${data.paymentId}`)
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
      {/* Plan summary */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
        <div className="font-medium">{plan.name}</div>
        <div className="text-sm text-muted-foreground">{plan.description}</div>
        <div className="pt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">${plan.amountUsd}</span>
          <span className="text-sm text-muted-foreground">
            ≈ ₹{amountInr.toLocaleString('en-IN')} · rate: ₹{rate.toFixed(2)}/$
          </span>
        </div>
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Processing…' : `Pay $${plan.amountUsd} (₹${amountInr.toLocaleString('en-IN')})`}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Indian & international cards · UPI · Netbanking · Wallets — all accepted via Razorpay
      </p>
    </div>
  )
}
