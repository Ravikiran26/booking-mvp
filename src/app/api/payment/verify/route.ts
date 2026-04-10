import crypto from 'crypto'

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

    return Response.json({
      success: true,
      paymentId: razorpay_payment_id,
      planName,
      amountUsd,
      amountInr,
      clientName,
      clientEmail,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
