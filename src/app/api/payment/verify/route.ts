import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planName,
      amountUsd,
      amountInr,
      clientName,
      clientEmail,
    } = await request.json()

    // Verify HMAC signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return Response.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        plan_name: planName,
        amount_usd: amountUsd,
        amount_inr: amountInr,
        client_name: clientName,
        client_email: clientEmail,
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) {
      console.error('Payment insert error:', error)
      return Response.json({ error: 'Failed to save payment' }, { status: 500 })
    }

    return Response.json({ success: true, paymentId: payment.id })
  } catch (error) {
    console.error('Verify error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
