'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usdToInr } from '@/lib/currency'
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

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [discountUsd, setDiscountUsd] = useState(0)

  const finalAmountUsd = plan.amountUsd - discountUsd
  const finalAmountInr = discountUsd > 0 ? usdToInr(finalAmountUsd, rate) : amountInr

  async function handleApplyCoupon() {
    setCouponError('')
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amountUsd: plan.amountUsd }),
      })
      const data = await res.json()
      if (!data.valid) {
        setCouponError(data.message ?? 'Invalid coupon code')
        setDiscountUsd(0)
      } else {
        setDiscountUsd(data.discountUsd)
        setCouponError('')
      }
    } catch {
      setCouponError('Could not apply coupon. Try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setDiscountUsd(0)
    setCouponError('')
  }

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

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          amountUsd: finalAmountUsd,
          amountInr: finalAmountInr,
        }),
      })

      if (!orderRes.ok) throw new Error('Failed to create payment order')

      const { orderId, amount, currency } = await orderRes.json()

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
                amountUsd: finalAmountUsd,
                amountInr: finalAmountInr,
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

            const params = new URLSearchParams({
              paymentId: data.paymentId,
              plan: data.planName,
              amountUsd: String(data.amountUsd),
              amountInr: String(data.amountInr),
              name: data.clientName,
              email: data.clientEmail,
            })
            router.push(`/success?${params.toString()}`)
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
          {discountUsd > 0 ? (
            <>
              <span className="text-2xl font-bold">${finalAmountUsd}</span>
              <span className="text-sm line-through text-muted-foreground">${plan.amountUsd}</span>
              <span className="text-sm text-green-600 font-medium">-${discountUsd} off</span>
            </>
          ) : (
            <span className="text-2xl font-bold">${plan.amountUsd}</span>
          )}
          <span className="text-sm text-muted-foreground">
            ≈ ₹{finalAmountInr.toLocaleString('en-IN')} · rate: ₹{rate.toFixed(2)}/$
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

        {/* Coupon */}
        <div className="space-y-1.5">
          <Label htmlFor="coupon">Coupon Code (optional)</Label>
          {discountUsd > 0 ? (
            <div className="flex items-center gap-2 rounded-md border border-green-500 bg-green-50 px-3 py-2">
              <span className="text-sm text-green-700 font-medium flex-1">
                "{couponCode.toUpperCase()}" applied — ${discountUsd} off
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                id="coupon"
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                disabled={loading || couponLoading}
                className="uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponLoading || loading}
              >
                {couponLoading ? '…' : 'Apply'}
              </Button>
            </div>
          )}
          {couponError && <p className="text-sm text-destructive">{couponError}</p>}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading
            ? 'Processing…'
            : `Pay $${finalAmountUsd} (₹${finalAmountInr.toLocaleString('en-IN')})`}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Indian & international cards · UPI · Netbanking · Wallets — all accepted via Razorpay
      </p>
    </div>
  )
}
